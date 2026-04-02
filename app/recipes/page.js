'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, Plus, Trash2, X } from 'lucide-react'
import {
  getRecipeSuggestions,
  getRecipes,
  createRecipe,
  deleteRecipe,
} from '@/lib/api'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import Navbar from '../components/Navbar'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'

export default function RecipesPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const [suggestions, setSuggestions] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    ingredientsText: '',
    instructions: '',
    prepTime: '',
  })

  const reload = useCallback(async () => {
    try {
      const [sug, all] = await Promise.all([getRecipeSuggestions(), getRecipes()])
      setSuggestions(sug)
      setRecipes(all)
    } catch (error) {
      console.error('Errore ricette:', error)
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
    reload()
  }, [router, reload])

  useDataUpdateRefresh('recipes', reload)

  const handleCreate = async (e) => {
    e.preventDefault()
    const ingredients = formData.ingredientsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!formData.name.trim() || ingredients.length === 0 || !formData.instructions.trim()) return
    try {
      await createRecipe({
        name: formData.name.trim(),
        ingredients,
        instructions: formData.instructions.trim(),
        prepTime: formData.prepTime ? parseInt(formData.prepTime, 10) : undefined,
      })
      sendFamilyUpdate('recipes', 'create', {})
      setFormData({ name: '', ingredientsText: '', instructions: '', prepTime: '' })
      setShowForm(false)
      reload()
    } catch (error) {
      console.error('Errore creazione ricetta:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questa ricetta?')) return
    try {
      await deleteRecipe(id)
      sendFamilyUpdate('recipes', 'delete', { id })
      reload()
    } catch (error) {
      console.error('Errore eliminazione:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center">
          <p className="text-xl text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="app-main-shell">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 flex items-center gap-2 text-4xl font-bold text-foreground">
              <ChefHat className="h-9 w-9 text-primary" />
              Ricette
            </h1>
            <p className="text-muted-foreground">
              Suggerimenti dalla dispensa e ricette della famiglia
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-95"
          >
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            <span>{showForm ? 'Chiudi' : 'Nuova ricetta'}</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="mb-4 text-xl font-bold text-foreground">Crea ricetta</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Ingredienti * (uno per riga)
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.ingredientsText}
                  onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={'Pomodori\nBasilico\nPasta'}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Istruzioni *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Tempo prep. (min)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  className="w-40 rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 rounded-xl bg-primary px-6 py-2 font-semibold text-primary-foreground hover:opacity-95"
            >
              Salva ricetta
            </button>
          </form>
        )}

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Suggeriti per te</h2>
          {suggestions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground">
              Nessun suggerimento: aggiungi prodotti in dispensa o crea ricette.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.slice(0, 9).map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-md transition-shadow hover:border-primary/25 hover:shadow-lg"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-card-foreground">{r.name}</h3>
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {r.matchPercentage ?? 0}% match
                    </span>
                  </div>
                  {r.prepTime != null && (
                    <p className="mb-2 text-sm text-muted-foreground">~{r.prepTime} min</p>
                  )}
                  {r.missingIngredients?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Manca: {r.missingIngredients.slice(0, 3).join(', ')}
                      {r.missingIngredients.length > 3 ? '…' : ''}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Tutte le ricette</h2>
          {recipes.length === 0 ? (
            <p className="text-muted-foreground">Nessuna ricetta salvata.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recipes.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-card-foreground">{r.name}</h3>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                      aria-label="Elimina"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {r.prepTime != null && (
                    <p className="mb-2 text-sm text-muted-foreground">{r.prepTime} min</p>
                  )}
                  <ul className="mb-3 list-inside list-disc text-sm text-muted-foreground">
                    {(r.ingredients || []).slice(0, 5).map((ing) => (
                      <li key={ing}>{ing}</li>
                    ))}
                    {(r.ingredients || []).length > 5 && <li>…</li>}
                  </ul>
                  <p className="line-clamp-3 text-sm text-foreground/90">{r.instructions}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
