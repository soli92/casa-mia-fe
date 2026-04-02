# 🏠 Casa Mia - Frontend

Frontend Next.js per **Casa Mia**, la tua app di gestione domestica completa.

## ✨ Features

- 🛒 **Lista della spesa** con categorie e spunta prodotti
- 🥫 **Dispensa intelligente** con alert scadenze
- 👨‍🍳 **Ricette suggerite** basate su cosa hai in casa
- 📅 **Calendario scadenze** (bollette, abbonamenti, tasse)
- 📝 **Lavagna** (`/lavagna`) — post-it condivisi con la famiglia, trascinamento, colori, sync WebSocket
- 🏠 **Hub IoT** per controllare dispositivi smart home in tempo reale
- 🔐 **Autenticazione sicura** con JWT + refresh token
- 👨‍👩‍👧‍👦 **Multi-utente** — stessi dati per tutta la famiglia; **navbar** con nome famiglia; admin può rinominare la famiglia dalla dashboard
- 📱 **Mobile-first** — bottom nav scrollabile, **menu laterale** (drawer) su hamburger; toast realtime sotto la barra superiore (`z-index` non copre l’header)

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS** + preset **[@soli92/solids](https://www.npmjs.com/package/@soli92/solids)** (richiede anche `tailwindcss-animate` in dev, come da preset)
- **Axios** - API client
- **WebSocket** (`/ws`) — `contexts/CasaMiaWebSocketContext.jsx` (toast, `sendFamilyUpdate`, eventi DOM)
- **Lucide Icons** - Icone moderne
- **date-fns** - Gestione date

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
app/
├── dashboard/       # Home + modifica nome famiglia (admin)
├── lavagna/         # Lavagna post-it
├── login/           # Login
├── register/        # Registrazione
├── shopping/        # Lista spesa
├── pantry/          # Dispensa
├── recipes/         # Ricette
├── deadlines/       # Scadenze
├── iot/             # Hub IoT
├── components/
│   ├── Navbar.js         # Titolo famiglia, drawer mobile, link desktop
│   └── MobileBottomNav.js
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
├── api.js          # REST incluso board + PATCH family
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

## 🎨 UI/UX

- **SoliDS**: variabili `--background`, `--foreground`, `--primary`, ecc.; `data-theme="light"` | `data-theme="dark"` su `<html>` (preferenza salvata in `localStorage`, bootstrap in `app/layout.js`).
- Toggle sole/luna in landing, login, register, navbar.
- **Menu mobile**: drawer da destra (backdrop, chiusura Esc / tap fuori / cambio rotta); elenco voci scrollabile sopra la bottom nav.
- **WebSocket** (`/ws`): toast in basso a destra (`z-[46]`, sotto header `z-50`); risorse `shopping`, `pantry`, `deadlines`, `recipes`, `iot`, **`board`**; dopo mutazioni REST si invia `sendFamilyUpdate`; niente toast “altro membro” se `userId` coincide con l’utente in `localStorage`.

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
npm test           # Vitest (es. lib/apiUrl)
npm run test:watch
npm run lint
npm run build
```

## 📝 TODO

- [ ] PWA support
- [ ] Notifiche push
- [ ] Multi-lingua (i18n)
- [ ] Import ricette da URL
- [ ] Scanner barcode per dispensa

## 📄 License

MIT

---

Fatto con ❤️ da **Soli Agent**
