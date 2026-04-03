'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import { getDeadlineById, updateDeadline, deleteDeadline } from '@/lib/api'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { DEADLINE_CATEGORIES, categoryMeta } from '@/lib/deadlineCategories'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

function dueDateToInputValue(iso) {
  if (!iso) return ''
  const s = typeof iso === 'string' ? iso : new Date(iso).toISOString()
  return s.slice(0, 10)
}

export default function DeadlineDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [form, setForm] = useState({
    title: '',
    dueDate: '',
    category: 'BOLLETTE',
    amount: '',
    description: '',
    isPaid: false,
  })

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    setSaveError('')
    try {
      const d = await getDeadlineById(id)
      setForm({
        title: d.title || '',
        dueDate: dueDateToInputValue(d.dueDate),
        category: d.category || 'ALTRO',
        amount: d.amount != null && d.amount !== '' ? String(d.amount) : '',
        description: d.description || '',
        isPaid: Boolean(d.isPaid),
      })
    } catch (e) {
      if (e.response?.status === 404) {
        setNotFound(true)
      } else {
        console.error(e)
        setSaveError('Impossibile caricare la scadenza.')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!localStorage.getItem(LS_TOKEN_KEY)) {
      router.push('/login')
      return
    }
    load()
  }, [router, load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveError('')
    const title = form.title.trim()
    if (!title || !form.dueDate) {
      setSaveError('Titolo e data sono obbligatori.')
      return
    }
    setSaving(true)
    try {
      await updateDeadline(id, {
        title,
        dueDate: form.dueDate,
        category: form.category,
        amount: form.amount === '' ? null : Number(form.amount),
        description: form.description.trim() || null,
        isPaid: form.isPaid,
      })
      sendFamilyUpdate('deadlines', 'update', { id })
      router.push('/deadlines')
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Salvataggio non riuscito.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Eliminare definitivamente questa scadenza?')) return
    setDeleting(true)
    try {
      await deleteDeadline(id)
      sendFamilyUpdate('deadlines', 'delete', { id })
      router.push('/deadlines')
    } catch (e) {
      console.error(e)
      setSaveError(e.response?.data?.error || 'Eliminazione non riuscita.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <div className="app-main-shell flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main className="app-main-shell">
          <p className="text-destructive">Scadenza non trovata.</p>
          <Link href="/deadlines" className="mt-4 inline-block text-primary hover:underline">
            Torna al calendario
          </Link>
        </main>
      </div>
    )
  }

  const cat = categoryMeta(form.category)
  const overdue = !form.isPaid && form.dueDate && new Date(form.dueDate) < new Date(new Date().toDateString())

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="app-main-shell max-w-2xl">
        <Link
          href="/deadlines"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Scadenze
        </Link>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dettaglio scadenza</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifica i campi e salva, oppure elimina la voce.
        </p>

        {overdue && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Questa scadenza risulta in ritardo (non segnata come pagata).
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div>
            <label htmlFor="dl-title" className="mb-1 block text-sm font-medium text-foreground">
              Titolo *
            </label>
            <input
              id="dl-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground"
              required
            />
          </div>
          <div>
            <label htmlFor="dl-due" className="mb-1 block text-sm font-medium text-foreground">
              Data scadenza *
            </label>
            <input
              id="dl-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground"
              required
            />
            {form.dueDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                {format(parseISO(`${form.dueDate}T12:00:00`), 'EEEE d MMMM yyyy', { locale: it })}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="dl-cat" className="mb-1 block text-sm font-medium text-foreground">
              Categoria
            </label>
            <select
              id="dl-cat"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground"
            >
              {DEADLINE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dl-amount" className="mb-1 block text-sm font-medium text-foreground">
              Importo (€)
            </label>
            <input
              id="dl-amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground"
              placeholder="Opzionale"
            />
          </div>
          <div>
            <label htmlFor="dl-desc" className="mb-1 block text-sm font-medium text-foreground">
              Note
            </label>
            <textarea
              id="dl-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <input
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) => setForm((f) => ({ ...f, isPaid: e.target.checked }))}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm font-medium text-foreground">Segna come pagata</span>
          </label>

          {saveError && <p className="text-sm text-destructive">{saveError}</p>}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio…
                </>
              ) : (
                'Salva modifiche'
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-destructive/50 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Elimina scadenza
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Categoria attuale:{' '}
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold text-white ${cat.color}`}>
            {cat.label}
          </span>
        </p>
      </main>
    </div>
  )
}
