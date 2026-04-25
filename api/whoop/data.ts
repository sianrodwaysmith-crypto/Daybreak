function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {}
  return Object.fromEntries(
    header.split(';').map(part => {
      const idx = part.indexOf('=')
      if (idx < 0) return [part.trim(), '']
      return [part.slice(0, idx).trim(), part.slice(idx + 1).trim()]
    })
  )
}

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
  // Disconnect / logout
  if (req.method === 'DELETE') {
    const clear = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    res.setHeader('Set-Cookie', [
      `whoop_access_token=; ${clear}`,
      `whoop_refresh_token=; ${clear}`,
    ])
    res.status(200).json({ ok: true })
    return
  }

  const cookies = parseCookies(req.headers.cookie)
  let accessToken: string | undefined  = cookies.whoop_access_token
  const refreshToken: string | undefined = cookies.whoop_refresh_token

  if (!accessToken && !refreshToken) {
    res.status(401).json({ error: 'not_connected' })
    return
  }

  const protocol    = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const host        = req.headers.host as string
  const redirectUri = `${protocol}://${host}/api/whoop/callback`
  const clientId     = process.env.VITE_WHOOP_CLIENT_ID    ?? ''
  const clientSecret = process.env.WHOOP_CLIENT_SECRET ?? ''
  const cookieBase   = 'HttpOnly; Secure; SameSite=Lax; Path=/'

  // Pre-emptive refresh if no access token
  if (!accessToken && refreshToken) {
    const newTokens = await exchangeRefresh(refreshToken, clientId, clientSecret, redirectUri)
    if (!newTokens) {
      res.status(401).json({ error: 'not_connected' })
      return
    }
    accessToken = newTokens.access_token
    res.setHeader('Set-Cookie', [
      `whoop_access_token=${accessToken}; Max-Age=2592000; ${cookieBase}`,
      `whoop_refresh_token=${newTokens.refresh_token}; Max-Age=2592000; ${cookieBase}`,
    ])
  }

  const authHeaders = { Authorization: `Bearer ${accessToken}` }

  let [recovRes, sleepRes, cycleRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1',       { headers: authHeaders }),
    fetch('https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1', { headers: authHeaders }),
    fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=1',          { headers: authHeaders }),
  ])

  // If any response is 401 and we have a refresh token, refresh and retry
  if ([recovRes, sleepRes, cycleRes].some(r => r.status === 401) && refreshToken) {
    const newTokens = await exchangeRefresh(refreshToken, clientId, clientSecret, redirectUri)
    if (!newTokens) {
      res.status(401).json({ error: 'not_connected' })
      return
    }
    const newHeader = { Authorization: `Bearer ${newTokens.access_token}` }
    res.setHeader('Set-Cookie', [
      `whoop_access_token=${newTokens.access_token}; Max-Age=2592000; ${cookieBase}`,
      `whoop_refresh_token=${newTokens.refresh_token}; Max-Age=2592000; ${cookieBase}`,
    ])
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

    const rec   = (recovData as any)?.records?.[0]
    const sleep = (sleepData as any)?.records?.[0]
    const cycle = (cycleData as any)?.records?.[0]

    const stage = sleep?.score?.stage_summary
    const toHours = (ms: number | null | undefined): number | null =>
      ms != null ? Math.round((ms / 3_600_000) * 10) / 10 : null
    const round1 = (n: number | null | undefined): number | null =>
      n != null ? Math.round(n * 10) / 10 : null

    res.status(200).json({
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
    })
  } catch (e) {
    console.error('Whoop data parse error:', e)
    res.status(500).json({ error: 'parse_failed' })
  }
}
