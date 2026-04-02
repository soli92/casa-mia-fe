'use client'

import { ThemeProvider } from '@/components/ThemeProvider'
import { CasaMiaWebSocketProvider } from '@/contexts/CasaMiaWebSocketContext'

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <CasaMiaWebSocketProvider>{children}</CasaMiaWebSocketProvider>
    </ThemeProvider>
  )
}
