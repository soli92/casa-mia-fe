'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { joinFamily } from '@/lib/api'
import { LS_REFRESH_KEY, LS_TOKEN_KEY, persistSession } from '@/lib/authSession'
import { Home, KeyRound } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function UniscitiPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    inviteCode: '',
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await joinFamily(formData)
      localStorage.setItem(LS_TOKEN_KEY, data.accessToken)
      localStorage.setItem(LS_REFRESH_KEY, data.refreshToken)
      persistSession({ user: data.user, family: data.family })
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      const msg =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Impossibile contattare il server.'
          : err.message)
      setError(msg || 'Errore durante l’iscrizione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-center">
          <div className="mr-3 rounded-2xl bg-primary p-3">
            <Home className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Casa Mia</h1>
        </div>

        <h2 className="mb-2 text-center text-2xl font-semibold text-foreground">
          Unisciti a una casa
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Inserisci il <strong className="text-foreground">codice invito</strong> che vede
          l’amministratore in <strong className="text-foreground">Famiglia</strong>. Il nome della
          famiglia da solo non basta: ogni &quot;Registrati&quot; crea una casa separata nel
          sistema.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Codice invito</label>
            <input
              type="text"
              required
              autoComplete="off"
              value={formData.inviteCode}
              onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-lg tracking-wider text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="es. AB12CD34"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Il tuo nome</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Se hai già usato &quot;Registrati&quot; con questa email, non puoi riusarla qui: usa
              un’altra email o chiedi all’admin di gestire l’account dalla pagina Famiglia.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Accesso in corso…</span>
            ) : (
              <>
                <KeyRound className="mr-2 h-5 w-5" />
                Entra nella famiglia
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Vuoi creare una <strong className="text-foreground">nuova</strong> casa?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Registrati
          </Link>
          {' · '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
