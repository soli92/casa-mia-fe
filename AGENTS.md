# AGENTS.md — contesto per assistenti AI

**Aggiornato:** 2026-04-02

## Progetto

**Next.js 14** (App Router), **@soli92/solids** (CSS + Tailwind preset), **Axios**, **WebSocket** nativo verso `/ws`.

## Checklist

1. **Env** — `cp .env.example .env.local`; `NEXT_PUBLIC_API_URL` punta al backend (es. `http://localhost:3001`).
2. **Sessione client** — `lib/authSession.js`: `token`, `refreshToken`, `user`, **`family`** (`persistSession` / `loadStoredSession`); `SessionContext` fa sync con `GET /auth/me`.
3. **Prima di PR** — `npm test` · `npm run lint` · `npm run build`.
4. **Non committare** `.env.local` con segreti.

## Comandi

`npm run dev` · `npm test` · `npm run lint` · `npm run build`

## File utili

- `app/layout.js` — script anti-flash tema + `data-theme` default
- `components/ThemeProvider.jsx` — stato tema + sync `document.documentElement`
- `contexts/SessionContext.jsx` — `user` / `family`, `updateFamilyName` (admin)
- `contexts/CasaMiaWebSocketContext.jsx` — WebSocket, toast (`z-[46]`), `sendFamilyUpdate`, evento `casa-mia:data-update`
- `app/components/Navbar.js` — drawer mobile (`z-45` backdrop, `z-48` panel, header `z-50`)
- `hooks/useDataUpdateRefresh.js` — refetch quando `detail.resource` coincide
- `lib/api.js` · `lib/apiUrl.js` (`resolveWebSocketUrl`)
- `README.md`

## Note integrazione

- Tema: solo **`light`** e **`dark`** (token SoliDS standard), non temi nominati tipo `cyberpunk`.
- WebSocket: protocollo allineato al backend (`ws` / `wss` da `NEXT_PUBLIC_API_URL`).
- Refresh: `POST /api/auth/refresh` → `accessToken` / `refreshToken`.
