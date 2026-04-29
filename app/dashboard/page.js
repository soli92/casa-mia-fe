'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  ShoppingCart,
  Package,
  ChefHat,
  Calendar,
  Cpu,
  Users,
  StickyNote,
  FileText,
  ArrowRight,
  AlertCircle,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import { useSession } from '@/contexts/SessionContext'
import {
  getPostIts,
  getUpcomingDeadlines,
  getOverdueDeadlines,
} from '@/lib/api'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'
import Navbar from '../components/Navbar'
import LogoLoader from '../components/LogoLoader'

const POSTIT_PREVIEW = {
  amber:
    'border-amber-300/80 bg-amber-100/90 text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-50',
  rose:
    'border-rose-300/80 bg-rose-100/90 text-rose-950 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-50',
  sky: 'border-sky-300/80 bg-sky-100/90 text-sky-950 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-50',
  lime:
    'border-lime-300/80 bg-lime-100/90 text-lime-950 dark:border-lime-700 dark:bg-lime-950/50 dark:text-lime-50',
  violet:
    'border-violet-300/80 bg-violet-100/90 text-violet-950 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-50',
}

function mergeDeadlineHighlights(overdueList, upcomingList) {
  const seen = new Set()
  const out = []
  for (const d of overdueList) {
    if (seen.has(d.id)) continue
    seen.add(d.id)
    out.push({ ...d, _overdue: true })
  }
  for (const d of upcomingList) {
    if (seen.has(d.id)) continue
    seen.add(d.id)
    out.push({ ...d, _overdue: false })
  }
  out.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  return out
}

function truncate(str, n) {
  const t = String(str || '').trim()
  if (t.length <= n) return t
  return `${t.slice(0, n)}…`
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, family, hydrated } = useSession()

  const [hlLoading, setHlLoading] = useState(true)
  const [hlError, setHlError] = useState('')
  const [deadlineRows, setDeadlineRows] = useState([])
  const [postIts, setPostIts] = useState([])

  const loadHighlights = useCallback(async () => {
    try {
      setHlError('')
      const [overdue, upcoming, notes] = await Promise.all([
        getOverdueDeadlines(),
        getUpcomingDeadlines(),
        getPostIts(),
      ])
      setDeadlineRows(mergeDeadlineHighlights(overdue || [], upcoming || []))
      setPostIts(Array.isArray(notes) ? notes : [])
    } catch (e) {
      console.error(e)
      setHlError('Impossibile caricare il riepilogo in evidenza.')
    } finally {
      setHlLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN_KEY)
    if (!token) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (!hydrated) return
    if (!localStorage.getItem(LS_TOKEN_KEY)) return
    setHlLoading(true)
    loadHighlights()
  }, [hydrated, loadHighlights])

  useDataUpdateRefresh('deadlines', loadHighlights)
  useDataUpdateRefresh('board', loadHighlights)

  const cards = [
    {
      title: 'Famiglia',
      description: 'Membri, codice invito e nome della casa',
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
    {
      title: 'Impostazioni',
      description: 'Notifiche push sulle scadenze e altre preferenze',
      icon: Settings,
      href: '/impostazioni',
      gradient: 'from-zinc-500 to-zinc-700',
    },
  ]

  const deadlinePreview = deadlineRows.slice(0, 8)
  const postItPreview = postIts.slice(0, 6)

  if (!hydrated) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <div className="app-main-shell flex min-h-[50vh] items-center justify-center">
          <LogoLoader />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <main className="app-main-shell">
        <section className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
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
        </section>

        <section className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="mb-1 text-lg font-semibold text-foreground">In evidenza</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Scadenze urgenti e promemoria dalla lavagna; tocca una scadenza per aprire il dettaglio e modificarla.
          </p>

          {hlError && (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {hlError}
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="font-semibold">Scadenze</span>
                </div>
                <Link
                  href="/deadlines"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Tutte
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {hlLoading ? (
                <LogoLoader compact label="Aggiorno scadenze…" />
              ) : deadlinePreview.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                  Nessuna scadenza in ritardo o nei prossimi 7 giorni. Ottimo!
                </p>
              ) : (
                <ul className="space-y-2">
                  {deadlinePreview.map((d) => {
                    const dateLabel = format(new Date(d.dueDate), 'd MMM yyyy', { locale: it })
                    return (
                      <li key={d.id}>
                        <Link
                          href={`/deadlines/${d.id}`}
                          className="flex items-start gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
                        >
                          {d._overdue ? (
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                          ) : (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="font-medium text-foreground">{d.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {d._overdue ? 'Scaduta · ' : ''}
                              {dateLabel}
                              {d.amount != null ? ` · €${Number(d.amount).toFixed(2)}` : ''}
                            </span>
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-foreground">
                  <StickyNote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold">Lavagna</span>
                </div>
                <Link
                  href="/lavagna"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Apri lavagna
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {hlLoading ? (
                <LogoLoader compact label="Aggiorno lavagna…" />
              ) : postItPreview.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                  Nessun post-it. Aggiungine uno dalla lavagna.
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {postItPreview.map((n) => {
                    const color = POSTIT_PREVIEW[n.color] || POSTIT_PREVIEW.amber
                    return (
                      <li key={n.id}>
                        <Link
                          href="/lavagna"
                          className={`block min-h-[4.5rem] rounded-xl border px-3 py-2.5 text-sm leading-snug shadow-sm transition-transform active:scale-[0.99] hover:opacity-95 ${color}`}
                        >
                          {truncate(n.content, 100)}
                          {n.createdBy?.name && (
                            <span className="mt-2 block text-xs opacity-80">— {n.createdBy.name}</span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
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
