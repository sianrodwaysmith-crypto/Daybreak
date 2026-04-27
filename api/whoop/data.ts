async function exchangeRefresh(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<{ access_token: string; refresh_token: string; expires_in: number } | null> {
  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
    redirect_uri:  redirectUri,
    client_id:     clientId,
    client_secret: clientSecret,
  })
  const res = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })
  if (!res.ok) return null
  return res.json() as any
}

export default async function handler(req: any, res: any) {
  // Disconnect — client just clears localStorage; no server state to clean up.
  if (req.method === 'DELETE') {
    res.status(200).json({ ok: true })
    return
  }

  const authHeader   = (req.headers.authorization as string | undefined) ?? ''
  const accessToken  = authHeader.replace(/^Bearer\s+/i, '').trim() || undefined
  const refreshToken = (req.headers['x-whoop-refresh-token'] as string | undefined)?.trim() || undefined

  if (!accessToken && !refreshToken) {
    res.status(401).json({ error: 'not_connected' })
    return
  }

  const protocol     = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const host         = req.headers.host as string
  const redirectUri  = `${protocol}://${host}/api/whoop/callback`
  const clientId     = (process.env.VITE_WHOOP_CLIENT_ID    ?? '').trim()
  const clientSecret = (process.env.WHOOP_CLIENT_SECRET ?? '').trim()

  let currentAccess: string | undefined = accessToken
  let returnedTokens: { access_token: string; refresh_token: string; expires_in: number } | null = null

  // Pre-emptive refresh if we don't have an access token.
  if (!currentAccess && refreshToken) {
    const newTokens = await exchangeRefresh(refreshToken, clientId, clientSecret, redirectUri)
    if (!newTokens) {
      res.status(401).json({ error: 'not_connected' })
      return
    }
    currentAccess  = newTokens.access_token
    returnedTokens = newTokens
  }

  const authHeaders = { Authorization: `Bearer ${currentAccess}` }

  // Whoop deprecated /developer/v1/recovery and /developer/v1/activity/sleep
  // (the cycle endpoint is on a longer runway but v2 is the supported path
  // for everything now). Switching all three to v2 in lockstep.
  // Cycle is fetched at limit=14 so the Movement trends modal can render
  // a 14-day active-calories chart without a second round-trip.
  let [recovRes, sleepRes, cycleRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v2/recovery?limit=1',        { headers: authHeaders }),
    fetch('https://api.prod.whoop.com/developer/v2/activity/sleep?limit=1',  { headers: authHeaders }),
    fetch('https://api.prod.whoop.com/developer/v2/cycle?limit=14',          { headers: authHeaders }),
  ])

  // If access token was rejected mid-flight, refresh and retry.
  if ([recovRes, sleepRes, cycleRes].some(r => r.status === 401) && refreshToken) {
    const newTokens = await exchangeRefresh(refreshToken, clientId, clientSecret, redirectUri)
    if (!newTokens) {
      res.status(401).json({ error: 'not_connected' })
      return
    }
    returnedTokens = newTokens
    const newHeader = { Authorization: `Bearer ${newTokens.access_token}` }
    ;[recovRes, sleepRes, cycleRes] = await Promise.all([
      fetch('https://api.prod.whoop.com/developer/v2/recovery?limit=1',        { headers: newHeader }),
      fetch('https://api.prod.whoop.com/developer/v2/activity/sleep?limit=1',  { headers: newHeader }),
      fetch('https://api.prod.whoop.com/developer/v2/cycle?limit=14',          { headers: newHeader }),
    ])
  }

  try {
    const [recovData, sleepData, cycleData] = await Promise.all([
      recovRes.ok ? recovRes.json() : Promise.resolve(null),
      sleepRes.ok ? sleepRes.json() : Promise.resolve(null),
      cycleRes.ok ? cycleRes.json() : Promise.resolve(null),
    ])

    // Capture error bodies from any non-OK responses so the client can
    // show them in the Whoop diagnostic panel.
    const errorBodies: Record<string, string> = {}
    async function captureError(name: string, response: Response) {
      if (response.ok) return
      try { errorBodies[name] = (await response.text()).slice(0, 240) }
      catch { errorBodies[name] = '<unreadable>' }
    }
    await Promise.all([
      captureError('recovery', recovRes),
      captureError('sleep',    sleepRes),
      captureError('cycle',    cycleRes),
    ])

    // If any endpoint returned 429, surface the Retry-After header (in
    // seconds) so the client can hold off until Whoop's cool-down clears.
    let retryAfterSecs: number | undefined
    for (const r of [recovRes, sleepRes, cycleRes]) {
      if (r.status !== 429) continue
      const ra = r.headers.get('retry-after')
      if (!ra) continue
      // Retry-After can be either seconds or an HTTP date.
      const asNumber = Number(ra)
      if (!Number.isNaN(asNumber)) retryAfterSecs = Math.max(retryAfterSecs ?? 0, asNumber)
      else {
        const t = Date.parse(ra)
        if (!Number.isNaN(t)) retryAfterSecs = Math.max(retryAfterSecs ?? 0, Math.ceil((t - Date.now()) / 1000))
      }
    }

    const rec   = (recovData as any)?.records?.[0]
    const sleep = (sleepData as any)?.records?.[0]
    const cycleRecords = ((cycleData as any)?.records ?? []) as Array<{
      start?: string
      end?:   string
      score?: { strain?: number; average_heart_rate?: number; max_heart_rate?: number; kilojoule?: number }
    }>
    const cycle = cycleRecords[0]

    const stage = sleep?.score?.stage_summary
    const toHours = (ms: number | null | undefined): number | null =>
      ms != null ? Math.round((ms / 3_600_000) * 10) / 10 : null
    const round1 = (n: number | null | undefined): number | null =>
      n != null ? Math.round(n * 10) / 10 : null
    // Whoop returns the sleep percentages as floats with several
    // decimal places (e.g. 87.456789). They display as percentages and
    // also ride along in the chat LLM context, so rounding to integer
    // both tidies the UI and trims tokens off every chat message.
    const roundInt = (n: number | null | undefined): number | null =>
      n != null ? Math.round(n) : null
    // Active calories: Whoop reports kilojoules. 1 kcal = 4.184 kJ.
    const kjToKcal = (kj: number | null | undefined): number | null =>
      kj != null ? Math.round(kj / 4.184) : null

    // Each cycle's "date" for charting purposes is the local date the
    // cycle started — Whoop cycles run wake-to-wake, but UI-wise the
    // user thinks of them as days.
    const cycleHistory = cycleRecords.map(c => ({
      date:   (c.start ?? '').slice(0, 10),
      strain: round1(c.score?.strain),
      kcal:   kjToKcal(c.score?.kilojoule),
    })).filter(c => !!c.date)

    const payload: any = {
      connected:        true,
      recovery:         rec?.score?.recovery_score              ?? null,
      hrv:              round1(rec?.score?.hrv_rmssd_milli),
      rhr:              rec?.score?.resting_heart_rate          ?? null,
      sleep:            roundInt(sleep?.score?.sleep_performance_percentage),
      sleepEfficiency:  roundInt(sleep?.score?.sleep_efficiency_percentage),
      sleepConsistency: roundInt(sleep?.score?.sleep_consistency_percentage),
      sleepHours:       toHours(stage?.total_in_bed_time_milli),
      remHours:         toHours(stage?.total_rem_sleep_time_milli),
      deepHours:        toHours(stage?.total_slow_wave_sleep_time_milli),
      strain:           round1(cycle?.score?.strain),
      avgHr:            cycle?.score?.average_heart_rate ?? null,
      maxHr:            cycle?.score?.max_heart_rate     ?? null,
      activeCalories:   kjToKcal(cycle?.score?.kilojoule),
      cycleHistory,
      _debug: {
        recoveryStatus: recovRes.status,
        sleepStatus:    sleepRes.status,
        cycleStatus:    cycleRes.status,
        recoveryHasRecord: !!rec,
        sleepHasRecord:    !!sleep,
        cycleHasRecord:    !!cycle,
        errors:         Object.keys(errorBodies).length > 0 ? errorBodies : undefined,
        retryAfter:     retryAfterSecs,
        ts:             new Date().toISOString(),
      },
    }

    if (returnedTokens) {
      payload.tokens = {
        access_token:  returnedTokens.access_token,
        refresh_token: returnedTokens.refresh_token,
        expires_in:    returnedTokens.expires_in,
      }
    }

    res.status(200).json(payload)
  } catch (e) {
    console.error('Whoop data parse error:', e)
    res.status(500).json({ error: 'parse_failed' })
  }
}
