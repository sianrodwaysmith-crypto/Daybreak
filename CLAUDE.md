# Daybreak — Notes for Claude

## Deployment

Production = https://daybreak-three.vercel.app/ — built by Vercel from the
**`main`** branch. Pushes to other branches build as Preview deployments only;
they never become the live site until merged into `main`.

The visible build stamp at the bottom-right of the live app (e.g.
`2026-04-26 22:14`) comes from `vite.config.ts` and is the source of truth for
"is the latest deploy actually live?". If the stamp lags behind your last
commit by more than a few minutes, the deploy did not ship.

## Workflow Claude sessions must follow

Each Claude Code session is given its own feature branch named
`claude/<task>-<id>`. **Commits on that branch do not reach production by
themselves.** When a session is wrapping up:

1. Confirm everything is committed and the branch is pushed to `origin`.
2. Surface the exact PR URL to the user:
   `https://github.com/sianrodwaysmith-crypto/Daybreak/pull/new/<branch>`
3. State plainly that production won't update until the PR is merged into
   `main` — don't assume the user knows.
4. If a previous session left a long-lived feature branch (e.g.
   `claude/ui-overhaul`) ahead of `main`, flag it. Production has been silently
   stuck behind that branch before.

Do **not** push directly to `main` from a Claude session unless the user
explicitly authorises it for that session. Branches are cheap; surprises on
production are not.

## Caching

`public/sw.js` uses a versioned cache name (`daybreak-vNN`). Bump it on any
deploy that changes JS/CSS so installed PWAs evict the prior bundle. Companion
HTTP-side cache rules live in `vercel.json` — `/sw.js`, `/index.html`, and
`/manifest.json` are served `no-cache` so a fresh deploy is picked up on the
next visit, not after the browser's default 24h cache expiry.

If a future change adds a new always-fresh asset (e.g. a `version.json`
endpoint), add it to `vercel.json` headers too.

## Build

`npm run build` runs `tsc -b && vite build`. The TS step only type-checks
`src/` (per `tsconfig.app.json` `include`). Files in `api/` are not part of the
local build — Vercel compiles them as serverless functions on deploy. A clean
local build is necessary but not sufficient; if `api/*.ts` has a syntax error,
the local build still passes but the Vercel deploy will fail.

## API routes

`api/google/` and `api/whoop/` are Vercel serverless functions (the default
export is a `(req, res)` handler). Env vars used:

- `VITE_GOOGLE_CLIENT_ID` (also exposed to the client via Vite)
- `GOOGLE_CLIENT_SECRET` (server-only)
- Whoop client id / secret — see `api/whoop/callback.ts`

These live in Vercel project settings → Environment Variables, **not** in a
committed `.env` (which is gitignored). After rotating any secret, redeploy or
the running function instance keeps the old value cached for a while.

## Module boundaries

`src/lessons/` is a sealed module: nothing outside it imports from anywhere
except `src/lessons/index.ts`. Preserve this. User-facing strings live in
`src/lessons/copy.ts`.
