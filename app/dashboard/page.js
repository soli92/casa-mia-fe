'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Package,
  ChefHat,
  Calendar,
  Cpu,
  LogOut,
  Bell,
} from 'lucide-react'
import Link from 'next/link'
import { clearClientSession, LS_TOKEN_KEY, LS_USER_KEY } from '@/lib/authSession'
import ThemeToggle from '@/components/ThemeToggle'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN_KEY)
    const userData = localStorage.getItem(LS_USER_KEY)

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    clearClientSession()
    router.push('/')
  }

  const cards = [
    {
      title: 'Lista della Spesa',
      description: 'Organizza i tuoi acquisti',
      icon: ShoppingCart,
      href: '/shopping',
      gradient: 'from-emerald-500 to-emerald-700',
      stats: '12 prodotti',
    },
    {
      title: 'Dispensa',
      description: 'Inventario prodotti in casa',
      icon: Package,
      href: '/pantry',
      gradient: 'from-orange-500 to-orange-700',
      stats: '3 in scadenza',
    },
    {
      title: 'Ricette',
      description: 'Suggerimenti personalizzati',
      icon: ChefHat,
      href: '/recipes',
      gradient: 'from-violet-500 to-violet-700',
      stats: '8 disponibili',
    },
    {
      title: 'Scadenze',
      description: 'Calendario pagamenti',
      icon: Calendar,
      href: '/deadlines',
      gradient: 'from-red-500 to-red-700',
      stats: '2 imminenti',
    },
    {
      title: 'Hub IoT',
      description: 'Dispositivi smart home',
      icon: Cpu,
      href: '/iot',
      gradient: 'from-sky-500 to-sky-700',
      stats: '5 online',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-primary p-2">
              <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Casa Mia</h1>
              {user && (
                <p className="text-sm text-muted-foreground">Ciao, {user.name}! 👋</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            <button
              type="button"
              className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Gestisci la tua casa in modo intelligente</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl"
              >
                <div className="p-6">
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">{card.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{card.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{card.stats}</span>
                    <span className="text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
                      Vai →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/50 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Spesa settimanale</h3>
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">€87,50</p>
            <p className="mt-1 text-sm text-muted-foreground">-12% rispetto a settimana scorsa</p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/50 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Prodotti in scadenza</h3>
              <Package className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">3</p>
            <p className="mt-1 text-sm text-muted-foreground">Controlla la dispensa</p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/50 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Prossime scadenze</h3>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">2</p>
            <p className="mt-1 text-sm text-muted-foreground">Nei prossimi 7 giorni</p>
          </div>
        </div>
      </main>
    </div>
  )
}
