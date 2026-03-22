'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertTriangle, X } from 'lucide-react'
import { getPantry, createPantryItem, updatePantryItem, deletePantryItem } from '@/lib/api'
import { format, differenceInDays, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

const CATEGORIES = ['FRUTTA', 'VERDURA', 'CARNE', 'PESCE', 'LATTICINI', 'PANE', 'BEVANDE', 'ALTRO']

export default function PantryPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    category: 'ALTRO',
    expiryDate: '',
    location: 'FRIGO'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadItems()
  }, [router])

  const loadItems = async () => {
    try {
      const data = await getPantry()
      setItems(data)
    } catch (error) {
      console.error('Errore caricamento dispensa:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await createPantryItem(formData)
      setFormData({ name: '', quantity: 1, category: 'ALTRO', expiryDate: '', location: 'FRIGO' })
      setShowForm(false)
      loadItems()
    } catch (error) {
      console.error('Errore aggiunta prodotto:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Eliminare questo prodotto dalla dispensa?')) {
      try {
        await deletePantryItem(id)
        loadItems()
      } catch (error) {
        console.error('Errore eliminazione:', error)
      }
    }
  }

  const getDaysUntilExpiry = (expiryDate) => {
    return differenceInDays(parseISO(expiryDate), new Date())
  }

  const getExpiryStatus = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate)
    if (days < 0) return { color: 'bg-red-100 border-red-300', text: 'text-red-700', label: 'SCADUTO' }
    if (days <= 3) return { color: 'bg-red-50 border-red-200', text: 'text-red-600', label: `${days} giorni` }
    if (days <= 7) return { color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', label: `${days} giorni` }
    return { color: 'bg-white border-gray-200', text: 'text-gray-600', label: `${days} giorni` }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl text-gray-600">Caricamento...</div>
    </div>
  }

  const expiringSoon = items.filter(i => getDaysUntilExpiry(i.expiryDate) <= 7)
  const otherItems = items.filter(i => getDaysUntilExpiry(i.expiryDate) > 7)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dispensa</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prodotto</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Es. Latte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantità</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
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
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data scadenza</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Posizione</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FRIGO">Frigo</option>
                <option value="FREEZER">Freezer</option>
                <option value="DISPENSA">Dispensa</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Aggiungi alla dispensa
          </button>
        </form>
      )}

      {expiringSoon.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-800">In scadenza ({expiringSoon.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringSoon.map(item => {
              const status = getExpiryStatus(item.expiryDate)
              return (
                <div key={item.id} className={`${status.color} border rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">Quantità: {item.quantity}</p>
                  <p className="text-sm text-gray-600">{item.category} • {item.location}</p>
                  <p className={`text-sm font-semibold ${status.text} mt-2`}>
                    Scade tra {status.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Altri prodotti ({otherItems.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherItems.length === 0 ? (
            <p className="text-gray-500 col-span-3 text-center py-8">Nessun prodotto</p>
          ) : (
            otherItems.map(item => {
              const status = getExpiryStatus(item.expiryDate)
              return (
                <div key={item.id} className={`${status.color} border rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">Quantità: {item.quantity}</p>
                  <p className="text-sm text-gray-600">{item.category} • {item.location}</p>
                  <p className={`text-sm ${status.text} mt-2`}>
                    Scade tra {status.label}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
