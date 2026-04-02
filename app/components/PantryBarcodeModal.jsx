'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const READER_ID = 'pantry-barcode-reader'

/**
 * Modal fullscreen leggero: fotocamera posteriore + lettura barcode EAN/UPC.
 * @param {{ onClose: () => void, onScan: (barcode: string) => void }} props
 */
export default function PantryBarcodeModal({ onClose, onScan }) {
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(true)
  const scannerRef = useRef(null)
  const stoppedRef = useRef(false)

  useEffect(() => {
    stoppedRef.current = false
    let html5

    ;(async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
        const formats = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
        ]
        html5 = new Html5Qrcode(READER_ID, { formatsToSupport: formats, verbose: false })
        scannerRef.current = html5

        await html5.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 160 } },
          (decodedText) => {
            if (stoppedRef.current) return
            const digits = String(decodedText ?? '').replace(/\D/g, '')
            if (digits.length < 8) return
            stoppedRef.current = true
            const s = scannerRef.current
            if (!s) return
            s.stop()
              .catch(() => {})
              .finally(() => {
                s.clear().catch(() => {})
                scannerRef.current = null
                onScan(digits)
                onClose()
              })
          },
          () => {}
        )
        setStarting(false)
      } catch (e) {
        console.error(e)
        setError(
          'Impossibile usare la fotocamera. Consenti l’accesso in impostazioni del browser oppure usa HTTPS.'
        )
        setStarting(false)
      }
    })()

    return () => {
      stoppedRef.current = true
      const h = scannerRef.current
      scannerRef.current = null
      if (h) {
        h.stop()
          .catch(() => {})
          .then(() => h.clear().catch(() => {}))
      }
    }
  }, [onClose, onScan])

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Scansione barcode"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3 text-white">
        <p className="text-sm font-medium">Inquadra il codice a barre del prodotto</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 hover:bg-white/10"
          aria-label="Chiudi"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center p-3">
        {starting && !error && (
          <p className="absolute z-10 text-sm text-white/80">Avvio fotocamera…</p>
        )}
        {error ? (
          <p className="max-w-sm text-center text-sm text-red-200">{error}</p>
        ) : (
          <div
            id={READER_ID}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-black [&_video]:max-h-[55vh]"
          />
        )}
        <p className="mt-4 max-w-sm text-center text-xs text-white/60">
          I dati prodotto (nome) arrivano da Open Food Facts quando il codice è noto; puoi sempre
          modificare nome e categoria prima di salvare.
        </p>
      </div>
    </div>
  )
}
