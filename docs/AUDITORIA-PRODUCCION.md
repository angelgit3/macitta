# Auditoría de Producción — Macitta

**Fecha:** 2026-09-04 · **Rama:** `feature/production-audit` · **Alcance:** seguridad, legal y readiness para lanzamiento con usuarios reales.

## Resumen ejecutivo

La base está en muy buen estado: headers de seguridad completos, CSP con nonce, RLS en el 100% de las tablas, cero secretos en el repo y páginas legales completas. Esta auditoría corrigió 3 brechas reales: la app prometía eliminación de cuenta sin tener el flujo, no había cláusula de menores de edad, y 2 dependencias con vulnerabilidades corregibles. Quedan 4 acciones manuales (dashboard de Supabase y verificación de correo) listadas al final.

---

## ✅ Verificado en buen estado

| Área | Estado |
| --- | --- |
| Headers de seguridad | HSTS (preload), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP — todos activos en producción |
| CSP | Con nonce por request + `strict-dynamic`, `object-src 'none'`, `frame-ancestors 'none'`; el service worker tiene su propia CSP restrictiva |
| Secretos | Sin service-role keys, tokens ni `.env` trackeados en git (solo `.env.example`) |
| RLS (Supabase) | Las 41 tablas creadas tienen `ENABLE ROW LEVEL SECURITY`; además existen migraciones de hardening (`rls_hardening`, `security_hardening_v2`, rate limits de escritura) |
| Auth | Middleware con fail-closed, redirect sanitizado (`safeInternalRedirect`), whitelist de rutas protegidas |
| API surface | Mínima: una sola route (`/auth/confirm`); Server Actions con límite de cuerpo de 512 kb |
| Legal | Aviso de privacidad con responsable, datos recabados, finalidades, ARCO, cookies, contacto. Términos con aceptación, uso aceptable, propiedad intelectual, limitación de responsabilidad |
| SEO/meta | robots.txt, sitemap.xml, OG/Twitter cards, manifest PWA completos |
| Errores | `error.tsx`, `global-error.tsx`, `/offline` precacheada en el SW, 404 de marca |
| Dependencias | Tras `npm audit fix`: quedan 4 vulnerabilidades, todas en cadena de **build** (postcss dentro de Next, @serwist) — sin exposición en runtime |

## 🔧 Corregido en esta rama

1. **Flujo de baja de cuenta (brecha legal real).** El aviso de privacidad prometía "elimina definitivamente tu cuenta" pero la app no tenía cómo. Se agregó:
   - Migración `20260904180000_delete_own_account.sql`: RPC `security definer` que borra `decks` del usuario (única FK sin cascade) y luego la fila de `auth.users`; el resto de datos cae por `ON DELETE CASCADE`. Solo ejecutable por `authenticated` y solo sobre `auth.uid()`.
   - UI en `/usuario`: "Zona de peligro" con modal de confirmación que exige escribir `ELIMINAR`, limpia IndexedDB/localStorage y redirige al inicio.
2. **Cláusula de menores (LFPDPPP).** Términos §1: servicio para mayores de 13; 13–17 requieren consentimiento de padre/madre/tutor. Privacidad §2: no se recaban datos de menores de 13 deliberadamente + vía de contacto para baja.
3. **Dependencias:** `npm audit fix` aplicado (brace-expansion, browserslist, nanoid). 6 → 4 vulnerabilidades.

## ⚠️ Acciones manuales antes del lanzamiento (no se pueden hacer desde el repo)

1. **Aplicar la migración de baja de cuenta** (`supabase db push` o SQL Editor del dashboard) y **probarla con una cuenta desechable**: crear cuenta → crear mazo → eliminar cuenta → verificar que ya no puedes entrar y que los datos desaparecieron.
2. **Verificar el buzón `contacto@macitta.com`.** El dominio del producto es `macitta.app`, pero las páginas legales publican `contacto@macitta.com`. Si ese correo no existe o no lo monitoreas, los derechos ARCO quedan sin vía de contacto real. Crea el buzón o cambia las páginas a un correo válido (p. ej. `contacto@macitta.app`).
3. **Dashboard de Supabase → Authentication:** confirmar "Confirm email" activado, rate limits de auth en valores por defecto o más estrictos, y SMTP propio (el SMTP compartido de Supabase es solo para desarrollo y puede caer en spam).
4. **Backups:** verificar que el plan de Supabase tenga backups diarios activos (o activar PITR si el volumen de usuarios lo justifica).

## 📋 Recomendaciones post-lanzamiento (no bloquean)

- Actualizar a Next 16 cuando sea estable para resolver las 4 vulnerabilidades de build restantes (postcss).
- Considerar monitoreo de errores (Sentry o similar) — hoy los errores de cliente solo se ven en consola.
- Considerar analítica privacy-friendly (Plausible/Umami) si quieres medir uso sin rastreadores.
