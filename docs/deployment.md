# Deployment guide

This guide creates an independent Macitta installation using Vercel and Supabase.

## 1. Requirements

- Node.js 20 or newer
- npm
- Supabase CLI
- A Supabase project
- A Vercel project or another Next.js-compatible host

## 2. Configure Supabase

Authenticate and link the repository to your own project:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

Review the pending operations before applying them:

```bash
npx supabase migration list --linked
npx supabase db push --linked --dry-run
npx supabase db push --linked
```

The migrations create the application schema, RLS policies, seed TOEFL exams and the public `toefl-audio` bucket.

Upload the versioned audio fixtures:

```bash
npx supabase storage cp --experimental --linked --recursive supabase/seed-assets/toefl-audio ss:///toefl-audio
```

Verify the database:

```bash
npx supabase db lint --linked
npx supabase db advisors --linked --type security --level warn --fail-on none
```

Leaked-password protection is configured in Supabase Auth settings and may require a paid Supabase plan. Macitta enforces an eight-character minimum in its signup and password-update interfaces regardless of plan.

## 3. Configure authentication

In Supabase Dashboard, open Authentication settings and add:

- Site URL: the final production origin, for example `https://www.example.com`.
- Redirect URL for local development: `http://localhost:3000/**`.
- Redirect URL for production: `https://www.example.com/**`.

Email signup is public. The `handle_new_user` trigger creates a matching profile without restricting the email domain.

## 4. Configure environment variables

Copy `apps/web/.env.example` to `apps/web/.env.local` for development. Add the same variables to the deployment platform:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Never expose a Supabase secret key or `service_role` key through a `NEXT_PUBLIC_` variable.

## 5. Verify the application

```bash
npm install
npm run lint
npm run test
npm run build
```

Run `npm run dev` and verify these paths on desktop and mobile widths:

- `/auth/signup`
- `/dashboard`
- `/estudio/global`
- `/vocabulario`
- `/toefl`
- one Reading, Grammar and Listening practice
- one TOEFL result page

For Listening, confirm that both files below return audio:

- `demo/listening-library-notice.wav`
- `demo/listening-writing-consultation.wav`

## 6. Deploy

Deploy the `apps/web` Next.js workspace through the repository root so npm workspaces and `packages/shared` remain available. The production build command is:

```bash
npm run build
```

After deployment, update the Supabase Auth Site URL and redirect allowlist to the final domain, then create a fresh test account and complete one offline-to-online study sync.

## Operational notes

- Database changes must be represented by a file in `supabase/migrations`.
- Run `supabase migration new descriptive_name` before creating a new schema change.
- Keep generated CLI state under `supabase/.temp` out of Git.
- Keep TOEFL audio in both Storage and `supabase/seed-assets` so a new installation is reproducible.
