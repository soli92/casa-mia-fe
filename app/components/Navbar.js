'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  ShoppingCart,
  Package,
  ChefHat,
  Calendar,
  Wifi,
  LogOut,
  Menu,
  X,
  Radio,
} from 'lucide-react'
import { useState } from 'react'
import { clearClientSession } from '@/lib/authSession'
import ThemeToggle from '@/components/ThemeToggle'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { connectionState } = useCasaMiaWebSocketContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    clearClientSession()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/shopping', icon: ShoppingCart, label: 'Spesa' },
    { href: '/pantry', icon: Package, label: 'Dispensa' },
    { href: '/recipes', icon: ChefHat, label: 'Ricette' },
    { href: '/deadlines', icon: Calendar, label: 'Scadenze' },
    { href: '/iot', icon: Wifi, label: 'IoT' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg">
              🏠
            </div>
            <span className="hidden text-xl font-bold text-foreground sm:block">Casa Mia</span>
          </Link>

          <div className="hidden items-center space-x-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-all ${
                    isActive
                      ? 'bg-primary/15 font-semibold text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="ml-2 flex items-center gap-2 pl-2">
              <span
                className="flex items-center"
                title={
                  connectionState === 'open'
                    ? 'Realtime connesso'
                    : connectionState === 'connecting'
                      ? 'Connessione in corso…'
                      : 'Realtime non attivo'
                }
              >
                <Radio
                  className={`h-5 w-5 ${
                    connectionState === 'open'
                      ? 'text-primary'
                      : connectionState === 'connecting'
                        ? 'animate-pulse text-muted-foreground'
                        : 'text-muted-foreground'
                  }`}
                />
              </span>
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-destructive transition-all hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Esci</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <span
              title={
                connectionState === 'open'
                  ? 'Realtime connesso'
                  : connectionState === 'connecting'
                    ? 'Connessione…'
                    : 'Realtime off'
              }
            >
              <Radio
                className={`h-5 w-5 ${
                  connectionState === 'open' ? 'text-primary' : 'text-muted-foreground'
                } ${connectionState === 'connecting' ? 'animate-pulse' : ''}`}
              />
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                      isActive
                        ? 'bg-primary/15 font-semibold text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Esci</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
