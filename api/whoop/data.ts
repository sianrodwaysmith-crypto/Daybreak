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

  let [recovRes, sleepRes, cycleRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1',       { headers: authHeaders }),
    fetch('https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1', { headers: authHeaders }),
    fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=1',          { headers: authHeaders }),
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
      fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1',       { headers: newHeader }),
      fetch('https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1', { headers: newHeader }),
      fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=1',          { headers: newHeader }),
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
    const cycle = (cycleData as any)?.records?.[0]

    const stage = sleep?.score?.stage_summary
    const toHours = (ms: number | null | undefined): number | null =>
      ms != null ? Math.round((ms / 3_600_000) * 10) / 10 : null
    const round1 = (n: number | null | undefined): number | null =>
      n != null ? Math.round(n * 10) / 10 : null

    const payload: any = {
      connected:        true,
      recovery:         rec?.score?.recovery_score              ?? null,
      hrv:              round1(rec?.score?.hrv_rmssd_milli),
      rhr:              rec?.score?.resting_heart_rate          ?? null,
      sleep:            sleep?.score?.sleep_performance_percentage ?? null,
      sleepEfficiency:  sleep?.score?.sleep_efficiency_percentage  ?? null,
      sleepConsistency: sleep?.score?.sleep_consistency_percentage ?? null,
      sleepHours:       toHours(stage?.total_in_bed_time_milli),
      remHours:         toHours(stage?.total_rem_sleep_time_milli),
      deepHours:        toHours(stage?.total_slow_wave_sleep_time_milli),
      strain:           round1(cycle?.score?.strain),
      avgHr:            cycle?.score?.average_heart_rate ?? null,
      maxHr:            cycle?.score?.max_heart_rate     ?? null,
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
