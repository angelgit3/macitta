## Summary

<!-- What does this PR do? -->

## Type of Change

- [ ] 🐛 Bug fix
- [ ] 🚀 New feature
- [ ] 🧠 SREM algorithm change
- [ ] 📦 Refactor (no behavior change)
- [ ] 📄 Documentation
- [ ] 🔐 Security

## Changes

<!-- List the key files changed and why. -->

## Testing

- [ ] Ran `npm run test` — all tests pass
- [ ] Added/updated tests for new behavior (if applicable)
- [ ] Tested manually on the dev server

## SREM Checklist (if algorithm was modified)

- [ ] All 40+ tests in `packages/shared/src/sem.test.ts` pass
- [ ] No scheduling invariants are violated (see [algorithm docs](../docs/srem-algorithm.md))
- [ ] Difficulty factor range `[0.5, 1.5]` is respected
- [ ] `dueDate` is always anchored to today (not `lastReview`)

## Screenshots (if UI changed)

<!-- Add before/after screenshots for UI changes. -->
