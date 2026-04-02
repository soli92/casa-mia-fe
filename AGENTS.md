# AGENTS.md — contesto per assistenti AI

**Aggiornato:** 2026-04-03

## Progetto

**Next.js 14** (App Router), **@soli92/solids** (CSS + Tailwind preset), **Axios**, **WebSocket** nativo verso `/ws`. Pagina **`/documenti`**: cartelle, upload (file + fotocamera `capture="environment"`), anteprima con URL firmato da `GET /documents/:id/access-url`.

## Checklist

1. **Env** — `cp .env.example .env.local`; `NEXT_PUBLIC_API_URL` punta al backend (es. `http://localhost:3001`). Il client non usa chiavi S3: solo API REST.
2. **Sessione client** — `lib/authSession.js`: `token`, `refreshToken`, `user`, **`family`** (`persistSession` / `loadStoredSession`); `SessionContext` fa sync con `GET /auth/me`.
3. **Prima di PR** — `npm test` (`apiUrl`, `api.documents`) · `npm run lint` · `npm run build`.
4. **Non committare** `.env.local` con segreti.

## Comandi

`npm run dev` · `npm test` · `npm run lint` · `npm run build`

## File utili

- `app/layout.js` — script anti-flash tema + `data-theme` default
- `components/ThemeProvider.jsx` — stato tema + sync `document.documentElement`
- `contexts/SessionContext.jsx` — `user` / `family`, `updateFamilyName` (admin)
- `contexts/CasaMiaWebSocketContext.jsx` — WebSocket, toast (`z-[46]`), `sendFamilyUpdate`, evento `casa-mia:data-update`; risorsa **`documents`** per sync documenti/cartelle
- `app/components/Navbar.js` — drawer mobile (`z-45` backdrop, `z-48` panel, header `z-50`)
- `app/documenti/page.js` — cartelle, viewer (PDF/immagini), `useDataUpdateRefresh('documents')`
- `hooks/useDataUpdateRefresh.js` — refetch quando `detail.resource` coincide
- `lib/api.js` (documenti: cartelle, presign, commit, `getDocumentAccessUrl`, delete) · `lib/apiUrl.js` (`resolveWebSocketUrl`)
- `README.md`

## Note integrazione

- Tema: solo **`light`** e **`dark`** (token SoliDS standard), non temi nominati tipo `cyberpunk`.
- WebSocket: protocollo allineato al backend (`ws` / `wss` da `NEXT_PUBLIC_API_URL`); dopo mutazioni su documenti inviare `sendFamilyUpdate('documents', ...)`.
- Refresh: `POST /api/auth/refresh` → `accessToken` / `refreshToken`.
- Documenti: link di anteprima e “copia link” sono **temporanei** (TTL lato backend); non assumere URL pubblici permanenti sul bucket.
