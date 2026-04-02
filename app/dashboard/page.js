'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Package,
  ChefHat,
  Calendar,
  Cpu,
  Users,
  Pencil,
  Check,
  X,
  StickyNote,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import { useSession } from '@/contexts/SessionContext'
import Navbar from '../components/Navbar'

export default function DashboardPage() {
  const router = useRouter()
  const { user, family, hydrated, updateFamilyName } = useSession()
  const [editingFamily, setEditingFamily] = useState(false)
  const [familyNameDraft, setFamilyNameDraft] = useState('')
  const [savingFamily, setSavingFamily] = useState(false)
  const [familyError, setFamilyError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN_KEY)
    if (!token) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (family?.name) setFamilyNameDraft(family.name)
  }, [family?.name])

  const isAdmin = user?.role === 'ADMIN'

  const handleSaveFamilyName = async (e) => {
    e.preventDefault()
    setFamilyError('')
    const next = familyNameDraft.trim()
    if (!next) {
      setFamilyError('Inserisci un nome')
      return
    }
    setSavingFamily(true)
    try {
      await updateFamilyName(next)
      setEditingFamily(false)
    } catch (err) {
      setFamilyError(err.response?.data?.error || 'Impossibile salvare')
    } finally {
      setSavingFamily(false)
    }
  }

  const cards = [
    {
      title: 'Famiglia',
      description: 'Chi fa parte del nucleo: ruoli e contatti',
      icon: Users,
      href: '/famiglia',
      gradient: 'from-teal-500 to-cyan-700',
    },
    {
      title: 'Lavagna familiare',
      description: 'Post-it condivisi: promemoria visibili a tutta la famiglia',
      icon: StickyNote,
      href: '/lavagna',
      gradient: 'from-yellow-500 to-amber-600',
    },
    {
      title: 'Lista della spesa',
      description: 'Aggiungi e spunta: tutta la famiglia vede gli stessi dati',
      icon: ShoppingCart,
      href: '/shopping',
      gradient: 'from-emerald-500 to-emerald-700',
    },
    {
      title: 'Dispensa',
      description: 'Inventario e scadenze condivisi',
      icon: Package,
      href: '/pantry',
      gradient: 'from-orange-500 to-orange-700',
    },
    {
      title: 'Ricette',
      description: 'Ricette del nucleo familiare',
      icon: ChefHat,
      href: '/recipes',
      gradient: 'from-violet-500 to-violet-700',
    },
    {
      title: 'Scadenze',
      description: 'Bollette e pagamenti in comune',
      icon: Calendar,
      href: '/deadlines',
      gradient: 'from-red-500 to-red-700',
    },
    {
      title: 'Documenti',
      description: 'File condivisi con link CDN (PDF, foto, Office…)',
      icon: FileText,
      href: '/documenti',
      gradient: 'from-slate-500 to-slate-700',
    },
    {
      title: 'IoT',
      description: 'Dispositivi collegati alla famiglia',
      icon: Cpu,
      href: '/iot',
      gradient: 'from-sky-500 to-sky-700',
    },
  ]

  if (!hydrated) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <div className="app-main-shell flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Caricamento…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <main className="app-main-shell">
        <section className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                  Ciao{user?.name ? `, ${user.name}` : ''}!
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tutti i membri della famiglia <strong className="text-foreground">{family?.name || '…'}</strong>{' '}
                  condividono spesa, dispensa, ricette, scadenze e IoT.
                </p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-4 border-t border-border pt-4">
              {!editingFamily ? (
                <button
                  type="button"
                  onClick={() => {
                    setFamilyError('')
                    setFamilyNameDraft(family?.name || '')
                    setEditingFamily(true)
                  }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  Modifica nome famiglia
                </button>
              ) : (
                <form onSubmit={handleSaveFamilyName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="family-name" className="mb-1 block text-xs font-medium text-muted-foreground">
                      Nome famiglia (visibile in alto nell&apos;app)
                    </label>
                    <input
                      id="family-name"
                      value={familyNameDraft}
                      onChange={(e) => setFamilyNameDraft(e.target.value)}
                      className="w-full min-h-11 rounded-xl border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      maxLength={80}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingFamily}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50 sm:flex-initial"
                    >
                      <Check className="h-4 w-4" />
                      Salva
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFamily(false)
                        setFamilyError('')
                        setFamilyNameDraft(family?.name || '')
                      }}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-3 hover:bg-muted"
                      aria-label="Annulla"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
              {familyError && <p className="mt-2 text-sm text-destructive">{familyError}</p>}
            </div>
          )}
        </section>

        <h2 className="mb-3 text-lg font-semibold text-foreground sm:mb-4 sm:text-xl">
          Dove vuoi andare?
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className="group flex h-full min-h-[7.5rem] flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all active:scale-[0.99] hover:border-primary/30 hover:shadow-md sm:p-5"
                >
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md transition-transform group-hover:scale-105 sm:h-12 sm:w-12`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-base font-semibold text-card-foreground sm:text-lg">{card.title}</span>
                  <span className="mt-1 flex-1 text-sm leading-snug text-muted-foreground">{card.description}</span>
                  <span className="mt-3 text-sm font-medium text-primary">Apri →</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
    </div>
  )
}
