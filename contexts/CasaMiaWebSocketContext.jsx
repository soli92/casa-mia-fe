'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import { resolveWebSocketUrl } from '@/lib/apiUrl'
import { LS_TOKEN_KEY, LS_USER_KEY } from '@/lib/authSession'

export const DATA_UPDATE_EVENT = 'casa-mia:data-update'

const PUBLIC_PATHS = new Set(['/', '/login', '/register'])

const RESOURCE_LABELS = {
  shopping: 'Lista spesa',
  pantry: 'Dispensa',
  deadlines: 'Scadenze',
  recipes: 'Ricette',
  iot: 'IoT',
  board: 'Lavagna',
  documents: 'Documenti',
}

const ACTION_LABELS = {
  create: 'nuovo dato',
  update: 'modifica',
  delete: 'eliminazione',
}

const CasaMiaWebSocketContext = createContext({
  connectionState: 'idle',
  sendFamilyUpdate: () => {},
})

/** z-[46]: sotto header (z-50) e drawer menu (z-48); sopra bottom nav (40). Angolo basso-destra, non copre l’header. */
function WsToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div
      className="pointer-events-none fixed bottom-20 right-3 z-[46] flex max-w-sm flex-col gap-2 p-2 md:bottom-6 md:right-6"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
            t.variant === 'error'
              ? 'border-destructive/40 bg-destructive/15 text-destructive'
              : 'border-border bg-card text-card-foreground'
          }`}
        >
          <p className="flex-1 leading-snug">{t.text}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="shrink-0 rounded-md px-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Chiudi"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

function readLocalUserId() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_USER_KEY)
    if (!raw) return null
    const u = JSON.parse(raw)
    return u?.id ?? null
  } catch {
    return null
  }
}

export function CasaMiaWebSocketProvider({ children }) {
  const pathname = usePathname()
  const [connectionState, setConnectionState] = useState('idle')
  const [toasts, setToasts] = useState([])
  const wsRef = useRef(null)
  const toastSeq = useRef(0)

  const pushToast = useCallback((text, variant = 'info') => {
    const id = ++toastSeq.current
    setToasts((prev) => [...prev, { id, text, variant }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 6000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const sendFamilyUpdate = useCallback((resource, action, data) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(
      JSON.stringify({
        type: 'update',
        resource,
        action,
        data: data ?? {},
      })
    )
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const token = localStorage.getItem(LS_TOKEN_KEY)
    const isPublic = PUBLIC_PATHS.has(pathname)

    if (!token || isPublic) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setConnectionState('idle')
      return undefined
    }

    setConnectionState('connecting')
    const url = resolveWebSocketUrl(process.env.NEXT_PUBLIC_API_URL)
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }))
    }

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        const myId = readLocalUserId()

        switch (msg.type) {
          case 'auth_success':
            setConnectionState('open')
            break
          case 'error':
            pushToast(msg.message || 'Errore dal server WebSocket', 'error')
            break
          case 'iot_update': {
            pushToast(
              `IoT: evento sul dispositivo${msg.deviceId ? ` · ${String(msg.deviceId).slice(0, 10)}` : ''}`,
              'info'
            )
            window.dispatchEvent(
              new CustomEvent(DATA_UPDATE_EVENT, {
                detail: { resource: 'iot', ...msg },
              })
            )
            break
          }
          case 'data_update': {
            window.dispatchEvent(
              new CustomEvent(DATA_UPDATE_EVENT, { detail: msg })
            )
            const isSelf = myId && msg.userId === myId
            if (!isSelf) {
              const label = RESOURCE_LABELS[msg.resource] || msg.resource || 'Dati'
              const act =
                ACTION_LABELS[msg.action] || msg.action || 'aggiornamento'
              pushToast(`${label}: ${act} (altro membro)`, 'info')
            }
            break
          }
          default:
            break
        }
      } catch {
        /* payload non JSON */
      }
    }

    ws.onerror = () => {
      setConnectionState('closed')
    }

    ws.onclose = () => {
      setConnectionState('closed')
      if (wsRef.current === ws) wsRef.current = null
    }

    return () => {
      ws.close()
      if (wsRef.current === ws) wsRef.current = null
    }
  }, [pathname, pushToast])

  const value = useMemo(
    () => ({ connectionState, sendFamilyUpdate }),
    [connectionState, sendFamilyUpdate]
  )

  return (
    <CasaMiaWebSocketContext.Provider value={value}>
      {children}
      <WsToastStack toasts={toasts} onDismiss={dismissToast} />
    </CasaMiaWebSocketContext.Provider>
  )
}

export function useCasaMiaWebSocketContext() {
  return useContext(CasaMiaWebSocketContext)
}
