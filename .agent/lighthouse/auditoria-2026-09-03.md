# Auditoría Lighthouse — Macitta (2026-09-03)

Auditoría local contra build de producción (`next start`), Chrome headless, categorías: rendimiento, accesibilidad, buenas prácticas y SEO.

## Resultados

| Ruta | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/` (landing) — antes | 0.99 | 0.95 | 1.00 | 0.73 |
| `/` (landing) — después | **0.99** | **1.00** | **1.00** | **0.91** |
| `/auth/login` — antes | 0.99 | 0.94 | 1.00 | 0.73 |
| `/auth/login` — después | **0.99** | **1.00** | **1.00** | 0.54* |

\* El SEO de login baja porque `robots.txt` ahora bloquea `/auth/` a propósito (`is-crawlable`) — una página de acceso no debe indexarse. Es el comportamiento correcto.

## Métricas clave (landing, después)

- First Contentful Paint: **0.9 s**
- Largest Contentful Paint: **2.2 s**
- Total Blocking Time: **60 ms**
- Cumulative Layout Shift: **0**
- Speed Index: **1.6 s**

## Cabos sueltos cerrados

1. **Contraste WCAG** (5 elementos): texto oscuro sobre fondo ámbar/periwinkle en el hero y cabecera — subido de `void/65-80` a `void/85`-`void` (ratios 3.4–4.5 → 4.8–5.7). Insignia de práctica: `text-accent` → `text-accent-hover`.
2. **robots.txt**: antes devolvía 307 → login (middleware), lo que lo hacía "inválido". Ahora existe `public/robots.txt` (solo páginas públicas indexables) y el matcher del middleware lo excluye.
3. **Landmark `<main>`**: añadido al layout de auth (todas las páginas de acceso).
4. **Texto de enlace**: "Más información" → "Más información sobre cookies" (banner de consentimiento).

## Limitaciones conocidas (trade-offs deliberados)

- **`meta description` aparece "ausente" para Lighthouse**: la CSP con nonce obliga a renderizado dinámico, y Next 15 hace *streaming* del metadata al `<body>` salvo para bots conocidos (`htmlLimitedBots`: Googlebot, Bingbot, Twitterbot, etc. sí reciben el `<head>` completo). Impacto real de SEO: mínimo; quitarlo requeriría renunciar al nonce CSP.
- **bf-cache bloqueado**: las páginas dinámicas llevan `no-store` (seguridad de sesiones). Esperado.
- **Dashboard y rutas de práctica**: requieren sesión autenticada; no auditables con Lighthouse headless sin credenciales. Sus números de bundle están medidos en los builds (106–169 kB First Load JS).

## Actualización: sitemap (mismo día)

- Añadido `app/sitemap.ts` (ruta estática `/sitemap.xml`) con las 5 páginas públicas: landing, privacidad/privacy, términos/terms. Verificado en producción local (XML válido, HTTP 200).
- `robots.txt` ahora referencia el sitemap; el middleware excluye `sitemap.xml`.
- **Aclaración sobre `meta description`**: Lighthouse 13 ya no envía el token `Chrome-Lighthouse` en su user-agent, así que Next le sirve metadata por *streaming* (en `<body>`). Verificado con curl: con UA de bot (Googlebot, Chrome-Lighthouse real, etc.) el `<title>` y la descripción sí llegan en el `<head>`. El fallo restante es un artefacto del emulador, no un problema real de SEO.
- Landing final: **0.99 rendimiento / 1.00 accesibilidad / 1.00 buenas prácticas / 0.91 SEO**.

## Archivos

- JSON crudos: `.agent/lighthouse/landing.json`, `login.json`, `landing-after.json`, `login-after.json`, `landing-final.json`
- Capturas: `.agent/design-refs/lighthouse-fixes-landing.png`
