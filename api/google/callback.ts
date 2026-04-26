/**
 * Google OAuth callback. Mirrors the Whoop callback flow:
 *   1. User taps Connect → app redirects to Google's authorise screen.
 *   2. Google redirects here with ?code=...
 *   3. We POST to Google's token endpoint with the client secret to
 *      exchange the code for an access_token + refresh_token.
 *   4. Tokens are written to localStorage by the returned HTML page,
 *      then the page redirects back to the app with ?gcal=connected.
 *
 * Tokens stay client-side so the rest of the calendar fetch flow can run
 * direct from the browser through /api/google/events; no server-side
 * session storage needed.
 */
export default async function handler(req: any, res: any) {
  const code         = req.query?.code              as string | undefined
  const oauthError   = req.query?.error             as string | undefined
  const oauthErrDesc = req.query?.error_description as string | undefined

  if (oauthError) {
    const detail = encodeURIComponent(oauthErrDesc ?? oauthError)
    res.writeHead(302, { Location: `/?gcal=error&reason=${detail}` })
    res.end()
    return
  }

  if (!code) {
    res.writeHead(302, { Location: '/?gcal=cancelled' })
    res.end()
    return
  }

  const protocol    = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const host        = req.headers.host as string
  const redirectUri = `${protocol}://${host}/api/google/callback`

  try {
    const clientId     = (process.env.VITE_GOOGLE_CLIENT_ID    ?? '').trim()
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET ?? '').trim()

    if (!clientId || !clientSecret) {
      const detail = encodeURIComponent(
        `creds-missing id_len=${clientId.length} secret_len=${clientSecret.length}`
      )
      res.writeHead(302, { Location: `/?gcal=error&reason=${detail}` })
      res.end()
      return
    }

    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     clientId,
      client_secret: clientSecret,
    })

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('Google token exchange failed:', tokenRes.status, errBody)
      const idHint = clientId.length > 6 ? `${clientId.slice(0, 4)}…${clientId.slice(-2)}` : '(short)'
      const detail = encodeURIComponent(
        `token-${tokenRes.status} ` +
        `id=${idHint} ` +
        `secret_len=${clientSecret.length} ` +
        `redirect=${redirectUri}: ${errBody.slice(0, 160)}`
      )
      res.writeHead(302, { Location: `/?gcal=error&reason=${detail}` })
      res.end()
      return
    }

    const tokens = await tokenRes.json() as {
      access_token:   string
      refresh_token?: string
      expires_in:     number
    }

    // Google only returns a refresh_token on the FIRST consent. If the user
    // has authorised before, only access_token comes back. We stash whatever
    // we get; if there's no refresh_token, the next access expiry will force
    // a re-auth, which the user can do via the Connect button again.
    const stored = JSON.stringify({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? '',
      expires_at:    Date.now() + tokens.expires_in * 1000,
    })

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Connecting…</title>
<style>body{background:#f4f1ea;color:#0a0a0a;font:14px -apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}</style>
</head><body><div>Connecting Google…</div>
<script>
try {
  localStorage.setItem('daybreak-google-tokens', ${JSON.stringify(stored)});
  setTimeout(function(){window.location.replace('/?gcal=connected')}, 50);
} catch (e) {
  window.location.replace('/?gcal=error&reason=' + encodeURIComponent('localStorage: ' + (e && e.message)));
}
</script>
</body></html>`

    res.writeHead(200, {
      'Content-Type':  'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    res.end(html)
  } catch (e: any) {
    console.error('Google callback error:', e)
    res.writeHead(302, { Location: `/?gcal=error&reason=${encodeURIComponent(e?.message ?? 'unknown')}` })
    res.end()
  }
}
