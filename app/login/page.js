'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api'
import { LS_REFRESH_KEY, LS_TOKEN_KEY, persistSession } from '@/lib/authSession'
import { LogIn, Home } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(formData.email, formData.password)
      localStorage.setItem(LS_TOKEN_KEY, data.accessToken)
      localStorage.setItem(LS_REFRESH_KEY, data.refreshToken)
      persistSession({ user: data.user, family: data.family })
      router.push('/dashboard')
    } catch (err) {
      console.error('Errore login:', err)
      setError(err.response?.data?.error || 'Errore durante il login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
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
          Bentornato!
        </h2>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="tua@email.com"
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
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>Accesso...</span>
              </div>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Accedi
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-muted-foreground">
          Non hai un account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}
