'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/api'
import { LS_REFRESH_KEY, LS_TOKEN_KEY, persistSession } from '@/lib/authSession'
import { UserPlus, Home } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    familyName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await register(formData)
      localStorage.setItem(LS_TOKEN_KEY, data.accessToken)
      localStorage.setItem(LS_REFRESH_KEY, data.refreshToken)
      persistSession({ user: data.user, family: data.family })
      router.push('/dashboard')
    } catch (err) {
      console.error('Errore registrazione:', err)
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Impossibile contattare il server. Controlla NEXT_PUBLIC_API_URL e CORS (FRONTEND_URL sul backend).'
          : err.message)
      setError(msg || 'Errore durante la registrazione')
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
        <div className="mb-8 flex items-center justify-center">
          <div className="mr-3 rounded-2xl bg-primary p-3">
            <Home className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Casa Mia</h1>
        </div>

        <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
          Crea il tuo account
        </h2>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Nome completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Mario Rossi"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Nome famiglia</label>
            <input
              type="text"
              required
              value={formData.familyName}
              onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Famiglia Rossi"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="mario@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
              minLength={6}
            />
            <p className="mt-1 text-xs text-muted-foreground">Minimo 6 caratteri</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>Creazione account...</span>
              </div>
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Registrati
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-muted-foreground">
          Hai già un account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
