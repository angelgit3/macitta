# Lanzamiento Macitta — Estado y Checklist

> Última actualización: 5 septiembre 2026 (tras ronda E2E en producción).
> Producción: https://macitta.vercel.app · Repo: github.com/angelgit3/macitta

## ✅ Verificado en producción (E2E con cuenta real de prueba, 5-sep-2026)

Flujo completo ejecutado de punta a punta con cuenta nueva (correo temporal), sin incidencias:

1. **Landing** — carga, animaciones, CTAs "Crear cuenta" (sin menciones de cobro ni pill viejo).
2. **Registro** — solo correo + contraseña (el username NO se pide aquí).
3. **OTP** — correo con branding llega al instante; grid de 6 dígitos responsivo; verificación crea sesión.
4. **Onboarding** — Bienvenida → Sesiones → Sin conexión → username (una sola vez). Sin menciones de racha.
5. **Builder de mazos** — etiqueta del frente visible (ej. "Animal"), guardia de salida sin guardar (beforeunload + confirmación en navegación interna), sin campo de multimedia (ver flag abajo).
6. **Selector de mazos** — al picar "Estudiar": "Todo mezclado (N)" o multi-selección de mazos con conteos; offline ofrece "Estudiar todo" con conteo local.
7. **Sesión de estudio** — filtra correctamente por selección; resumen con stats; progreso se guarda.
8. **Perfil** — edición de username, cambio de contraseña, stats.
9. **Borrado de cuenta** — zona de peligro con confirmación tipada `ELIMINAR`; RPC `delete_own_account()` borra todo y redirige a landing.
10. **Legal** — Términos y Aviso de Privacidad con cláusula de menores y contacto macitta.app@gmail.com.
11. **404** — URLs desconocidas muestran la página 404 propia (middleware con whitelist de rutas).
12. **Seguridad** — headers (CSP con nonce, X-Frame-Options, HSTS, Permissions-Policy), RLS activo, rutas privadas redirigen a login. Auditoría de secretos limpia: ningún `.env` real ni clave en el historial; `.gitignore` blindado (`.env*` excepto ejemplos).

## 🛡️ Protecciones activas en GitHub (5-sep-2026)

- **Secret scanning** + **Push protection** — GitHub escanea el historial y bloquea pushes con secretos.
- **Dependabot alerts + security updates** — avisos y PRs automáticos ante dependencias vulnerables.
- Verificado vía API: las tres en estado `enabled`.

## 🔧 Configuración operativa (no perder de vista)

- **Dominio default:** `https://macitta.vercel.app` (metadataBase, sitemap, robots). `www.macitta.vercel.app` NO existe — Vercel no asigna `www` en dominios `.vercel.app`.
- **Supabase Auth:** Site URL = `macitta.vercel.app`; Redirect URLs incluyen `/auth/confirm`, `/auth/update-password` (y variantes legacy de macitta.app mientras el dominio siga pagado).
- **Dominio macitta.app:** se dejará de pagar (proyecto sin fines de lucro). Contacto legal ya migrado a `macitta.app@gmail.com`.
- **Deploys:** push a `main` → Vercel auto-deploy (~1-2 min). Verificar estado en la API pública de GitHub deployments.

## 🚩 Feature flags activos

- `APP_CONFIG.FEATURES.CARD_MEDIA_INPUT = false` (`apps/web/config/constants.ts`)
  - Oculta los inputs de URL multimedia para usuarios (builder, modal de edición, ajustes avanzados).
  - El **render en estudio sigue activo**: tarjetas con `front_media` o slot `media` existentes (ej. mazos oficiales con recursos en GitHub) sí la muestran (imagen/audio/video por extensión).
  - Reactivar captura para usuarios = cambiar a `true`.

## 🔮 Pendientes a futuro (prioridad sugerida)

1. **Grupos de mazos** — tabla `deck_groups` + `decks.group_id` nullable. El selector de mazos ya expone el filtro `deckIds` que los grupos reutilizarán (un grupo = lista guardada de mazos). Estudiar por mazo / por grupo / todo.
2. **Multimedia para usuarios** — requiere resolver hosting sin costo: Imgur (imágenes) / Catbox (audio) funcionan pero Catbox falla con VPN; Google Drive/Photos no dan URLs directas confiables. Para mazos oficiales: subir recursos al repo (`public/` o raw.githubusercontent.com). Considerar botón "Probar link" antes de guardar.
3. **Conteo dashboard vs picker** — el dashboard lee caché Dexie y el picker cuenta fresco de Supabase; pueden diferir hasta la primera sesión. Sincronizar el caché al entrar al dashboard.
4. **Copy del slide 1 del onboarding** — dice "plataforma de estudio de verbos"; la app ya cubre más (TOEFL, reading, grammar, listening).

## 🧪 Cómo repetir la ronda E2E

1. Correo temporal vía API de mail.tm (crear cuenta → token → leer mensajes para el OTP).
2. Navegador in-app de Kimi (o WebBridge con el navegador del usuario si la extensión está conectada).
3. Flujo: landing → signup → OTP → onboarding → crear mazo (2 tarjetas) → guardar → Estudiar → selector → completar sesión → perfil → eliminar cuenta (limpia los datos de prueba).
