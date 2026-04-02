'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertTriangle, X, Package } from 'lucide-react'
import { getPantry, createPantryItem, deletePantryItem } from '@/lib/api'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import { format, differenceInDays, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import Navbar from '../components/Navbar'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'

const CATEGORIES = ['FRUTTA', 'VERDURA', 'CARNE', 'PESCE', 'LATTICINI', 'PANE', 'PASTA', 'BEVANDE', 'SNACK', 'ALTRO']

export default function PantryPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pz',
    category: 'ALTRO',
    expirationDate: ''
  })

  const loadItems = useCallback(async () => {
    try {
      const data = await getPantry()
      setItems(data)
    } catch (error) {
      console.error('Errore caricamento dispensa:', error)
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
    loadItems()
  }, [router, loadItems])

  useDataUpdateRefresh('pantry', loadItems)

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await createPantryItem(formData)
      sendFamilyUpdate('pantry', 'create', {})
      setFormData({ name: '', quantity: 1, unit: 'pz', category: 'ALTRO', expirationDate: '' })
      setShowForm(false)
      loadItems()
    } catch (error) {
      console.error('Errore aggiunta prodotto:', error)
      alert('Errore durante l\'aggiunta del prodotto')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Eliminare questo prodotto dalla dispensa?')) {
      try {
        await deletePantryItem(id)
        sendFamilyUpdate('pantry', 'delete', { id })
        loadItems()
      } catch (error) {
        console.error('Errore eliminazione:', error)
      }
    }
  }

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 999
    return differenceInDays(parseISO(expiryDate), new Date())
  }

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { color: 'bg-muted border-border', text: 'text-muted-foreground', label: 'Nessuna scadenza' }
    const days = getDaysUntilExpiry(expiryDate)
    if (days < 0) return { color: 'bg-red-100 border-red-300', text: 'text-red-700', label: 'SCADUTO', badge: 'bg-red-500' }
    if (days === 0) return { color: 'bg-red-50 border-red-200', text: 'text-red-600', label: 'Scade oggi', badge: 'bg-red-500' }
    if (days <= 3) return { color: 'bg-orange-50 border-orange-200', text: 'text-orange-600', label: `${days} giorni`, badge: 'bg-orange-500' }
    if (days <= 7) return { color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', label: `${days} giorni`, badge: 'bg-yellow-500' }
    return { color: 'bg-card border-border', text: 'text-muted-foreground', label: `${days} giorni`, badge: 'bg-green-500' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-xl text-muted-foreground">Caricamento...</div>
        </div>
      </div>
    )
  }

  const expiringSoon = items.filter(i => getDaysUntilExpiry(i.expirationDate) <= 7 && getDaysUntilExpiry(i.expirationDate) >= 0)
  const expired = items.filter(i => getDaysUntilExpiry(i.expirationDate) < 0)
  const otherItems = items.filter(i => getDaysUntilExpiry(i.expirationDate) > 7)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dispensa Smart 📦</h1>
            <p className="text-muted-foreground">Totale prodotti: {items.length}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:opacity-95"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span className="font-semibold">{showForm ? 'Annulla' : 'Aggiungi Prodotto'}</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-card rounded-2xl shadow-lg p-6 mb-8 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">Nuovo Prodotto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Prodotto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Es. Latte fresco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantità *</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    className="flex-1 px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="px-3 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  >
                    <option value="pz">pz</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data scadenza</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
            >
              Aggiungi alla dispensa
            </button>
          </form>
        )}

        {expired.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 rounded-xl p-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Prodotti Scaduti ({expired.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expired.map(item => {
                const status = getExpiryStatus(item.expirationDate)
                return (
                  <div key={item.id} className={`${status.color} border-2 rounded-xl p-5 shadow-md`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} • {item.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${status.text} ${status.color}`}>
                      {status.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {expiringSoon.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-100 rounded-xl p-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">In Scadenza Presto ({expiringSoon.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expiringSoon.map(item => {
                const status = getExpiryStatus(item.expirationDate)
                return (
                  <div key={item.id} className={`${status.color} border-2 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} • {item.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${status.text} bg-card`}>
                      Scade tra {status.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 rounded-xl p-2">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Altri Prodotti ({otherItems.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherItems.length === 0 ? (
              <p className="col-span-3 py-12 text-center text-lg text-muted-foreground">Nessun prodotto</p>
            ) : (
              otherItems.map(item => {
                const status = getExpiryStatus(item.expirationDate)
                return (
                  <div key={item.id} className="bg-card border-2 border-border rounded-xl p-5 shadow-md hover:shadow-lg transition-all hover:border-primary/30">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} • {item.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className={`text-sm ${status.text}`}>
                      {item.expirationDate ? `Scade tra ${status.label}` : 'Nessuna scadenza'}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
