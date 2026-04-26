/**
 * Refresh a Google access token using the stored refresh token.
 * Used by client-side code (e.g. GoogleDriveMomentsStorage) that talks
 * directly to Google APIs but needs to renew its bearer token without
 * exposing the OAuth client secret in the browser bundle.
 *
 * Client sends the refresh_token in the X-Google-Refresh-Token header
 * (not query string, not body, so it doesn't leak into request logs as
 * easily). Server forwards to Google's token endpoint with the secret.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const refreshToken = (req.headers['x-google-refresh-token'] as string | undefined)?.trim()
  if (!refreshToken) {
    res.status(400).json({ error: 'no_refresh_token' })
    return
  }

  const clientId     = (process.env.VITE_GOOGLE_CLIENT_ID    ?? '').trim()
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET ?? '').trim()
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'creds_missing' })
    return
  }

  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
    client_id:     clientId,
    client_secret: clientSecret,
  })

  let tokenRes: Response
  try {
    tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    })
  } catch (e: any) {
    res.status(502).json({ error: 'network', detail: e?.message ?? 'unknown' })
    return
  }

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => '')
    res.status(tokenRes.status).json({
      error:  'refresh_failed',
      status: tokenRes.status,
      detail: text.slice(0, 240),
    })
    return
  }

  const json = await tokenRes.json() as { access_token: string; expires_in: number }
  res.status(200).json({
    access_token: json.access_token,
    expires_in:   json.expires_in,
  })
}
