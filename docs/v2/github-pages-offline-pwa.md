# GitHub Pages, PWA, and offline-first (retention contract)

This document records **non-negotiable behaviors** for hosting the web app on **GitHub Pages** while keeping **offline-first** operation and a **single persisted sign-in** on device. Any change to routing, build base, or auth storage should be checked against this list.

## What “offline-first” means here

1. **Clinical data** lives in **IndexedDB** (Dexie: chart draft, encounters, versions, outbox, attachments queue, local audit). Reading and editing the chart does **not** require the network.
2. **Sync** (`POST /sync/push`, pull, attachments) is **best-effort when online**. The UI queues work locally; failures surface as sync status, not blocked chart edits.
3. **Installable PWA**: `vite-plugin-pwa` precaches the app shell and static assets; **`public/offline.html`** is the Workbox **navigation fallback** when a document request fails (e.g. deep link while offline). See `apps/web/vite.config.ts` (`navigateFallback`, `globPatterns`).

## What “single sign-on” means in this static app

GitHub Pages serves **static files only**—there is no server-side session. The app implements **one login per device** that **survives restarts** via:

- **`authSession`** row in Dexie (`id: 'current'`) with **`trustedUntil`** (30-day window) and, when using the API, **`accessToken`** (JWT).
- **`hydrate()`** on boot restores user + token from IndexedDB so the installed PWA **opens signed-in** without hitting `/auth/login` again until trust expires or the user signs out.

**True enterprise SSO** (SAML / OIDC with a corporate IdP) is **not** implemented in-repo today. Adding it later would typically use **OAuth 2.0 + PKCE** in the SPA against your IdP, still storing tokens in Dexie for offline reuse until expiry—**without** removing the offline chart path.

## GitHub Pages deployment invariants

| Invariant | Location |
|-----------|----------|
| App served under **`/ayekta-emr/`** | `apps/web/vite.config.ts` → `APP_BASE` / `base` |
| React Router **`basename`** matches | `apps/web/src/main.tsx` → `BrowserRouter basename="/ayekta-emr"` |
| PWA **`start_url`** matches | `vite.config.ts` → `manifest.start_url` |
| **Precache + offline fallback** | `vite.config.ts` → `VitePWA` `workbox` block |
| **Deploy artifact** | `npm run build` → `apps/web/dist/` → `npm run deploy` (`gh-pages -d dist`) |

If you change the public path (e.g. custom domain at `/`), update **all three**: Vite `base`, `BrowserRouter` `basename`, and manifest `start_url` together.

## Build-time API URL (`VITE_SYNC_API_BASE`)

Vite embeds `VITE_*` at **build** time. For GitHub Pages, build with your **production API HTTPS origin** in `apps/web/.env.production` (or CI env), e.g.:

- `VITE_SYNC_API_BASE=https://api.yourdomain.com`
- `VITE_SYNC_TENANT_SLUG=default` (or your tenant)

The API must allow **CORS** for your Pages origin, e.g. `https://YOUR_USER.github.io`.

## Online vs offline sign-in (when API auth is enabled)

- **First login** with username/password calls **`POST …/auth/login`** and requires **network**.
- **Subsequent launches**: **`hydrate()`** restores session from IndexedDB → works **offline** for chart + local features until **`trustedUntil`** passes or JWT is revoked server-side (API may still reject sync when offline or expired).
- **No `VITE_SYNC_API_BASE`**: demo **mock** accounts work fully **offline** after first successful login (also stored in Dexie).

Do **not** add a “fallback to mock login when API fails” in production builds—it would weaken security when the API is configured.

## Checklist before merging routing or PWA changes

- [ ] `base`, `basename`, and `start_url` still align.
- [ ] `offline.html` remains precached / reachable at the fallback path.
- [ ] Dexie schema migrations remain backward-compatible for existing installs.
- [ ] Session restore (`authStore.hydrate`) still runs before gated routes.

## Related code

- `apps/web/vite.config.ts` — PWA + `APP_BASE`
- `apps/web/src/main.tsx` — router basename
- `apps/web/src/store/authStore.ts` — login, JWT, `trustedUntil`, Dexie `authSession`
- `apps/web/public/offline.html` — offline shell
- `apps/web/src/services/syncTransport.ts` — network vs mock sync
