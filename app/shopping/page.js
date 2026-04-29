'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, ShoppingCart } from 'lucide-react'
import {
  getShoppingList,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} from '@/lib/api'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import Navbar from '../components/Navbar'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'
import LogoLoader from '../components/LogoLoader'

const CATEGORIES = [
  'FRUTTA',
  'VERDURA',
  'CARNE',
  'PESCE',
  'LATTICINI',
  'PANE',
  'PASTA',
  'BEVANDE',
  'SNACK',
  'ALTRO',
]

export default function ShoppingPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    category: 'ALTRO',
  })

  const loadList = useCallback(async () => {
    try {
      const data = await getShoppingList()
      setItems(data)
    } catch (error) {
      console.error('Errore lista spesa:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN_KEY)
    if (!token) {
      router.push('/login')
      return
    }
    loadList()
  }, [router, loadList])

  useDataUpdateRefresh('shopping', loadList)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    try {
      await createShoppingItem({
        name: formData.name.trim(),
        quantity: formData.quantity,
        category: formData.category,
      })
      sendFamilyUpdate('shopping', 'create', {})
      setFormData({ name: '', quantity: 1, category: 'ALTRO' })
      setShowForm(false)
      loadList()
    } catch (error) {
      console.error('Errore aggiunta:', error)
    }
  }

  const toggleChecked = async (item) => {
    try {
      await updateShoppingItem(item.id, { checked: !item.checked })
      sendFamilyUpdate('shopping', 'update', { id: item.id })
      loadList()
    } catch (error) {
      console.error('Errore aggiornamento:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Rimuovere questo articolo?')) return
    try {
      await deleteShoppingItem(id)
      sendFamilyUpdate('shopping', 'delete', { id })
      loadList()
    } catch (error) {
      console.error('Errore eliminazione:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center">
          <LogoLoader />
        </div>
      </div>
    )
  }

  const open = items.filter((i) => !i.checked)
  const done = items.filter((i) => i.checked)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="app-main-shell">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-foreground sm:mb-2 sm:text-3xl">
              <ShoppingCart className="h-8 w-8 shrink-0 text-primary sm:h-9 sm:w-9" />
              Lista spesa
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Condivisa con la tua famiglia · {open.length} da comprare · {done.length} spuntati
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-md transition-all active:scale-[0.99] hover:opacity-95 sm:w-auto sm:min-h-10"
          >
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            <span>{showForm ? 'Annulla' : 'Aggiungi'}</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="mb-4 text-xl font-bold text-foreground">Nuovo articolo</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Es. Latte"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Quantità</label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="md:col-span-3">
                <label className="mb-2 block text-sm font-medium text-foreground">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 rounded-xl bg-primary px-6 py-2 font-semibold text-primary-foreground hover:opacity-95"
            >
              Salva
            </button>
          </form>
        )}

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Da comprare</h2>
            {open.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                Nessun articolo. Aggiungine uno!
              </p>
            ) : (
              <ul className="space-y-3">
                {open.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecked(item)}
                      className="h-5 w-5 rounded border-input text-primary focus:ring-ring"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} · {item.category}
                        {item.addedBy?.name ? ` · ${item.addedBy.name}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                      aria-label="Elimina"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {done.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-muted-foreground">Spuntati</h2>
              <ul className="space-y-2 opacity-80">
                {done.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecked(item)}
                      className="h-5 w-5 rounded border-input text-primary focus:ring-ring"
                    />
                    <span className="flex-1 line-through text-muted-foreground">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
