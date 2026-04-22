---

# AI Log — casa-mia-fe

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

Frontend **Next.js** (App Router) per **Casa Mia**: dashboard, dispensa con barcode/OCR, scadenze, documenti, famiglia/inviti, lavagna, WebSocket, notifiche push, tema chiaro/scuro con **@soli92/solids**.

**Stack AI usato (inferito; aggiornato 2026-04-22)**: assistenza **IDE/LLM probabile** (commit 🎨 ripetuti, sequenza “Add X page”). **Nessun** merge `cursor/*` in history analizzata. `AGENTS.md` + pattern `.cursor/rules` dell’ecosistema. Nessun SDK AI nel frontend (`package.json`).

**Periodo di sviluppo**: 2026-03-22 (`01bdf9a` Initial commit) → 2026-04-08 (`54306fb` bump SoliDS).

**Numero di commit**: 44

---

## Fasi di sviluppo (inferite dal history)

### Fase 1 — Scaffold Next.js 14+ e pagine base

**Timeframe**: `01bdf9a` → `4b929fb` layout App Router.

**Cosa è stato fatto**: Tailwind/PostCSS/Next config, homepage, client API, pagine auth e dashboard/pantry/deadlines, `jsconfig` path aliases.

**Evidenza di AI-assist** (inferita):

- Sequenza “Add X page” ravvicinata tipica di bootstrap guidato.

**Decisioni architetturali notevoli**:

- **App Router** (`4b929fb Add root layout for Next.js 14 App Router`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Crea app Next.js App Router con Tailwind, pagine login/register/dashboard/pantry/deadlines e client API."
> *Evidenza*: `01bdf9a`–`4b929fb`, messaggi `Add X page`.

> **Prompt [inferito]**: Nessun prompt specifico desumibile; **bootstrap standard** Next + Tailwind.

**Lezioni apprese**

- Separare commit di **config** da pagine UI semplifica il bisect (`c759104`…`9ba1fd1`).

### Fase 2 — UI “moderna” e allineamento token backend

**Timeframe**: `b0be571`–`49271cc` redesign componenti → `ee07ec5` fix token login/register.

**Cosa è stato fatto**: Navbar, animazioni, miglioramenti grafici pagine chiave, interceptors `lib/api.js`, fix uso `accessToken` dal backend.

**Evidenza di AI-assist** (inferita):

- Commit ripetuti `🎨 Miglioramento/Migliorata…` suggeriscono passate rapide di polishing UI (comuni con assistenza visiva).

**Decisioni architetturali notevoli**:

- Separazione progressiva tra **UI** e **integrazione API** (fix auth dopo redesign).

**Prompt chiave usati**

> **Prompt [inferito]**: "Ridisegna dashboard/login/register/home con navbar e animazioni; aggiorna interceptors API."
> *Evidenza*: commit `🎨` `b0be571`–`49271cc`, poi `ee07ec5`/`c705325`.

**Lezioni apprese**

- Dopo redesign, il backend può aver cambiato forma token → allineare **login/register** a `accessToken` esplicito (`ee07ec5`, `c705325`).

### Fase 3 — SoliDS, WebSocket, feature dominio (famiglia, documenti, push)

**Timeframe**: `6e1535c` SoliDS + WS → `9b56c98` impostazioni push e test.

**Cosa è stato fatto**: tema chiaro/scuro, toast e pagine dominio; pagina `/unisciti`; documenti presigned; lavagna; notifiche push e `sw.js`; OCR Tesseract; bump SoliDS `54306fb`.

**Evidenza di AI-assist** (inferita):

- Feature ampie descritte in un solo commit (`629a213`, `9b56c98`) possono indicare batch di lavoro assistito.

**Decisioni architetturali notevoli**:

- **SoliDS** come design system unico con il resto dell’ecosistema soli92.
- **Web Push** e service worker come parte del prodotto.

**Prompt chiave usati**

> **Prompt [inferito]**: "Integra SoliDS e tema chiaro/scuro, WebSocket con toast, pagine famiglia/documenti/push, OCR Tesseract in dispensa, bump SoliDS."
> *Evidenza*: `6e1535c`, `59f36d1`, `40f82f1`, `9b56c98`, `54306fb`.

**Lezioni apprese**

- **Chiamate pubbliche** (register) non devono forzare Bearer assente (`c9e9d02`).
- **z-index** di toast vs drawer richiede tuning dopo introduzione drawer mobile (`2c558a7`).

---

## Pattern ricorrenti identificati

- Commit **bilingue** (italiano per UX, inglese per setup tecnico).
- Prefisso emoji **🎨** su molti commit di UI.
- **feat/fix/docs** in coda progetto per allineamento con backend Casa Mia BE.
- Aggiornamenti **@soli92/solids** allineati ad altri repo (stesso giorno del bump su pippify/dome/bachelor-party).

---

## Tecnologie e scelte di stack

- **Framework**: Next.js (App Router), React
- **Styling**: Tailwind + preset SoliDS
- **State**: hook React, client API custom, WebSocket
- **Deploy**: Vercel (`235005f`)
- **LLM integration**: nessuna nel prodotto

## Problemi tecnici risolti (inferiti)

1. **Chiamate pubbliche senza Bearer**: `c9e9d02 fix(auth): registrazione e chiamate pubbliche senza Bearer`.
2. **Token login/register**: `ee07ec5`, `c705325`.
3. **Z-index toast / drawer**: `2c558a7 feat(ui): … toast z-index`.

---

## Appendice — Commit notevoli (estratto da `git log --oneline`)

- `54306fb` chore(deps): bump @soli92/solids to ^1.5.0
- `9b56c98` feat: impostazioni push, scadenze dettaglio, dispensa scanner e test
- `629a213` feat(dashboard): evidenza scadenze e lavagna, notifiche push, sw.js
- `59f36d1` feat(documenti): cartelle, viewer presigned, scansione fotocamera
- `40f82f1` feat(pantry): OCR etichetta (Tesseract) e storico scansioni locale
- `6e1535c` feat: SoliDS, tema chiaro/scuro, WebSocket con toast e pagine shopping/recipes/iot
- `ee07ec5` Fix: aggiorna login per usare accessToken dal backend
- `4b929fb` Add root layout for Next.js 14 App Router
- `235005f` Add Vercel deployment configuration
- `01bdf9a` Initial commit

---

## Punti aperti / note per il futuro

- **grep `TODO|FIXME|HACK|XXX`** in `app/`, `components/`, `lib/`: nessun match in questa passata.
- **OCR Tesseract / fotocamera**: performance e privacy (storage storico locale) da rivedere con metriche reali (`40f82f1`).
- **Debito tecnico inferito**: nessun workflow Playwright citato in `AI_LOG` originale — e2e potrebbero mancare o essere manuali.
- **Debito tecnico inferito**: allineamento versione Next “14” nei messaggi vs stack attuale: aggiornare doc se il major è salito.
- **Debito tecnico inferito**: service worker / push: test cross-browser (Safari iOS) non evidenziati nei commit analizzati.

---

> **Nota metodologica**: aggiornamento inferenze 2026-04-22; validare accessibilità con audit dedicato (non deducibile da git soltanto).

---

## Metodologia compilazione automatica

Completamento autonomo il **22 aprile 2026** analizzando:

- **44** commit
- **~7** file (`package.json`, `next.config.*`, `AGENTS.md`, `jsconfig.json`, `lib/api.js`, `app/layout.js` citati in AGENTS)
- **0** occorrenze TODO/FIXME nei path sorgente principali (grep workspace)

**Punti di minore confidenza:**

- Attribuzione “LLM” senza merge `cursor/*`: confidenza media.
- Copertura grep limitata se alcune cartelle non erano nel workspace index.

---
