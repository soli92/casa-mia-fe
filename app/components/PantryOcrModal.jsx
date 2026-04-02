'use client'

import { useCallback, useRef, useState } from 'react'
import { X, Camera, Loader2 } from 'lucide-react'
import { runOcrOnImageFile } from '@/lib/pantryOcr'

/**
 * @param {{
 *   onClose: () => void,
 *   onResult: (payload: { name: string, expirationDate: string, rawText: string }) => void
 * }} props
 */
export default function PantryOcrModal({ onClose, onResult }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const handleFile = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file || !file.type.startsWith('image/')) return

      setError('')
      setBusy(true)
      setProgress(0)
      try {
        const { name, expirationDate, text } = await runOcrOnImageFile(file, setProgress)
        onResult({
          name,
          expirationDate: expirationDate || '',
          rawText: text,
        })
        onClose()
      } catch (err) {
        console.error(err)
        setError('Lettura non riuscita. Riprova con più luce o un’inquadratura più vicina.')
      } finally {
        setBusy(false)
        setProgress(0)
      }
    },
    [onClose, onResult]
  )

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-background/98 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Scansione etichetta"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
        <h2 className="text-base font-semibold text-foreground">Foto etichetta</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 hover:bg-muted"
          aria-label="Chiudi"
          disabled={busy}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Scatta una foto chiara del nome del prodotto e, se c’è, della data di scadenza. Il
          riconoscimento avviene sul dispositivo (nessun invio dell’immagine al backend).
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleFile}
          disabled={busy}
        />

        {busy ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
            <p className="text-sm font-medium text-foreground">Analisi testo… {progress}%</p>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg hover:opacity-95"
          >
            <Camera className="h-7 w-7" />
            Scatta o scegli foto
          </button>
        )}

        {error && (
          <p className="max-w-sm text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <p className="max-w-sm text-center text-xs text-muted-foreground">
          La prima esecuzione scarica i dati lingua (ita+eng): può richiedere qualche secondo su
          rete mobile.
        </p>
      </div>
    </div>
  )
}
