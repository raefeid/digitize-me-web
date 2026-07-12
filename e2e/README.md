# Public-routes regression (Playwright)

This suite walks every public route declared in `src/App.tsx` (in both English
and Arabic) with a real browser and asserts:

- The top-level navigation returns a 2xx/3xx response.
- No uncaught page errors are thrown.
- No `console.error` messages are emitted.
- No `console.warn` messages are emitted **except** patterns explicitly listed
  in `e2e/helpers/console-allowlist.ts`.
- No same-origin request fails or returns a 4xx/5xx (with a small ignore list
  for `favicon.ico`, source maps, and the Vite HMR client).
- For Arabic routes, `<html lang>` starts with `ar`.

A full-page screenshot for each route is written to
`test-results/route-screenshots/` for visual diffing.

## Run locally

```bash
# Install browser binaries the first time
bunx playwright install chromium

# Boots Vite automatically and runs the suite
bun run test:e2e
```

To run against an already-running server (e.g. preview deploy):

```bash
TEST_BASE_URL=https://your-preview-url bun run test:e2e
```

## How routes are discovered

`e2e/helpers/discover-routes.ts` parses `src/App.tsx` statically, extracts every
`<Route path="…">`, drops `/admin/*` and the catch-all `*`, and substitutes
`:slug` with `sample`. Adding a new public route to `App.tsx` automatically
adds a test case — no edits required here.

## Tuning the allowlist

Only widen `WARNING_ALLOWLIST` when a warning is unequivocally noise (e.g.
React Router future-flag notices). Errors are never allowlisted — fix the
underlying issue instead.
