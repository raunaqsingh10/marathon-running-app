# Run Together

A private, mobile-first training app for Raunaq and Vipul.

## Local preview

```bash
cp .env.example .env.local
npm install
npm run dev
```

The example environment enables local demo mode. Choose either runner on the login screen; data is stored in that browser.

## Supabase mode

1. Create a Supabase project and apply the migrations in `supabase/migrations` in timestamp order.
2. Create the two approved users in Authentication > Users. Set their `display_name` metadata.
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_DEMO_MODE=false`.
4. Disable public signup and enable leaked-password protection in Supabase Authentication settings. The database migration also enforces the two-email allowlist.

Only the public publishable key belongs in the frontend. Never expose the service-role key.

## Quality checks

```bash
npm ci
npm run check
npm run test:e2e
```

The browser suite always starts its own deterministic demo-mode server on port 4174.
GitHub Actions runs the same lint, type, unit, security, build, and browser checks.

## Vercel

Import the GitHub repository as a Vite project and configure these variables for
Production and Preview:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_DEMO_MODE=false
```

`vercel.json` rewrites client-side routes to `index.html`.
