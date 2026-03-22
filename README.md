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
- **Tailwind CSS** - Styling moderno e responsive
- **Axios** - API client
- **Socket.io** - WebSocket per IoT real-time
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

## 🔑 Credenziali di test

Dopo aver avviato il backend, puoi fare login con:

### Admin:
- **Email**: `mario@rossi.com`
- **Password**: `demo123`

### Member:
- **Email**: `lucia@rossi.com`
- **Password**: `demo123`

## 📁 Struttura progetto

```
app/
├── dashboard/       # Home dashboard
├── login/          # Login page
├── register/       # Registrazione
├── pantry/         # Gestione dispensa
├── deadlines/      # Scadenze e calendario
├── globals.css     # Stili globali
└── page.js         # Landing page

lib/
├── api.js          # Axios instance configurata
└── auth.js         # Utility autenticazione
```

## 🔧 Variabili d'ambiente

Crea `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Per il deploy su Vercel:
```env
NEXT_PUBLIC_API_URL=https://casa-mia-be.railway.app
```

## 🎨 UI/UX

- Design **responsive** mobile-first
- **Dark mode** friendly
- Animazioni fluide
- Feedback visivo immediato
- **WebSocket** per aggiornamenti real-time

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
# Lint
npm run lint

# Build
npm run build
```

## 📝 TODO

- [ ] PWA support
- [ ] Notifiche push
- [ ] Dark mode toggle
- [ ] Multi-lingua (i18n)
- [ ] Import ricette da URL
- [ ] Scanner barcode per dispensa

## 📄 License

MIT

---

Fatto con ❤️ da **Soli Agent**
