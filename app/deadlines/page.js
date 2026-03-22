'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Calendar as CalendarIcon } from 'lucide-react'
import { getDeadlines, createDeadline, deleteDeadline } from '@/lib/api'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'
import { it } from 'date-fns/locale'

const CATEGORIES = [
  { value: 'BOLLETTA', label: 'Bolletta', color: 'bg-blue-500' },
  { value: 'TASSA', label: 'Tassa', color: 'bg-red-500' },
  { value: 'ASSICURAZIONE', label: 'Assicurazione', color: 'bg-green-500' },
  { value: 'ABBONAMENTO', label: 'Abbonamento', color: 'bg-purple-500' },
  { value: 'AFFITTO', label: 'Affitto', color: 'bg-yellow-500' },
  { value: 'ALTRO', label: 'Altro', color: 'bg-gray-500' },
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
    category: 'BOLLETTA',
    amount: '',
    notes: '',
    notifyDaysBefore: 7
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
      setFormData({ title: '', dueDate: '', category: 'BOLLETTA', amount: '', notes: '', notifyDaysBefore: 7 })
      setShowForm(false)
      loadDeadlines()
    } catch (error) {
      console.error('Errore aggiunta scadenza:', error)
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
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl text-gray-600">Caricamento...</div>
    </div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendario Scadenze</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showForm ? 'Annulla' : 'Aggiungi'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titolo</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Es. Bolletta luce"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data scadenza</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Opzionale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Opzionale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notifica (giorni prima)</label>
              <input
                type="number"
                min="0"
                value={formData.notifyDaysBefore}
                onChange={(e) => setFormData({ ...formData, notifyDaysBefore: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Aggiungi scadenza
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ← Precedente
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: it })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Successivo →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg" />
          ))}

          {daysInMonth.map(day => {
            const dayDeadlines = getDeadlinesForDay(day)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toString()}
                className={`h-24 border rounded-lg p-2 ${
                  isToday ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayDeadlines.map(deadline => {
                    const cat = CATEGORIES.find(c => c.value === deadline.category)
                    return (
                      <div
                        key={deadline.id}
                        className={`text-xs px-2 py-1 rounded ${cat?.color} text-white truncate cursor-pointer hover:opacity-80`}
                        title={`${deadline.title}${deadline.amount ? ` - €${deadline.amount}` : ''}`}
                      >
                        {deadline.title}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Prossime scadenze</h3>
        <div className="space-y-3">
          {deadlines
            .filter(d => new Date(d.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5)
            .map(deadline => {
              const cat = CATEGORIES.find(c => c.value === deadline.category)
              return (
                <div key={deadline.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${cat?.color}`} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{deadline.title}</h4>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(deadline.dueDate), 'dd MMMM yyyy', { locale: it })}
                        {deadline.amount && ` • €${deadline.amount}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(deadline.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
