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
`claude/<task>-<id>`. The user has standing authorisation for Claude to
open and **squash-merge** its own PRs into `main` via the GitHub MCP — do
this as part of wrapping up the session, don't make the user click merge.

When a session is wrapping up:

1. Confirm everything is committed and the branch is pushed to `origin`.
2. Open a PR into `main` (`mcp__github__create_pull_request`) and squash-
   merge it (`mcp__github__merge_pull_request`, `merge_method: "squash"`).
   Tell the user the PR URL and the merge SHA.
3. The push to `main` triggers `.github/workflows/deploy.yml`, which fires
   the Vercel deploy hook **and verifies** that the live site's
   `index.html` hash actually changes within ~5 min. A red action means
   production didn't update — surface that loudly to the user instead of
   declaring success.
4. If a previous session left a long-lived feature branch (e.g.
   `claude/ui-overhaul`) ahead of `main`, flag it. Production has been
   silently stuck behind that branch before.

Do **not** push directly to `main`. Always merge through a PR so the
deploy workflow runs and verifies. The verification step is what catches
silent failures (stale deploy hook, build error, Vercel coalescing) —
without it, a green action does not mean production updated.

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

`src/journal/` is sealed too, **and stricter**. Nothing outside the folder
may import from anywhere except `src/journal/index.ts`. The public API is
intentionally tiny: `JournalTile`, `JournalApp`, and a `journal` object
with `isUnlocked()` / `lock()`. There are **no data accessors** —
deliberately. If a future task asks to surface "journal patterns in the
coach", "the worry count on the home grid", "last-written timestamp",
counts, dates, badges, or anything else derived from journal content,
the answer is no: don't add the seam. The PIN is hashed with PBKDF2-SHA256
via Web Crypto; v1 storage is plaintext-on-device behind a hashed PIN
gate; v2 will swap the storage layer for an encrypted implementation.
The unlock screen tells the user the truth about that.
