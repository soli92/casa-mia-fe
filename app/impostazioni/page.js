'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import Navbar from '../components/Navbar'
import PushNotificationsSettings from '../components/PushNotificationsSettings'
import { LS_TOKEN_KEY } from '@/lib/authSession'

export default function ImpostazioniPage() {
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem(LS_TOKEN_KEY)) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="app-main-shell">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mb-8 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Impostazioni</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preferenze di questo dispositivo e notifiche.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Notifiche scadenze</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ricevi un promemoria push sulle scadenze della tua famiglia.
          </p>
          <div className="mt-4">
            <PushNotificationsSettings />
          </div>
        </section>
      </main>
    </div>
  )
}
