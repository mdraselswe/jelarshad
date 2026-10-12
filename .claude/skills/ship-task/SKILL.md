---
name: ship-task
description: Take one Jelar Shad roadmap task from branch to merged, tested and deployed - branch naming, implementation checks, tests, conventional commit, PR, CI, preview, merge, and phase tagging. Use for every roadmap task.
---

# Ship one roadmap task

1. Read `AGENTS.md`, `docs/00-decisions.md`, the task in `docs/10-roadmap.md`, and `docs/11-delivery-workflow.md` §5.
2. `git switch main && git pull`, then `git switch -c phase-<N>/<task>-<slug>` (e.g. `phase-2/2.3-food-page`).
3. Implement only that task. Use the create-page / create-component / db-migration / add-provider skills as relevant,
   and the `frontend-design` skill for any UI.
4. Add or update tests for what changed (unit for lib/services, Playwright for user flows, fixtures for mock adapters).
5. Run locally, in order, and fix every failure (never weaken a check):
   `pnpm typecheck && pnpm lint && pnpm test && pnpm test:themes && pnpm build && pnpm test:e2e`
6. Manual check: 360px width, every theme, Slow 4G skeleton → content without layout shift, Bangla text.
7. Commit with Conventional Commits (`feat(scope): …`, `fix`, `test`, `refactor`, `chore`, `docs`); several small commits are fine.
8. `git push -u origin HEAD`, open a PR titled with the task id + name; body = the task's "Done when" checklist, ticked.
9. Wait for CI and the preview URL; check the preview. Report the URL and results to the owner.
10. After the owner approves: squash-merge. Production deploys automatically; confirm the Deploy workflow and smoke test passed.
11. If this was the last task of the phase: `git tag phase-<N> && git push --tags`, create a GitHub Release with a short
    summary, tick the phase in `docs/10-roadmap.md` (in a small `docs:` PR), and add any new decisions to `docs/00-decisions.md`.
