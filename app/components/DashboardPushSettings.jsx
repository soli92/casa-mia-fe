'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import {
  getPushVapidPublicKey,
  subscribePush,
  unsubscribePush,
} from '@/lib/api'
import { pushSupported, urlBase64ToUint8Array } from '@/lib/pushClient'

export default function DashboardPushSettings() {
  const [ready, setReady] = useState(false)
  const [supported, setSupported] = useState(false)
  const [serverConfigured, setServerConfigured] = useState(true)
  const [permission, setPermission] = useState('default')
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const refreshLocalSubscription = useCallback(async () => {
    if (!pushSupported()) return
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = reg ? await reg.pushManager.getSubscription() : null
      setSubscribed(!!sub)
    } catch {
      setSubscribed(false)
    }
  }, [])

  useEffect(() => {
    setReady(true)
    if (!pushSupported()) {
      setSupported(false)
      return
    }
    setSupported(true)
    setPermission(Notification.permission)
    refreshLocalSubscription()
  }, [refreshLocalSubscription])

  const handleEnable = async () => {
    setMessage('')
    setBusy(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setMessage('Permesso notifiche negato. Puoi abilitarlo dalle impostazioni del browser.')
        return
      }

      let { publicKey } = {}
      try {
        ;({ publicKey } = await getPushVapidPublicKey())
      } catch (e) {
        setServerConfigured(false)
        setMessage(
          e.response?.status === 503
            ? 'Il server non ha ancora configurato le notifiche push (chiavi VAPID).'
            : 'Impossibile contattare il server per le notifiche.'
        )
        return
      }
      setServerConfigured(true)

      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      await subscribePush(sub.toJSON())
      setSubscribed(true)
      setMessage('Notifiche attive: riceverai un riepilogo giornaliero delle scadenze (se ce ne sono).')
    } catch (e) {
      console.error(e)
      setMessage(e.response?.data?.error || e.message || 'Attivazione non riuscita')
    } finally {
      setBusy(false)
    }
  }

  const handleDisable = async () => {
    setMessage('')
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = reg ? await reg.pushManager.getSubscription() : null
      if (sub) {
        const ep = sub.endpoint
        await sub.unsubscribe()
        try {
          await unsubscribePush(ep)
        } catch {
          /* endpoint già rimosso lato server */
        }
      }
      setSubscribed(false)
      setMessage('Notifiche disattivate su questo dispositivo.')
    } catch (e) {
      console.error(e)
      setMessage(e.response?.data?.error || 'Disattivazione non riuscita')
    } finally {
      setBusy(false)
    }
  }

  if (!ready || !supported) {
    return (
      <p className="text-sm text-muted-foreground">
        Le notifiche push non sono disponibili su questo browser (usa un browser recente, HTTPS o
        localhost).
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Un riepilogo al giorno alle 9:00 (fuso del server) con scadenze scadute o nei prossimi 7
        giorni. Serve HTTPS in produzione.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {!subscribed ? (
          <button
            type="button"
            onClick={handleEnable}
            disabled={busy || permission === 'denied'}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Attiva notifiche scadenze
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDisable}
            disabled={busy}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
            Disattiva su questo dispositivo
          </button>
        )}
      </div>
      {permission === 'denied' && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Il browser blocca le notifiche: sblocca Casa Mia dalle impostazioni sito.
        </p>
      )}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
