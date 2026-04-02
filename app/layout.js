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
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
