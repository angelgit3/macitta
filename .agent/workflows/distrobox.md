---
description: Ejecutar comandos de desarrollo dentro de la Distrobox 'next'
---

Este proyecto se desarrolla en un sistema Bazzite (Linux), donde todas las herramientas de desarrollo (Node, NPM, Next.js, etc.) están aisladas en una Distrobox llamada `next`.

### Reglas de Ejecución:
1. **SIEMPRE** envuelve los comandos de `npm`, `npx`, `node` o `next` usando `distrobox enter next -- <comando>`.
2. **NUNCA** intentes instalar paquetes globalmente o ejecutar servidores de desarrollo directamente en el host (Bazzite).
3. Si necesitas abrir una terminal interactiva dentro del entorno, usa `distrobox enter next`.

### Ejemplos:
- Para instalar dependencias:
  // turbo
  `distrobox enter next -- npm install`

- Para iniciar el servidor de desarrollo:
  // turbo
  `distrobox enter next -- npm run dev`

- Para crear un nuevo componente con npx:
  // turbo
  `distrobox enter next -- npx ...`
