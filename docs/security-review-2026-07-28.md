# Security and load review — 2026-07-28

## Outcome

The review covered the Next.js application, authentication flows, service
worker and offline storage, Supabase grants/RLS/RPCs, untrusted input,
dependency advisories and representative burst/load behavior.

The application is materially safer after this change, but this report does
not claim that any internet-facing system is “unhackable.” The remaining
operational controls at the end of this document must be owned and monitored
after deployment.

## High-impact findings corrected

- Upgraded Next.js to `15.5.22`, Serwist to `9.5.11`, PostCSS to `8.5.24`,
  Sharp to `0.35.3`, and the test/build dependency chain to currently patched
  releases.
- Closed an open redirect in the email confirmation route by accepting only
  normalized same-origin paths.
- Changed route protection to fail closed when session validation fails.
  `/api` is no longer implicitly public.
- Added a nonce-based Content Security Policy and the standard anti-sniffing,
  anti-framing, referrer, permissions, opener, resource and HSTS headers.
- Forced request-time rendering because Next.js can only attach CSP nonces to
  framework scripts on dynamically rendered pages.
- Added `method="post"` and explicit submit controls to authentication forms.
  This prevents credentials or OTPs from falling into a URL if JavaScript has
  not hydrated.
- Added a 512 KiB Server Action body limit plus bounded, typed validators for
  decks, imports, cards, answer slots, JSON rules and media URLs.
- Removed raw database errors from Server Actions and raw authentication
  errors from public UI.
- Prevented private pages, RSC payloads, API responses and Supabase requests
  from being cached by the service worker. Legacy private runtime caches are
  deleted when the new worker activates.
- Allowed the worker to connect only to the app and Supabase. Without this
  explicit CSP exception, the hardened worker blocked Grammar network reads.
- Disabled the service worker in development to prevent stale chunks from
  hiding regressions.
- Added account-scoped offline-data cleanup on logout so answers, progress,
  queues and personal cards cannot cross accounts on a shared browser.
- Aligned password update validation with signup at a minimum of 8 characters.

## Database controls applied

Migrations `20260728195952_security_hardening.sql` and
`20260728201958_fix_write_rate_limit_quota_branching.sql` are applied to the
linked project.

- Every public table has RLS enabled.
- `anon` has no public-table privileges.
- `authenticated` no longer has `TRUNCATE`, `TRIGGER` or `REFERENCES`.
- Client roles cannot execute arbitrary public functions.
- The `handle_new_user` security-definer function now lives in a private,
  non-exposed schema.
- RPCs reject forged ownership, negative time and invalid SREM state.
- Database constraints bound user-controlled text, arrays, JSON, time values,
  counters and media metadata even when a client bypasses Next.js.
- Fourteen write triggers apply fixed-size per-user rate buckets.
- Permanent caps apply to personal decks, cards per deck and slots per card.
- Missing foreign-key/hot-path indexes were added.
- RLS expressions evaluate `auth.uid()` once per statement instead of once per
  row, and duplicate permissive deck-select policies were consolidated.

## Verification evidence

- Unit tests: 108 passed.
- ESLint: passed for both workspaces.
- Production build and TypeScript validation: passed.
- CSP check: 23 of 23 framework scripts received the response nonce.
- Protected-route check: an unauthenticated `/dashboard` request redirects to
  login.
- Open-redirect check: `next=//example.com` remains on the app origin.
- Browser flow: login → dashboard → Grammar → five-exercise group → logout.
  No credential appeared in the resulting URL.
- Supabase functional read using a real authenticated session: 7 Grammar
  domains, 35 skills and 350 exercises.
- Transactional database security test:
  - cross-owner reads and writes rejected;
  - negative session-time increment rejected;
  - forged SREM owner rejected;
  - the 31st deck write in an hour returned the rate-limit error;
  - the whole test rolled back.
- Database postflight:
  - 0 public tables without RLS;
  - 0 anonymous table grants;
  - 0 dangerous authenticated grants;
  - 0 public functions executable by anonymous clients;
  - 35 hardening constraints;
  - 14 write-limit triggers;
  - 5 new load indexes.
- Query plans use `user_items_user_due_idx` and
  `grammar_user_progress_user_due_idx`; measured execution was approximately
  2.3 ms and 1.4 ms respectively on the linked project.
- Local burst test, one production process:
  - 100 concurrent public requests: 0 errors;
  - 100 concurrent protected-route requests: 0 errors;
  - 200 concurrent public requests: 0 errors;
  - 200 concurrent protected-route requests: 0 errors.
- Database cache hit rates at review time: table `0.99`, index `0.98`.
- Secret check: local `.env.local` files are ignored and no credentials from
  the test account were written to the repository.

## Residual and operational work

### Dependency scanner exceptions

`npm audit --omit=dev` still reports Next.js through its pinned
`postcss@8.4.31`. Next.js `15.5.22` is newer than the current security
maintenance floor, but all maintained Next.js lines still pin that PostCSS
version. Macitta does not accept or compile attacker-controlled CSS, so the
reported source-map file-read path is not reachable through the production
application. Keep this exception visible and remove it as soon as Next.js
updates the pin.

The full audit also reports `brace-expansion` through ESLint's local tooling.
It is development-only and is not shipped by `npm ci --omit=dev`. Do not run
lint with attacker-controlled glob patterns. Upgrade the lint configuration
when Next's supported ESLint path removes the legacy chain.

### Supabase dashboard controls

These require project-owner choices or external keys and were not silently
enabled:

- Enable leaked-password protection when available on the project plan.
- Add Turnstile or hCaptcha keys and enable CAPTCHA for signup, login and
  password recovery.
- Require MFA for organization/dashboard administrators.
- Configure production SMTP and review Auth rate limits.
- Enable network restrictions for administrative/database access where the
  plan supports them.
- Confirm backups/PITR and perform a restore drill.
- Configure alerting for 429 spikes, Auth failures, database saturation,
  slow queries and migration failures.

### Deployment controls

- Terminate TLS and apply coarse IP/edge rate limiting before the Next.js
  process. Application/database user buckets do not replace DDoS protection.
- Build with `npm ci`, never from user-submitted CSS or source maps.
- Run `npm audit --omit=dev`, the test suite, lint, build and the SQL postflight
  in CI.
- Rotate the shared test-account password after this review because it was
  supplied through the collaboration channel.

## Primary references

- Next.js security releases: <https://nextjs.org/blog>
- Next.js production checklist:
  <https://nextjs.org/docs/app/guides/production-checklist>
- Next.js CSP guide:
  <https://nextjs.org/docs/app/guides/content-security-policy>
- Next.js self-hosting:
  <https://nextjs.org/docs/app/guides/self-hosting>
- Supabase production checklist:
  <https://supabase.com/docs/guides/deployment/going-into-prod>
- Supabase API security:
  <https://supabase.com/docs/guides/api/securing-your-api>
- Supabase CAPTCHA: <https://supabase.com/docs/guides/auth/auth-captcha>
- Supabase password security:
  <https://supabase.com/docs/guides/auth/password-security>
