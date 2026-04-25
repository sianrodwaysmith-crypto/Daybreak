export default async function handler(req: any, res: any) {
  const code         = req.query?.code              as string | undefined
  const oauthError   = req.query?.error             as string | undefined
  const oauthErrDesc = req.query?.error_description as string | undefined

  if (oauthError) {
    const detail = encodeURIComponent(oauthErrDesc ?? oauthError)
    res.writeHead(302, { Location: `/?whoop=error&reason=${detail}` })
    res.end()
    return
  }

  if (!code) {
    res.writeHead(302, { Location: '/?whoop=cancelled' })
    res.end()
    return
  }

  const protocol = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const host = req.headers.host as string
  const redirectUri = `${protocol}://${host}/api/whoop/callback`

  try {
    const clientId     = (process.env.VITE_WHOOP_CLIENT_ID    ?? '').trim()
    const clientSecret = (process.env.WHOOP_CLIENT_SECRET ?? '').trim()

    if (!clientId || !clientSecret) {
      const detail = encodeURIComponent(
        `creds-missing id_len=${clientId.length} secret_len=${clientSecret.length}`
      )
      res.writeHead(302, { Location: `/?whoop=error&reason=${detail}` })
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

    const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('Whoop token exchange failed:', tokenRes.status, errBody)
      const idHint = clientId.length > 6 ? `${clientId.slice(0, 4)}…${clientId.slice(-2)}` : '(short)'
      const detail = encodeURIComponent(
        `token-${tokenRes.status} ` +
        `id=${idHint} ` +
        `secret_len=${clientSecret.length} ` +
        `redirect=${redirectUri} ` +
        `host=${host}: ${errBody.slice(0, 120)}`
      )
      res.writeHead(302, { Location: `/?whoop=error&reason=${detail}` })
      res.end()
      return
    }

    const tokens = await tokenRes.json() as {
      access_token:  string
      refresh_token: string
      expires_in:    number
    }

    // Store tokens in localStorage (cookies are dropped by Safari ITP after
    // an OAuth redirect chain). The HTML below writes them, then redirects.
    const stored = JSON.stringify({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at:    Date.now() + tokens.expires_in * 1000,
    })

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Connecting…</title>
<style>body{background:#080810;color:#fff;font:14px -apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}</style>
</head><body><div>Connecting Whoop…</div>
<script>
try {
  localStorage.setItem('daybreak-whoop-tokens', ${JSON.stringify(stored)});
  setTimeout(function(){window.location.replace('/?whoop=connected')}, 50);
} catch (e) {
  window.location.replace('/?whoop=error&reason=' + encodeURIComponent('localStorage: ' + (e && e.message)));
}
</script>
</body></html>`

    res.writeHead(200, {
      'Content-Type':  'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    res.end(html)
  } catch (e: any) {
    console.error('Whoop callback error:', e)
    res.writeHead(302, { Location: `/?whoop=error&reason=${encodeURIComponent(e?.message ?? 'unknown')}` })
    res.end()
  }
}
