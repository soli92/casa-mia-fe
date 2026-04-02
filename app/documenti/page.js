'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import {
  getDocuments,
  presignDocument,
  commitDocument,
  deleteDocument,
} from '@/lib/api'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

function formatBytes(n) {
  const x = Number(n)
  if (!Number.isFinite(x) || x < 0) return '—'
  if (x < 1024) return `${x} B`
  if (x < 1024 * 1024) return `${(x / 1024).toFixed(1)} KB`
  return `${(x / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentiPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const fileRef = useRef(null)
  const [items, setItems] = useState([])
  const [storageConfigured, setStorageConfigured] = useState(true)
  const [maxBytes, setMaxBytes] = useState(25 * 1024 * 1024)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await getDocuments()
      setItems(Array.isArray(data?.items) ? data.items : [])
      setStorageConfigured(data?.storageConfigured !== false)
      if (typeof data?.maxBytes === 'number') setMaxBytes(data.maxBytes)
    } catch (e) {
      console.error(e)
      setError('Impossibile caricare i documenti')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!localStorage.getItem(LS_TOKEN_KEY)) {
      router.push('/login')
      return
    }
    load()
  }, [router, load])

  useDataUpdateRefresh('documents', load)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')
    if (!storageConfigured) {
      setError('Storage non configurato sul server.')
      return
    }
    if (file.size > maxBytes) {
      setError(`File troppo grande (max ${formatBytes(maxBytes)})`)
      return
    }

    setUploading(true)
    try {
      const presign = await presignDocument({
        originalName: file.name,
        contentType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      })

      const putRes = await fetch(presign.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': presign.contentType || file.type || 'application/octet-stream',
        },
      })

      if (!putRes.ok) {
        throw new Error(`Upload fallito (${putRes.status})`)
      }

      await commitDocument({
        storageKey: presign.storageKey,
        originalName: file.name,
        contentType: presign.contentType || file.type || 'application/octet-stream',
        sizeBytes: file.size,
      })

      sendFamilyUpdate('documents', 'create', {})
      await load()
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.error ||
          err.message ||
          'Caricamento non riuscito. Controlla CORS sul bucket (PUT dal dominio del sito).'
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo documento per tutta la famiglia?')) return
    setError('')
    try {
      await deleteDocument(id)
      sendFamilyUpdate('documents', 'delete', { id })
      await load()
    } catch (e) {
      setError(e.response?.data?.error || 'Eliminazione non riuscita')
    }
  }

  const copyLink = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <div className="app-main-shell flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Caricamento…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="app-main-shell">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Documenti</h1>
            <p className="mt-2 text-muted-foreground">
              File condivisi con tutta la famiglia. Sono serviti tramite URL pubblico (CDN / bucket).
            </p>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
              disabled={!storageConfigured || uploading}
              onChange={handleFile}
            />
            <button
              type="button"
              disabled={!storageConfigured || uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              {uploading ? 'Caricamento…' : 'Carica file'}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Max {formatBytes(maxBytes)} · PDF, immagini, Office, testo
            </p>
          </div>
        </div>

        {!storageConfigured && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="font-medium">Archivio non attivo sul server</p>
              <p className="mt-1 text-muted-foreground">
                Configura le variabili <code className="rounded bg-muted px-1">S3_*</code> sul backend
                (bucket pubblico + URL CDN) come in <code className="rounded bg-muted px-1">.env.example</code>.
                Abilita CORS sul bucket per il metodo <strong>PUT</strong> dalla origine del frontend.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p>Nessun documento ancora.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{doc.originalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(doc.sizeBytes)} · {doc.mimeType} · caricato da{' '}
                      {doc.uploadedBy?.name || '—'} il{' '}
                      {doc.createdAt
                        ? format(new Date(doc.createdAt), 'd MMM yyyy, HH:mm', { locale: it })
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <a
                    href={doc.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Apri
                  </a>
                  <button
                    type="button"
                    onClick={() => copyLink(doc.publicUrl, doc.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {copiedId === doc.id ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Copiato
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Link
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Elimina
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
