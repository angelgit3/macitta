# Contributing to Macitta

Thank you for your interest in Macitta! This project exists to provide free, deployable educational infrastructure for institutions that can't afford enterprise SaaS — especially in Latin America. Every contribution, no matter how small, brings that goal closer.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

This project follows a simple principle: be kind, be constructive, and remember that the end users are students trying to learn. Discrimination, harassment, and bad-faith behavior will not be tolerated.

---

## How to Contribute

There are many ways to contribute that don't require writing code:

- 🐛 **Report bugs** via [GitHub Issues](https://github.com/angelgit3/Macitta_god/issues)
- 📖 **Improve documentation** — especially translations to Spanish
- 🃏 **Contribute vocabulary decks** — JSON files for other subjects or languages
- 🌍 **Deploy at your institution** — and share feedback on what broke

For code contributions, read on.

---

## Development Setup

### Prerequisites

- Node.js v18+
- npm v9+
- A free [Supabase](https://supabase.com) account

### Steps

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/YOUR_USERNAME/Macitta_god.git
cd Macitta_god

# 2. Install dependencies (monorepo — run from root)
npm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Fill in your own Supabase URL and anon key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running Tests

```bash
# Run SREM unit tests (packages/shared)
npm run test --workspace=packages/shared
```

---

## Project Structure

```
Macitta/
├── apps/
│   └── web/               # Next.js 15 frontend (App Router)
│       ├── app/           # Routes: (app), (marketing), auth
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks
│       └── lib/           # Service layer (DB queries, helpers)
├── packages/
│   └── shared/            # Standalone SREM engine + validators
│       ├── src/sem.ts     # Core scheduling algorithm ← most interesting
│       └── src/validator.ts
└── supabase/
    └── migrations/        # All DB schema changes, versioned
```

> **Key insight:** The SREM engine in `packages/shared` is intentionally isolated so other educational projects can import it as an npm package without the full app.

---

## Submitting Changes

1. **Create a branch** from `develop` (not `main`):
   ```bash
   git checkout develop
   git checkout -b feat/your-feature-name
   ```

2. **Write focused commits** following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add audio slot type to StudyCard
   fix: prevent SREM penalty on brand-new cards
   docs: add deployment guide for Vercel
   ```

3. **Open a Pull Request** against `develop` with:
   - A clear description of what changed and why
   - Screenshots if it touches the UI
   - Reference to any related issue (`Closes #42`)

4. **Keep PRs small and focused.** One feature or fix per PR makes review much faster.

---

## Reporting Bugs

Please open an issue using the **Bug Report** template and include:

- Steps to reproduce
- Expected vs. actual behavior
- Browser and OS
- Any relevant console errors

---

## Feature Requests

Open an issue with the **Feature Request** template. In particular, we're always interested in:

- New card types beyond verb conjugation
- Additional language support
- Accessibility improvements
- Deployment guides for different cloud providers

---

## Vocabulary Deck Contributions

One of Macitta's goals is to become **content-agnostic** — the platform should work for any subject. If you have a vocabulary deck you'd like to contribute, format it following the schema in `Documentos extra/verbos_tarjetas.json` and open an issue or PR.

---

Built with ❤️ in Mexico. Let's bridge the gap together.
