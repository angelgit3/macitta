---
description: Envornment Execution Rules (Distrobox)
---

# Development Environment Strategy (Distrobox)

This project runs on Bazzite (Linux Inmutable). All development tools (Node, NPM, Next.js, etc.) are isolated within a Distrobox container named `next`.

## Core Execution Rule
You MUST execute all development commands inside the `next` container. The host system does NOT have the necessary tools installed.

**Mechanism:**
Wrap every command that requires Node/NPM/Git/etc. with the prefix:
`distrobox enter next -- <your command>`

### Examples:
- **Correct**: `distrobox enter next -- npm install`
- **Correct**: `distrobox enter next -- npm run dev`
- **Correct**: `distrobox enter next -- npx shadcn-ui@latest add button`
- **Incorrect**: `npm install` (Will fail on host)

## Context Awareness
- **File System**: The file system is shared transparently. You can edit files normally on the host path. The container sees the same path in `/home/aanaya/...`.
- **Ports**: Ports opened inside the container (e.g., localhost:3000) are automatically mapped to the host. You don't need special port forwarding flags.
- **Git**: Git commands can technically run on the host if installed, but for consistency with hooks (husky/lint-staged), prefer running them inside the box if they trigger node scripts.

## Interactive Tools
If you need to use an interactive CLI wizard (like `create-next-app` or large `shadcn` initializations), be aware that non-interactive flags (`-y`, `--no-input`) are preferred. If interaction is unavoidable, warn the user they execute it manually via `distrobox enter next`.
