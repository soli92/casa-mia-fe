'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cpu, Plus, Trash2, X } from 'lucide-react'
import { getIoTDevices, createIoTDevice, updateIoTDevice, deleteIoTDevice } from '@/lib/api'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import Navbar from '../components/Navbar'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'

const DEVICE_TYPES = [
  { value: 'LIGHT', label: 'Luce' },
  { value: 'THERMOSTAT', label: 'Termostato' },
  { value: 'PLUG', label: 'Presa smart' },
  { value: 'SENSOR', label: 'Sensore' },
  { value: 'CAMERA', label: 'Camera' },
  { value: 'OTHER', label: 'Altro' },
]

function statusLabel(status) {
  if (status === 'online') return 'Online'
  if (status === 'error') return 'Errore'
  return 'Offline'
}

export default function IoTPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'OTHER' })

  const loadDevices = useCallback(async () => {
    try {
      const data = await getIoTDevices()
      setDevices(data)
    } catch (error) {
      console.error('Errore dispositivi IoT:', error)
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
    loadDevices()
  }, [router, loadDevices])

  useDataUpdateRefresh('iot', loadDevices)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    try {
      await createIoTDevice({ name: formData.name.trim(), type: formData.type })
      sendFamilyUpdate('iot', 'create', {})
      setFormData({ name: '', type: 'OTHER' })
      setShowForm(false)
      loadDevices()
    } catch (error) {
      console.error('Errore creazione dispositivo:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Rimuovere questo dispositivo?')) return
    try {
      await deleteIoTDevice(id)
      sendFamilyUpdate('iot', 'delete', { id })
      loadDevices()
    } catch (error) {
      console.error('Errore eliminazione:', error)
    }
  }

  const cycleStatus = async (device) => {
    const next =
      device.status === 'online' ? 'offline' : device.status === 'offline' ? 'error' : 'online'
    try {
      await updateIoTDevice(device.id, { status: next })
      sendFamilyUpdate('iot', 'update', { id: device.id })
      loadDevices()
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 flex items-center gap-2 text-4xl font-bold text-foreground">
              <Cpu className="h-9 w-9 text-primary" />
              Hub IoT
            </h1>
            <p className="text-muted-foreground">
              Dispositivi della famiglia · eventi anche via WebSocket
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-95"
          >
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            <span>{showForm ? 'Annulla' : 'Aggiungi dispositivo'}</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="mb-4 text-xl font-bold text-foreground">Nuovo dispositivo</h3>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-foreground">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Luci soggiorno"
                />
              </div>
              <div className="sm:w-56">
                <label className="mb-2 block text-sm font-medium text-foreground">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {DEVICE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-95"
              >
                Salva
              </button>
            </div>
          </form>
        )}

        {devices.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            Nessun dispositivo. Aggiungine uno per iniziare.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((d) => (
              <li
                key={d.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-md transition-colors hover:border-primary/20"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">{d.name}</h3>
                    <p className="text-sm text-muted-foreground">{d.type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    aria-label="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      d.status === 'online'
                        ? 'bg-primary/15 text-primary'
                        : d.status === 'error'
                          ? 'bg-destructive/15 text-destructive'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {statusLabel(d.status)}
                  </span>
                  <button
                    type="button"
                    onClick={() => cycleStatus(d)}
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Cambia stato (test)
                  </button>
                </div>
                {d.lastPing && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Ultimo ping: {new Date(d.lastPing).toLocaleString('it-IT')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
