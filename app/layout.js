import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Casa Mia - Gestione Casa Intelligente',
  description: 'Gestisci spesa, dispensa, ricette, scadenze e dispositivi IoT della tua casa',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
