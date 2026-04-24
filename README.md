# 🏠 Casa Mia - Frontend

Frontend Next.js per **Casa Mia**, la tua app di gestione domestica completa.

## ✨ Features

- 🛒 **Lista della spesa** con categorie e spunta prodotti
- 🥫 **Dispensa intelligente** (`/pantry`) — alert scadenze; **barcode** (fotocamera, `html5-qrcode`) con lookup **Open Food Facts**; **OCR etichetta** (Tesseract.js sul dispositivo) per nome e data di scadenza; storico scansioni in `localStorage`
- 👨‍🍳 **Ricette suggerite** basate su cosa hai in casa
- 📅 **Calendario scadenze** (bollette, abbonamenti, tasse)
- 📝 **Lavagna** (`/lavagna`) — post-it condivisi con la famiglia, trascinamento, colori, sync WebSocket
- 📄 **Documenti** (`/documenti`) — cartelle per organizzare i file, metadati + riferimento bucket; **apertura in app** con URL GET firmato (PDF/immagini in modale); upload da file o **scansione fotocamera** (`capture="environment"`); link temporaneo copiabile negli appunti
- 🏠 **Hub IoT** per controllare dispositivi smart home in tempo reale
- 🔐 **Autenticazione sicura** con JWT + refresh token
- 👨‍👩‍👧‍👦 **Multi-utente** — stessi dati per tutta la famiglia; **navbar** con nome famiglia; admin può rinominare la casa da **Famiglia**
- 🏠 **Dashboard** (`/dashboard`) — riepilogo **scadenze** (link al **dettaglio** `/deadlines/[id]`) e anteprima **post-it**; refresh WebSocket `deadlines` / `board`
- 👨‍👩‍👧 **Famiglia** (`/famiglia`) — admin: **nome della casa**, codice invito, membri
- ⚙️ **Impostazioni** (`/impostazioni`) — notifiche push scadenze (`public/sw.js`, VAPID sul backend, **HTTPS** in produzione)
- 📱 **Mobile-first** — bottom nav scrollabile, **menu laterale** (drawer) su hamburger; toast realtime sotto la barra superiore (`z-index` non copre l’header)

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS** + preset **[@soli92/solids](https://www.npmjs.com/package/@soli92/solids) ^1.7.0** (richiede anche `tailwindcss-animate` in dev, come da preset); **Google Fonts** in `app/layout.js` (SoliDS 1.7)
- **Axios** - API client
- **WebSocket** (`/ws`) — `contexts/CasaMiaWebSocketContext.jsx` (toast, `sendFamilyUpdate`, eventi DOM)
- **Lucide Icons** - Icone moderne
- **date-fns** - Gestione date
- **html5-qrcode** + **tesseract.js** — scansione barcode e OCR in dispensa (solo client)

## 🚀 Quick Start

```bash
# Installa dipendenze
npm install

# Copia e configura env
cp .env.example .env.local
# Modifica NEXT_PUBLIC_API_URL con l'URL del backend

# Avvia in sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

Non sono previsti utenti demo: crea un account da **Registrati** (famiglia + primo admin) oppure usa il backend per altri flussi.

## 📁 Struttura progetto

```
public/
└── sw.js            # Service worker (push scadenze)

app/
├── dashboard/       # Home, in evidenza, griglia moduli
├── impostazioni/    # Push notifiche
├── deadlines/       # Calendario + lista; dettaglio/modifica in `[id]/page.js`
├── lavagna/         # Lavagna post-it
├── documenti/       # Documenti famiglia (cartelle, viewer presigned, camera)
├── login/           # Login
├── register/        # Registrazione
├── shopping/        # Lista spesa
├── pantry/          # Dispensa (barcode, OCR, form)
├── recipes/         # Ricette
├── iot/             # Hub IoT
├── components/
│   ├── Navbar.js                # Titolo famiglia, drawer mobile, link desktop
│   ├── MobileBottomNav.js
│   ├── PushNotificationsSettings.jsx
│   ├── PantryBarcodeModal.jsx   # Scanner EAN/UPC (id univoco + cleanup Strict Mode)
│   └── PantryOcrModal.jsx
├── providers.jsx    # Theme → SessionProvider → WebSocket
├── globals.css      # SoliDS + `.app-main-shell` (padding sopra bottom nav)
└── page.js          # Landing

components/
└── ThemeProvider.jsx / ThemeToggle.jsx

contexts/
├── SessionContext.jsx           # user + family, sync GET /auth/me, persistenza LS
└── CasaMiaWebSocketContext.jsx  # WS, toast (z-46), sendFamilyUpdate, `board` in toast

hooks/
└── useDataUpdateRefresh.js

lib/
├── api.js                 # REST (incluso getDeadlineById, push)
├── deadlineCategories.js  # Categorie allineate al backend
├── openFoodFacts.js       # Lookup barcode → nome/categoria (API pubblica)
├── pantryOcr.js           # OCR etichetta (parse scadenza, nome)
├── pantryScanHistory.js   # Storico scansioni (localStorage)
├── pushClient.js
├── apiUrl.js
├── authSession.js  # token, refresh, user, **family** (`persistSession`)
└── themeStorage.js
```

## 🔧 Variabili d'ambiente

Crea `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Per il deploy su Vercel (URL del backend di produzione):
```env
NEXT_PUBLIC_API_URL=https://casa-mia-be.onrender.com
```

Le **notifiche push** usano lo stesso backend: configura lì le chiavi VAPID. Il browser deve servire l’app su **HTTPS** (su localhost funziona in chiaro).

## 🎨 UI/UX

- **SoliDS**: variabili `--background`, `--foreground`, `--primary`, ecc.; `data-theme="light"` | `data-theme="dark"` su `<html>` (preferenza salvata in `localStorage`, bootstrap in `app/layout.js`).
- Toggle sole/luna in landing, login, register, navbar.
- **Menu mobile**: drawer da destra (backdrop, chiusura Esc / tap fuori / cambio rotta); elenco voci scrollabile sopra la bottom nav.
- **WebSocket** (`/ws`): toast in basso a destra (`z-[46]`, sotto header `z-50`); risorse `shopping`, `pantry`, `deadlines`, `recipes`, `iot`, **`board`**, **`documents`**; dopo mutazioni REST si invia `sendFamilyUpdate`; niente toast “altro membro” se `userId` coincide con l’utente in `localStorage`.

## 🔗 Backend

Il frontend richiede il backend Node.js:
👉 [casa-mia-be](https://github.com/soli92/casa-mia-be)

## 📦 Deploy

### Vercel (consigliato)

```bash
vercel --prod
```

Oppure connetti la repo su [vercel.com](https://vercel.com) - rileva automaticamente Next.js.

### Docker

```bash
docker build -t casa-mia-fe .
docker run -p 3000:3000 casa-mia-fe
```

## 🧪 Testing

```bash
npm test           # Vitest (`vitest.config.mjs`, env Node): `lib/*.test.js`
npm run test:watch
npm run lint
npm run build
```

Suite attuale: `apiUrl`, `api.documents`, **`openFoodFacts`**, **`pantryOcr`** (parse date / nome da OCR), **`pantryScanHistory`**.

## 📝 TODO

- [ ] PWA support (manifest + installabilità oltre allo SW push)
- [ ] Multi-lingua (i18n)
- [ ] Import ricette da URL

## 📄 License

MIT

---

Fatto con ❤️ da **Soli Agent**
