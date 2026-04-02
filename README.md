# 🏠 Casa Mia - Frontend

Frontend Next.js per **Casa Mia**, la tua app di gestione domestica completa.

## ✨ Features

- 🛒 **Lista della spesa** con categorie e spunta prodotti
- 🥫 **Dispensa intelligente** con alert scadenze
- 👨‍🍳 **Ricette suggerite** basate su cosa hai in casa
- 📅 **Calendario scadenze** (bollette, abbonamenti, tasse)
- 🏠 **Hub IoT** per controllare dispositivi smart home in tempo reale
- 🔐 **Autenticazione sicura** con JWT + refresh token
- 👨‍👩‍👧‍👦 **Multi-utente** - condividi la gestione con la famiglia

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
├── dashboard/       # Home dashboard
├── login/          # Login page
├── register/       # Registrazione
├── shopping/       # Lista spesa
├── pantry/         # Gestione dispensa
├── recipes/        # Ricette e suggerimenti
├── deadlines/      # Scadenze e calendario
├── iot/            # Hub IoT
├── providers.jsx   # Theme + WebSocket context
├── globals.css     # SoliDS + Tailwind
└── page.js         # Landing page

components/
└── ThemeProvider.jsx / ThemeToggle.jsx

contexts/
└── CasaMiaWebSocketContext.jsx  # WS, toast, sendFamilyUpdate

hooks/
└── useDataUpdateRefresh.js      # refetch su evento data_update

lib/
├── api.js          # Axios + interceptor JWT / refresh
├── apiUrl.js       # Base URL API + URL WebSocket (`/ws`)
├── authSession.js
└── themeStorage.js # chiave `data-theme` (light | dark)
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
- Toggle sole/luna in landing, login, register, dashboard e navbar.
- **WebSocket** (`/ws`): toast su `iot_update` / `data_update` / errori; icona **Radio** in navbar se connesso; dopo mutazioni REST la UI invia `sendFamilyUpdate` così gli altri client ricevono broadcast e possono rifetchare (stesso tab: niente toast se `userId` coincide).

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
