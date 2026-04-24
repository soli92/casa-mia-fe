import './globals.css'
import Providers from './providers'
import { THEME_STORAGE_KEY } from '@/lib/themeStorage'

export const metadata = {
  title: 'Casa Mia - Gestione Casa Intelligente',
  description: 'Gestisci spesa, dispensa, ricette, scadenze e dispositivi IoT della tua casa',
}

const themeBootstrap = `
try {
  var k = ${JSON.stringify(THEME_STORAGE_KEY)};
  var t = localStorage.getItem(k);
  if (t === 'dark' || t === 'light') {
    document.documentElement.setAttribute('data-theme', t);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch (e) {}
`

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@400;600;700&family=Courier+Prime&family=Crimson+Text:wght@600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Merriweather:wght@400;700&family=Orbitron:wght@400;500;600;700&family=Oswald:wght@400;600;700&family=Rajdhani:wght@500;600;700&family=Russo+One&family=Share+Tech+Mono&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
