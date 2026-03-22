'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { getDeadlines, createDeadline, deleteDeadline } from '@/lib/api'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { it } from 'date-fns/locale'
import Navbar from '../components/Navbar'

const CATEGORIES = [
  { value: 'BOLLETTE', label: 'Bolletta', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  { value: 'TASSE', label: 'Tassa', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  { value: 'ASSICURAZIONI', label: 'Assicurazione', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  { value: 'ABBONAMENTI', label: 'Abbonamento', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
  { value: 'AFFITTO', label: 'Affitto', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  { value: 'ALTRO', label: 'Altro', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' },
]

export default function DeadlinesPage() {
  const router = useRouter()
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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadDeadlines()
  }, [router])

  const loadDeadlines = async () => {
    try {
      const data = await getDeadlines()
      setDeadlines(data)
    } catch (error) {
      console.error('Errore caricamento scadenze:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await createDeadline(formData)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-xl text-gray-600">Caricamento...</div>
        </div>
      </div>
    )
  }

  const upcomingDeadlines = deadlines
    .filter(d => new Date(d.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Calendario Scadenze 📅</h1>
            <p className="text-gray-600">Totale scadenze: {deadlines.length}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span className="font-semibold">{showForm ? 'Annulla' : 'Nuova Scadenza'}</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nuova Scadenza</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titolo *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Es. Bolletta luce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data scadenza *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Importo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Opzionale"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: it })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                    {day}
                  </div>
                ))}

                {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20 bg-gray-50 rounded-lg" />
                ))}

                {daysInMonth.map(day => {
                  const dayDeadlines = getDeadlinesForDay(day)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <div
                      key={day.toString()}
                      className={`h-20 border-2 rounded-lg p-2 transition-all ${
                        isToday ? 'bg-indigo-50 border-indigo-400 shadow-md' : 'bg-white border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayDeadlines.slice(0, 2).map(deadline => {
                          const cat = CATEGORIES.find(c => c.value === deadline.category)
                          return (
                            <div
                              key={deadline.id}
                              className={`text-xs px-2 py-0.5 rounded ${cat?.color} text-white truncate cursor-pointer hover:opacity-80`}
                              title={`${deadline.title}${deadline.amount ? ` - €${deadline.amount}` : ''}`}
                            >
                              {deadline.title}
                            </div>
                          )
                        })}
                        {dayDeadlines.length > 2 && (
                          <div className="text-xs text-gray-500 font-medium">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <CalendarIcon className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Prossime Scadenze</h3>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nessuna scadenza imminente</p>
                ) : (
                  upcomingDeadlines.map(deadline => {
                    const cat = CATEGORIES.find(c => c.value === deadline.category)
                    return (
                      <div key={deadline.id} className={`${cat?.bgLight} rounded-xl p-4 border-2 ${cat?.color.replace('bg-', 'border-')} hover:shadow-md transition-all`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{deadline.title}</h4>
                            <p className="text-sm text-gray-600">
                              {format(parseISO(deadline.dueDate), 'dd MMMM yyyy', { locale: it })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(deadline.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${cat?.color} text-white`}>
                            {cat?.label}
                          </span>
                          {deadline.amount && (
                            <span className="text-sm font-bold text-gray-900">€{deadline.amount}</span>
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
