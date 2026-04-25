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

    const cookieBase = 'HttpOnly; Secure; SameSite=Lax; Path=/'
    // 30 days for both — server still respects underlying token expiry by
    // refreshing on 401, but a longer cookie lifetime keeps the refresh
    // token reachable across Safari sessions.
    res.setHeader('Set-Cookie', [
      `whoop_access_token=${tokens.access_token}; Max-Age=2592000; ${cookieBase}`,
      `whoop_refresh_token=${tokens.refresh_token}; Max-Age=2592000; ${cookieBase}`,
    ])
    res.writeHead(302, { Location: '/?whoop=connected' })
    res.end()
  } catch (e) {
    console.error('Whoop callback error:', e)
    res.writeHead(302, { Location: '/?whoop=error' })
    res.end()
  }
}
