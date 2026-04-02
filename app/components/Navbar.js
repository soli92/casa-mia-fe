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
  Users,
  StickyNote,
  FileText,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { clearClientSession } from '@/lib/authSession'
import ThemeToggle from '@/components/ThemeToggle'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useSession } from '@/contexts/SessionContext'
import MobileBottomNav from './MobileBottomNav'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { connectionState } = useCasaMiaWebSocketContext()
  const { family, user } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    clearClientSession()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/famiglia', icon: Users, label: 'Famiglia' },
    { href: '/lavagna', icon: StickyNote, label: 'Lavagna' },
    { href: '/shopping', icon: ShoppingCart, label: 'Spesa' },
    { href: '/pantry', icon: Package, label: 'Dispensa' },
    { href: '/recipes', icon: ChefHat, label: 'Ricette' },
    { href: '/deadlines', icon: Calendar, label: 'Scadenze' },
    { href: '/documenti', icon: FileText, label: 'Documenti' },
    { href: '/iot', icon: Wifi, label: 'IoT' },
  ]

  const familyTitle = family?.name?.trim() || 'La tua famiglia'
  const userLabel = user?.name?.trim()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-[50] border-b border-border bg-card/95 shadow-sm backdrop-blur-md">
        <nav className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8" aria-label="Barra superiore">
          <div className="flex min-h-14 items-center justify-between gap-2 py-2 sm:min-h-16 sm:py-0">
            <Link
              href="/dashboard"
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl py-1 pr-2 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring sm:gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg shadow-sm sm:h-11 sm:w-11">
                <Users className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" aria-hidden />
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-base font-bold leading-tight text-foreground sm:text-lg">
                  {familyTitle}
                </p>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Casa Mia
                  {userLabel ? ` · ${userLabel}` : ''}
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-1 md:flex md:shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/15 font-semibold text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <div className="ml-1 flex items-center gap-1 border-l border-border pl-2">
                <span
                  className="flex min-h-10 min-w-10 items-center justify-center rounded-lg"
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
                  className="flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Esci</span>
                </button>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 md:hidden">
              <span
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl"
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
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl hover:bg-muted"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

        </nav>
      </header>

      {/* Menu laterale mobile: sopra la bottom nav, sotto l’header (notifiche sotto z-50) */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-14 z-[45] bg-black/50 backdrop-blur-[1px] sm:top-16"
            aria-label="Chiudi menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className="fixed bottom-0 right-0 top-14 z-[48] flex w-[min(88vw,288px)] max-w-full flex-col border-l border-border bg-card shadow-2xl sm:top-16"
            aria-label="Menu di navigazione"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold text-foreground">{familyTitle}</p>
              <p className="truncate text-xs text-muted-foreground">Casa Mia</p>
            </div>
            <nav className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-2 py-3">
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 ${
                          isActive
                            ? 'bg-primary/15 font-semibold text-primary'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="mt-4 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Esci</span>
              </button>
            </nav>
          </aside>
        </div>
      )}
      <MobileBottomNav />
    </>
  )
}
