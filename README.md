<div align="center">

# Macitta 🎓🤖

**An open-source, AI-enhanced educational platform for public universities.**

Designed to bridge the language gap for engineering students in Latin America using modern web technology and advanced spaced repetition.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://macitta.vercel.app) · [Report Bug](https://github.com/angelgit3/Macitta_god/issues)

</div>

---

## 📖 What is Macitta?

Macitta is a production-ready, open-source vocabulary learning platform originally built as a social service project at a public university in Mexico. It serves as **digital public infrastructure**: any school, teacher, or institution can fork it, customize it, and deploy it at near-zero cost to help students acquire vocabulary efficiently.

The platform uses a **custom Spaced Repetition Engine (SREM)** — inspired by the FSRS algorithm — to schedule vocabulary reviews at the optimal moment, maximizing retention while minimizing study time.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **Custom SREM Engine** | 9-step growth curve, difficulty-based intervals, and Hard-grade recalibration |
| 👨‍🏫 **Role-Based Access** | Separate portals for Students and Teachers |
| 📊 **Study Analytics** | Session tracking, activity streaks, and performance stats |
| 📱 **PWA Ready** | Installable, works offline via Service Workers and IndexedDB (Dexie.js) |
| 🔐 **Secure by Default** | Supabase Row Level Security (RLS) on all tables |
| 🌙 **Modern UI** | Built with Tailwind CSS v4, dark-mode first |

---

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Language:** TypeScript (strictly typed throughout)
- **Monorepo:** Turborepo with npm workspaces
- **Deployment:** Vercel (frontend) + Supabase Cloud (database)
- **Offline:** Dexie.js (IndexedDB) with background sync queue

---

## ⚙️ Getting Started

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

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🌱 The Vision

The open-source ecosystem is rich with developer tooling, but severely lacks accessible, deployable educational software for underfunded institutions across Latin America. 

Macitta is the first step toward a replicable model: a **hardware + software integration consultant** can fork this project and deploy it at any school, pairing it with IoT sensors, custom hardware, and local cloud infrastructure — bringing modern technology to institutions that don't have the budget for enterprise SaaS.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.  
Check the [issues page](https://github.com/angelgit3/Macitta_god/issues) to get started.

---

## 📄 License

This project is licensed under the **MIT License** — free to use, fork, and adapt.  
See [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ in Mexico by <a href="https://github.com/angelgit3">angelgit3</a>
</div>
