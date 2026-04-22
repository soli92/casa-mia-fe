---

# AI Log — casa-mia-fe

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

Frontend **Next.js** (App Router) per **Casa Mia**: dashboard, dispensa con barcode/OCR, scadenze, documenti, famiglia/inviti, lavagna, WebSocket, notifiche push, tema chiaro/scuro con **@soli92/solids**.

**Stack AI usato (inferito)**: assistenza LLM/IDE (messaggi misti IT/EN, redesign con emoji 🎨); **nessun merge `cursor/` esplicito** in history analizzata — resto **inferenza moderata**.

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

**Prompt chiave usati**: > [TODO da compilare manualmente]

**Lezioni apprese**: > [TODO da compilare manualmente]

### Fase 2 — UI “moderna” e allineamento token backend

**Timeframe**: `b0be571`–`49271cc` redesign componenti → `ee07ec5` fix token login/register.

**Cosa è stato fatto**: Navbar, animazioni, miglioramenti grafici pagine chiave, interceptors `lib/api.js`, fix uso `accessToken` dal backend.

**Evidenza di AI-assist** (inferita):

- Commit ripetuti `🎨 Miglioramento/Migliorata…` suggeriscono passate rapide di polishing UI (comuni con assistenza visiva).

**Decisioni architetturali notevoli**:

- Separazione progressiva tra **UI** e **integrazione API** (fix auth dopo redesign).

**Prompt chiave usati**: > [TODO da compilare manualmente]

**Lezioni apprese**: > [TODO da compilare manualmente]

### Fase 3 — SoliDS, WebSocket, feature dominio (famiglia, documenti, push)

**Timeframe**: `6e1535c` SoliDS + WS → `9b56c98` impostazioni push e test.

**Cosa è stato fatto**: tema chiaro/scuro, toast e pagine dominio; pagina `/unisciti`; documenti presigned; lavagna; notifiche push e `sw.js`; OCR Tesseract; bump SoliDS `54306fb`.

**Evidenza di AI-assist** (inferita):

- Feature ampie descritte in un solo commit (`629a213`, `9b56c98`) possono indicare batch di lavoro assistito.

**Decisioni architetturali notevoli**:

- **SoliDS** come design system unico con il resto dell’ecosistema soli92.
- **Web Push** e service worker come parte del prodotto.

**Prompt chiave usati**: > [TODO da compilare manualmente]

**Lezioni apprese**: > [TODO da compilare manualmente]

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

> [TODO da compilare manualmente: performance OCR, accessibilità, test e2e]

---

> **Nota metodologica**: questo file è stato generato retroattivamente analizzando la history del repo. Le sezioni con `> [TODO da compilare manualmente]` richiedono la memoria del developer e non possono essere inferite dalla sola analisi automatica. Integra progressivamente con annotazioni manuali mentre lavori alle prossime fasi del progetto.

---
