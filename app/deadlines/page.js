'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { getDeadlines, createDeadline, deleteDeadline } from '@/lib/api'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { it } from 'date-fns/locale'
import Navbar from '../components/Navbar'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'
import { DEADLINE_CATEGORIES } from '@/lib/deadlineCategories'
import LogoLoader from '../components/LogoLoader'

export default function DeadlinesPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const [deadlines, setDeadlines] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    category: 'BOLLETTE',
    amount: '',
    description: ''
  })

  const loadDeadlines = useCallback(async () => {
    try {
      const data = await getDeadlines()
      setDeadlines(data)
    } catch (error) {
      console.error('Errore caricamento scadenze:', error)
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
    loadDeadlines()
  }, [router, loadDeadlines])

  useDataUpdateRefresh('deadlines', loadDeadlines)

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await createDeadline(formData)
      sendFamilyUpdate('deadlines', 'create', {})
      setFormData({ title: '', dueDate: '', category: 'BOLLETTE', amount: '', description: '' })
      setShowForm(false)
      loadDeadlines()
    } catch (error) {
      console.error('Errore aggiunta scadenza:', error)
      alert('Errore durante l\'aggiunta della scadenza')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Eliminare questa scadenza?')) {
      try {
        await deleteDeadline(id)
        sendFamilyUpdate('deadlines', 'delete', { id })
        loadDeadlines()
      } catch (error) {
        console.error('Errore eliminazione:', error)
      }
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getDeadlinesForDay = (day) => {
    return deadlines.filter(d => isSameDay(parseISO(d.dueDate), day))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <LogoLoader />
        </div>
      </div>
    )
  }

  const upcomingDeadlines = deadlines
    .filter(d => new Date(d.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="app-main-shell">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Calendario Scadenze 📅</h1>
            <p className="text-muted-foreground">Totale scadenze: {deadlines.length}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:opacity-95"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span className="font-semibold">{showForm ? 'Annulla' : 'Nuova Scadenza'}</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-card rounded-2xl shadow-lg p-6 mb-8 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">Nuova Scadenza</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Titolo *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="Es. Bolletta luce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data scadenza *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                >
                  {DEADLINE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Importo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="Opzionale"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Note</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="Aggiungi dettagli..."
                  rows="3"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
            >
              Aggiungi scadenza
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-muted-foreground" />
                </button>
                <h2 className="text-2xl font-bold text-foreground capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: it })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                  <div key={day} className="text-center font-semibold text-muted-foreground text-sm py-2">
                    {day}
                  </div>
                ))}

                {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20 rounded-lg bg-muted/50" />
                ))}

                {daysInMonth.map(day => {
                  const dayDeadlines = getDeadlinesForDay(day)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <div
                      key={day.toString()}
                      className={`h-20 border-2 rounded-lg p-2 transition-all ${
                        isToday ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className={`mb-1 text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayDeadlines.slice(0, 2).map((deadline) => {
                          const cat = DEADLINE_CATEGORIES.find((c) => c.value === deadline.category)
                          return (
                            <Link
                              key={deadline.id}
                              href={`/deadlines/${deadline.id}`}
                              className={`block truncate rounded px-2 py-0.5 text-xs text-white ${cat?.color} hover:opacity-90`}
                              title={`${deadline.title}${deadline.amount ? ` - €${deadline.amount}` : ''}`}
                            >
                              {deadline.title}
                            </Link>
                          )
                        })}
                        {dayDeadlines.length > 2 && (
                          <div className="text-xs font-medium text-muted-foreground">
                            +{dayDeadlines.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Upcoming List */}
          <div>
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <div className="flex items-center space-x-2 mb-4">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Prossime Scadenze</h3>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">Nessuna scadenza imminente</p>
                ) : (
                  upcomingDeadlines.map((deadline) => {
                    const cat = DEADLINE_CATEGORIES.find((c) => c.value === deadline.category)
                    return (
                      <div
                        key={deadline.id}
                        className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${cat?.bgLight} ${cat?.color.replace('bg-', 'border-')}`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <Link href={`/deadlines/${deadline.id}`} className="min-w-0 flex-1">
                            <h4 className="mb-1 font-bold text-foreground hover:underline">{deadline.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(deadline.dueDate), 'dd MMMM yyyy', { locale: it })}
                            </p>
                            <span className="mt-1 inline-block text-xs text-primary">Apri dettaglio →</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(deadline.id)}
                            className="shrink-0 rounded p-1 text-red-600 transition-all hover:bg-red-100 hover:text-red-800"
                            aria-label="Elimina scadenza"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${cat?.color}`}>
                            {cat?.label}
                          </span>
                          {deadline.amount != null && deadline.amount !== '' && (
                            <span className="text-sm font-bold text-foreground">€{deadline.amount}</span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
