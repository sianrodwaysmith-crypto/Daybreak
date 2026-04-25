export default async function handler(req: any, res: any) {
  const code = req.query?.code as string | undefined

  if (!code) {
    res.writeHead(302, { Location: '/?whoop=cancelled' })
    res.end()
    return
  }

  const protocol = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const host = req.headers.host as string
  const redirectUri = `${protocol}://${host}/api/whoop/callback`

  try {
    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     process.env.VITE_WHOOP_CLIENT_ID    ?? '',
      client_secret: process.env.WHOOP_CLIENT_SECRET ?? '',
    })

    const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    })

    if (!tokenRes.ok) {
      console.error('Whoop token exchange failed:', tokenRes.status, await tokenRes.text())
      res.writeHead(302, { Location: '/?whoop=error' })
      res.end()
      return
    }

    const tokens = await tokenRes.json() as {
      access_token:  string
      refresh_token: string
      expires_in:    number
    }

    const cookieBase = 'HttpOnly; Secure; SameSite=Lax; Path=/'
    res.setHeader('Set-Cookie', [
      `whoop_access_token=${tokens.access_token}; Max-Age=${tokens.expires_in}; ${cookieBase}`,
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
