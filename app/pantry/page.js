'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertTriangle, X, Package, ScanBarcode, Camera, History } from 'lucide-react'
import { getPantry, createPantryItem, deletePantryItem } from '@/lib/api'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import { format, differenceInDays, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import Navbar from '../components/Navbar'
import PantryBarcodeModal from '../components/PantryBarcodeModal'
import PantryOcrModal from '../components/PantryOcrModal'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'
import { fetchProductByBarcode } from '@/lib/openFoodFacts'
import LogoLoader from '../components/LogoLoader'
import {
  loadPantryScanHistory,
  pushPantryScanHistory,
  clearPantryScanHistory,
} from '@/lib/pantryScanHistory'

const CATEGORIES = ['FRUTTA', 'VERDURA', 'CARNE', 'PESCE', 'LATTICINI', 'PANE', 'PASTA', 'BEVANDE', 'SNACK', 'ALTRO']

export default function PantryPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [ocrOpen, setOcrOpen] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
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
    setScanHistory(loadPantryScanHistory())
  }, [router, loadItems])

  useDataUpdateRefresh('pantry', loadItems)

  const closeScanner = useCallback(() => setScanOpen(false), [])
  const closeOcr = useCallback(() => setOcrOpen(false), [])

  const handleBarcodeScanned = useCallback(async (code) => {
    const info = await fetchProductByBarcode(code)
    setFormData((f) => ({
      ...f,
      name: info.name || f.name,
      category: info.category || f.category,
    }))
    setScanHistory(
      pushPantryScanHistory({
        source: 'barcode',
        name: info.name || `Barcode ${code}`,
        category: info.category || 'ALTRO',
        barcode: code,
      })
    )
    setShowForm(true)
  }, [])

  const handleOcrResult = useCallback((payload) => {
    setScanHistory(
      pushPantryScanHistory({
        source: 'ocr',
        name: payload.name,
        category: 'ALTRO',
        expirationDate: payload.expirationDate || undefined,
      })
    )
    setFormData((f) => ({
      ...f,
      name: payload.name || f.name,
      category: 'ALTRO',
      expirationDate: payload.expirationDate || f.expirationDate,
    }))
    setShowForm(true)
  }, [])

  const applyHistoryEntry = useCallback((row) => {
    setFormData((f) => ({
      ...f,
      name: row.name || f.name,
      category: row.category || f.category,
      expirationDate: row.expirationDate || f.expirationDate,
    }))
    setShowForm(true)
  }, [])

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
          <LogoLoader />
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

      {scanOpen && (
        <PantryBarcodeModal onClose={closeScanner} onScan={handleBarcodeScanned} />
      )}
      {ocrOpen && <PantryOcrModal onClose={closeOcr} onResult={handleOcrResult} />}

      <div className="app-main-shell">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dispensa Smart 📦</h1>
            <p className="text-muted-foreground">Totale prodotti: {items.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Barcode (Open Food Facts) oppure foto etichetta (OCR sul telefono). Le ultime scansioni
              restano salvate solo su questo dispositivo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary bg-background px-4 py-3 font-semibold text-primary shadow-md transition-all hover:bg-primary/10"
            >
              <ScanBarcode className="h-5 w-5 shrink-0" />
              <span>Barcode</span>
            </button>
            <button
              type="button"
              onClick={() => setOcrOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-3 font-semibold text-foreground shadow-md transition-all hover:bg-muted"
            >
              <Camera className="h-5 w-5 shrink-0" />
              <span>Etichetta</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-95"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{showForm ? 'Annulla' : 'Aggiungi'}</span>
            </button>
          </div>
        </div>

        {scanHistory.length > 0 && (
          <section
            className="mb-8 rounded-2xl border border-border bg-card/80 p-4 shadow-sm"
            aria-label="Ultime scansioni"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <History className="h-4 w-4 text-muted-foreground" aria-hidden />
                Ultime scansioni
              </div>
              <button
                type="button"
                onClick={() => {
                  clearPantryScanHistory()
                  setScanHistory([])
                }}
                className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
              >
                Svuota storico
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {scanHistory.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => applyHistoryEntry(row)}
                  className="flex min-w-[9rem] max-w-[11rem] shrink-0 flex-col rounded-xl border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  <span className="truncate font-medium text-foreground">{row.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {row.source === 'barcode' ? 'Barcode' : 'OCR'}
                    {row.expirationDate ? ` · ${row.expirationDate}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

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
