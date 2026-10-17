# 11 — Delivery Workflow: phase → test → commit → auto-deploy

Goal: the app is built phase by phase (`10-roadmap.md`). Every task is tested and committed; every
merged change to `main` is tested again, database migrations run, and the site deploys to
**https://jelarshad.shojashapta.com** automatically. Nothing reaches production without passing tests.

## 1. Environments

| Env | URL | Branch | Database | Purpose |
|---|---|---|---|---|
| Local | `http://localhost:3000` | any | Supabase **dev** project (or local Docker) | Build & try |
| Preview | `https://jelarshad-git-<branch>-<team>.vercel.app` | every PR | Supabase **dev** project | Review a phase before merge |
| Production | `https://jelarshad.shojashapta.com` | `main` | Supabase **prod** project | Real users |

Two Supabase free projects (dev + prod) are allowed on the free plan. Cloudinary: one account, folders
`jelarshad-dev/` and `jelarshad/`.

## 2. Git model (simple trunk-based)

- `main` = production. Protected: no direct pushes, PR + green CI required.
- One branch per roadmap task: `phase-<N>/<task>-<slug>` — e.g. `phase-2/2.3-food-page`.
- Commits: Conventional Commits, small and focused — `feat(food): community favorites section`,
  `test(search): banglish normalization cases`, `fix(skeleton): match card height`.
- A PR = one roadmap task (or a few tiny ones). PR title = the task, body = "Done when" checklist.
- Merge with **squash**. After the **last task of a phase** is merged, tag `main`: `git tag phase-2 && git push --tags`
  (and create a GitHub Release with the phase summary). Tags make rollback to any phase one command.

## 3. Pipeline (GitHub Actions, free)

Templates are in `docs/ci/` and are installed in Phase 0.3 (they need `package.json` to exist first):

```
docs/ci/ci.yml        → .github/workflows/ci.yml       (every PR + push to main)
docs/ci/deploy.yml    → .github/workflows/deploy.yml   (push to main → production)
docs/ci/preview.yml   → .github/workflows/preview.yml  (every PR → preview URL)
docs/ci/lighthouserc.json → lighthouserc.json
docs/ci/vercel.json   → vercel.json                    (turns off Vercel's own git deploys)
```

```
PR opened/updated ─► CI: install → typecheck → lint → unit tests → test:themes → build → e2e (Playwright) → Lighthouse budgets
                 └─► Preview: migrate dev DB → vercel deploy (preview) → URL in the job summary
merge to main    ─► CI again ─► Deploy: supabase db push (prod) → vercel build --prod → vercel deploy --prebuilt --prod
                                └─► smoke test the production URL (home, a food page, /api/health) → fail = alert
```

Why deploy from Actions instead of Vercel's automatic git deploy: tests and **database migrations run
before** the new code goes live, in that order, every time — and the same pipeline works if we later
move off Vercel (only the last step changes).

### Required GitHub secrets (Settings → Secrets and variables → Actions)
| Secret | From |
|---|---|
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Vercel account settings → Tokens; `.vercel/project.json` after `vercel link` |
| `SUPABASE_ACCESS_TOKEN` | Supabase account → Access tokens |
| `SUPABASE_DEV_PROJECT_REF`, `SUPABASE_DEV_DB_PASSWORD` | dev project settings |
| `SUPABASE_PROD_PROJECT_REF`, `SUPABASE_PROD_DB_PASSWORD` | prod project settings |
App env vars (Supabase URL/keys, Cloudinary, `NEXT_PUBLIC_SITE_URL`) live in **Vercel project settings**
per environment (Preview / Production) and are pulled by `vercel pull` during the build.

## 4. Domain: jelarshad.shojashapta.com

> The app lives on a **subdomain** of the owner's existing domain `shojashapta.com`. A main domain of its
> own may come later; nothing in the code depends on the host (everything uses `NEXT_PUBLIC_SITE_URL`).

1. Vercel → Project → Settings → Domains → add `jelarshad.shojashapta.com`. Keep `shojashapta.com` and
   `www.shojashapta.com` there too: once `NEXT_PUBLIC_SITE_URL` points to the new address the app itself
   redirects them (308, same path; `src/lib/legacy-host.ts`).
2. At the DNS provider of `shojashapta.com`, add the record Vercel shows for the subdomain (a `CNAME`
   `jelarshad` → `cname.vercel-dns.com`, or the value shown). Wait for "Valid configuration"; HTTPS is automatic.
3. Vercel env `NEXT_PUBLIC_SITE_URL`: Production = `https://jelarshad.shojashapta.com`, Preview = the preview URL
   (`https://$VERCEL_BRANCH_URL`), Local = `http://localhost:3000`. All canonical/OG/sitemap URLs use it.
   Then redeploy.
4. GitHub → Settings → Secrets and variables → Actions → Variables: `PRODUCTION_URL` =
   `https://jelarshad.shojashapta.com` (the deploy smoke test uses it).
5. Supabase **prod** → Authentication → URL configuration: Site URL `https://jelarshad.shojashapta.com`;
   Redirect URLs `https://jelarshad.shojashapta.com/auth/callback` (keep the old one until the move is done).
   Supabase **dev**: `http://localhost:3000/auth/callback` and `https://*-<your-vercel-team>.vercel.app/auth/callback`.
6. Google Cloud → OAuth client: Authorized JavaScript origins `https://jelarshad.shojashapta.com`,
   `http://localhost:3000`; Authorized redirect URIs = the callback URL shown in each Supabase project's Google
   provider settings (unchanged).
7. Search Console (after launch): add the new address as a property and submit its `/sitemap.xml`.
8. Email for the domain (optional, later): free forwarding at the registrar/Cloudflare.

### Before public launch (Phase 0–8)
Production is live from Phase 0 but shows a **"শিগগিরই আসছে"** page and is `noindex`, controlled by
`NEXT_PUBLIC_LAUNCHED=false`. Founding contributors get access via `/?preview=<secret>` (sets a cookie).
Phase 9 flips `NEXT_PUBLIC_LAUNCHED=true` → full site, indexing on, sitemap submitted to Google Search Console.

## 5. The per-task loop (what you and Claude Code do every time)

```
1. git switch main && git pull && git switch -c phase-2/2.3-food-page
2. Claude Code: "Read AGENTS.md. Do Phase 2, task 2.3 only. Use the ship-task skill."
3. Implement → write/adjust tests → pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e
4. Check in the browser: 360px, every theme, Slow 4G skeleton swap
5. Commit (conventional), push, open PR → CI + preview URL
6. Review the preview → squash-merge → production deploys automatically
7. Last task of the phase? Tag phase-N + GitHub Release; tick the phase in 10-roadmap.md
```

## 6. Database changes in the pipeline
- Migrations live in `supabase/migrations/` and are applied by CI: dev on PR (preview), prod on merge.
- Migrations must be **backward compatible** (expand → deploy code → contract later), because the old
  code serves traffic for a minute while the new deploy rolls out. Never rename/drop a column in the same
  PR that stops using it.
- Seed data never runs in production automatically; `pnpm db:seed --env prod` is a manual, reviewed step.

## 7. Rollback
- Code: Vercel → Deployments → previous production deployment → "Promote" (instant), or
  `git revert` the merge → pipeline redeploys.
- Database: write a new forward migration that undoes the change (never edit applied migrations).
- Whole phase: `git checkout phase-<N-1>` to inspect; revert the phase's merges on a branch and PR it.

## 8. Monitoring after each deploy
- Smoke test in `deploy.yml` (fails the run if home, `/food/doi` or `/api/health` don't return 200).
- Vercel logs for errors; weekly quota check (`09-security-and-limits.md` §6).
- Lighthouse budgets on every PR keep performance from sliding.

## Optional features that need an owner step

| Feature | What to set (Vercel Production, then redeploy) |
| --- | --- |
| Streak reminders (Web Push) | `npx web-push generate-vapid-keys`; set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` (any long random string). The daily run is `/api/cron/streak` at 13:00 UTC (7 pm in Bangladesh), declared in `vercel.json`. Until the keys are set the toggle on the profile does not appear and nothing is sent |
| Facebook sign-in | Create a Facebook app, add the Facebook provider in Supabase Auth with its app id and secret, then set `NEXT_PUBLIC_FACEBOOK_LOGIN=true`. Until then the button is hidden |
