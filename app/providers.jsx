'use client'

import { ThemeProvider } from '@/components/ThemeProvider'
import { SessionProvider } from '@/contexts/SessionContext'
import { CasaMiaWebSocketProvider } from '@/contexts/CasaMiaWebSocketContext'

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <CasaMiaWebSocketProvider>{children}</CasaMiaWebSocketProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
