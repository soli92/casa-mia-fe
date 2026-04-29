---

# AI Log — casa-mia-fe

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## 2026-04-27 — Soli Prof (RAG) / bootstrap

- Creato questo file: contesto allineato a `AGENTS.md` (Casa Mia frontend, Next.js, SoliDS, WebSocket).
- [Soli Prof](https://github.com/soli92/soli-prof) elenca questo repo in `CORPUS_REPOS` per la base di conoscenza; webhook `push` → re-ingest ([`/api/webhooks/github`](https://soli-prof.vercel.app/api/webhooks/github)). I test `npm test` in questo package **non** dipendono da quel canale.

---

## 2026-04-29 — Migrazione brand Soli + metadata PWA

- Aggiornato branding UI con `SoliLogo` / `LogoLoader` e adozione logo Soli nel `Navbar`, mantenendo compatibilita con tema light/dark.
- Completata la base PWA/metadata: `app/manifest.js`, metadata icone in `app/layout.js`, favicon/apple-touch icon e icone `public/icons/*`.
- Allineata dipendenza design system a **`@soli92/solids ^1.14.1`** (`package.json`, lockfile) e test di guardia `lib/solids-package.test.js`.
- Aggiornata documentazione operativa (`README.md`, `AGENTS.md`) in coerenza con versione SoliDS e stato migrazione.

---
