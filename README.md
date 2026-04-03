<div align="center">

# Macitta 🎓

**Open-source spaced repetition platform for public universities in Latin America.**

Built for the students who can't afford Duolingo Premium. Deployable by any school, at near-zero cost.

[![Live at macitta.app](https://img.shields.io/badge/Live%20Demo-macitta.app-6366f1?style=flat-square&logo=vercel)](https://www.macitta.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-40%2B%20passing-22c55e?style=flat-square&logo=vitest)](packages/shared/src/sem.test.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[**→ Live App**](https://www.macitta.app) · [**→ SREM Algorithm Docs**](docs/srem-algorithm.md) · [**→ Report Bug**](https://github.com/angelgit3/Macitta_god/issues)

</div>

---

## Deploy Your Own

Fork this repo and deploy a full instance in minutes:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fangelgit3%2FMacitta_god&project-name=my-macitta&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Your%20Supabase%20project%20credentials&envLink=https%3A%2F%2Fsupabase.com%2Fdashboard)

> **Prerequisites:** A free [Supabase](https://supabase.com) account. That's it.

---

## What is Macitta?

Macitta is a **production-grade, open-source vocabulary learning platform** originally built as a social service project at a public university in Mexico. It is now live at [macitta.app](https://www.macitta.app) and serves as **digital public infrastructure**: any school, teacher, or institution can fork it, deploy it, and adapt it at near-zero operational cost.

### The problem it solves

Engineering and robotics students in Latin America are systematically excluded from the global open-source ecosystem — not for lack of talent, but for lack of English vocabulary. A student who cannot read documentation, parse error messages, or understand API references cannot contribute to OSS, regardless of their technical ability. Macitta is the infrastructure that bridges that gap.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **Custom SREM Engine** | 9-step growth curve with difficulty modulation, Hard-grade recalibration, and lapse-capped advancement. [Read the algorithm docs →](docs/srem-algorithm.md) |
| 👨‍🏫 **Role-Based Access** | Separate, secure portals for Students and Teachers |
| 📊 **Study Analytics** | Session tracking, activity streaks, performance stats, and group reports for teachers |
| 📱 **PWA / Offline-First** | Installable app with offline study via Service Workers and IndexedDB (Dexie.js) |
| 🔐 **Secure by Default** | Supabase Row Level Security (RLS) on every table |
| 🌙 **Modern UI** | Tailwind CSS v4, dark-mode first |

---

## 🧠 The SREM Engine

The core of Macitta is **SREM (Spaced Repetition Engine for Macitta)** — a custom scheduling algorithm built in TypeScript, validated with 40+ unit tests.

Unlike SM-2 (the algorithm behind Anki), SREM addresses three key failure modes:

- **Interval inflation bug** — penalises real elapsed time, not stored intervals
- **Step/interval desync** — recalibrates the step after every Hard grade
- **Unfair over-promotion** — caps Easy advancement for cards that have previously lapsed

```
Growth Curve: [0, 1, 3, 7, 16, 35, 75, 150, 365] days → Mastered
```

[**→ Full algorithm documentation**](docs/srem-algorithm.md)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Language | TypeScript (strict mode throughout) |
| Monorepo | Turborepo + npm workspaces |
| Deployment | Vercel (frontend) + Supabase Cloud (database) |
| Offline | Dexie.js (IndexedDB) with background sync queue |
| Testing | Vitest (40+ tests on the SREM engine) |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- A free [Supabase](https://supabase.com) account
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/angelgit3/Macitta_god.git
cd Macitta_god

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Fill in your Supabase URL and anon key

# 4. Run the tests
npm run test

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
Macitta_god/
├── apps/
│   └── web/               # Next.js 15 application
│       ├── app/           # App Router pages & layouts
│       └── hooks/         # React hooks (useSync, useStudy...)
├── packages/
│   └── shared/            # Framework-agnostic core
│       └── src/
│           ├── sem.ts         # 🧠 SREM scheduling engine
│           ├── sem.test.ts    # 40+ vitest tests
│           ├── algorithm.ts   # Levenshtein answer matching
│           ├── types.ts       # Shared TypeScript types
│           └── validator.ts   # Input validation
├── supabase/
│   └── migrations/        # SQL migration files
├── docs/
│   └── srem-algorithm.md  # Algorithm documentation
└── CONTRIBUTING.md
```

---

## 🌱 The Vision

The open-source ecosystem is rich with developer tooling but severely lacks accessible, deployable educational software for underfunded institutions. Macitta is the first step toward a replicable model: a **fork-and-deploy educational stack** that any school, teacher, or local consultant can operationalize.

The SREM engine in `packages/shared` is designed to be framework-agnostic — eventually publishable as a standalone npm package usable by any developer building language learning, flashcard, or adaptive training applications.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

## 📄 License

MIT — free to use, fork, and adapt. See [LICENSE](LICENSE).

---

<div align="center">
Built with ❤️ in Mexico by <a href="https://github.com/angelgit3">angelgit3</a>
</div>
