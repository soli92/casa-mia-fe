'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Upload,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  FolderPlus,
  Camera,
  FolderOpen,
  X,
  Pencil,
  Eye,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import {
  getDocuments,
  presignDocument,
  commitDocument,
  deleteDocument,
  createDocumentFolder,
  renameDocumentFolder,
  deleteDocumentFolder,
  getDocumentAccessUrl,
} from '@/lib/api'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import LogoLoader from '../components/LogoLoader'

function formatBytes(n) {
  const x = Number(n)
  if (!Number.isFinite(x) || x < 0) return '—'
  if (x < 1024) return `${x} B`
  if (x < 1024 * 1024) return `${(x / 1024).toFixed(1)} KB`
  return `${(x / (1024 * 1024)).toFixed(1)} MB`
}

function mimeCategory(mime) {
  const m = String(mime || '').toLowerCase()
  if (m === 'application/pdf' || m.includes('pdf')) return 'pdf'
  if (m.startsWith('image/')) return 'image'
  return 'other'
}

export default function DocumentiPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const [folders, setFolders] = useState([])
  const [items, setItems] = useState([])
  const [storageConfigured, setStorageConfigured] = useState(true)
  const [maxBytes, setMaxBytes] = useState(25 * 1024 * 1024)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  /** Cartella di destinazione per i prossimi upload (null = root / senza cartella) */
  const [uploadFolderId, setUploadFolderId] = useState(null)
  const [viewer, setViewer] = useState(null)
  const [viewerLoading, setViewerLoading] = useState(false)
  const [viewerError, setViewerError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await getDocuments()
      setFolders(Array.isArray(data?.folders) ? data.folders : [])
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

  useEffect(() => {
    if (!viewerError) return undefined
    const t = setTimeout(() => setViewerError(''), 6000)
    return () => clearTimeout(t)
  }, [viewerError])

  const uploadOneFile = async (file) => {
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
        folderId: uploadFolderId || undefined,
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
        folderId: uploadFolderId || undefined,
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

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await uploadOneFile(file)
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

  const copyTempLink = async (doc) => {
    try {
      const { url } = await getDocumentAccessUrl(doc.id)
      await navigator.clipboard.writeText(url)
      setCopiedId(doc.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('Impossibile copiare il link temporaneo')
    }
  }

  const openViewer = async (doc) => {
    setViewer({ doc, url: null, mimeType: doc.mimeType, originalName: doc.originalName })
    setViewerError('')
    setViewerLoading(true)
    try {
      const data = await getDocumentAccessUrl(doc.id)
      setViewer((v) => (v && v.doc?.id === doc.id ? { ...v, url: data.url, mimeType: data.mimeType } : v))
    } catch (e) {
      setViewerError(e.response?.data?.error || 'Impossibile aprire il file')
      setViewer(null)
    } finally {
      setViewerLoading(false)
    }
  }

  const closeViewer = () => {
    setViewer(null)
    setViewerError('')
  }

  const newFolder = async () => {
    const name = window.prompt('Nome della nuova cartella?')
    if (name == null || !String(name).trim()) return
    setError('')
    try {
      await createDocumentFolder(String(name).trim())
      sendFamilyUpdate('documents', 'folder', {})
      await load()
    } catch (e) {
      setError(e.response?.data?.error || 'Creazione cartella non riuscita')
    }
  }

  const editFolder = async (folder) => {
    const name = window.prompt('Rinomina cartella', folder.name)
    if (name == null || !String(name).trim()) return
    setError('')
    try {
      await renameDocumentFolder(folder.id, String(name).trim())
      sendFamilyUpdate('documents', 'folder', {})
      await load()
    } catch (e) {
      setError(e.response?.data?.error || 'Rinomina non riuscita')
    }
  }

  const removeFolder = async (folder) => {
    if (
      !confirm(
        `Eliminare la cartella «${folder.name}»? I file resteranno in archivio senza cartella.`
      )
    )
      return
    setError('')
    try {
      await deleteDocumentFolder(folder.id)
      if (uploadFolderId === folder.id) setUploadFolderId(null)
      sendFamilyUpdate('documents', 'folder', {})
      await load()
    } catch (e) {
      setError(e.response?.data?.error || 'Eliminazione cartella non riuscita')
    }
  }

  const grouped = useMemo(() => {
    const byFolder = new Map()
    for (const f of folders) {
      byFolder.set(f.id, { folder: f, docs: [] })
    }
    const unfiled = []
    for (const doc of items) {
      const fid = doc.folderId
      if (fid && byFolder.has(fid)) {
        byFolder.get(fid).docs.push(doc)
      } else {
        unfiled.push(doc)
      }
    }
    return { byFolder, unfiled }
  }, [folders, items])

  const folderOptions = useMemo(
    () => [{ id: '', label: 'Senza cartella' }, ...folders.map((f) => ({ id: f.id, label: f.name }))],
    [folders]
  )

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <div className="app-main-shell flex min-h-[50vh] items-center justify-center">
          <LogoLoader />
        </div>
      </div>
    )
  }

  const renderDocRow = (doc) => (
    <li
      key={doc.id}
      className="flex flex-col gap-3 rounded-xl border border-border bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{doc.originalName}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(doc.sizeBytes)} · {doc.mimeType} · {doc.uploadedBy?.name || '—'} ·{' '}
            {doc.createdAt
              ? format(new Date(doc.createdAt), 'd MMM yyyy, HH:mm', { locale: it })
              : '—'}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/80">
            Riferimento bucket: {doc.storageKey ? doc.storageKey.split('/').pop() : '—'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <button
          type="button"
          onClick={() => openViewer(doc)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <Eye className="h-4 w-4" />
          Apri in app
        </button>
        <button
          type="button"
          onClick={() => copyTempLink(doc)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          {copiedId === doc.id ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Link copiato
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Link temp.
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
  )

  const renderFolderSection = (folder, docs) => (
    <section
      key={folder.id}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FolderOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <h2 className="truncate font-semibold text-foreground">{folder.name}</h2>
          <span className="text-sm text-muted-foreground">({docs.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editFolder(folder)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Rinomina cartella"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => removeFolder(folder)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Elimina cartella"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul className="space-y-2 p-3">
        {docs.length === 0 ? (
          <li className="py-6 text-center text-sm text-muted-foreground">Nessun file in questa cartella.</li>
        ) : (
          docs.map(renderDocRow)
        )}
      </ul>
    </section>
  )

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="app-main-shell">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Documenti</h1>
            <p className="mt-2 text-muted-foreground">
              Organizza i file in cartelle. I contenuti restano sul bucket: qui vedi solo metadati e chiave
              storage; l’apertura in app usa un link firmato temporaneo (come in Pippify).
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex w-full max-w-xs flex-col gap-1 sm:max-w-sm">
              <label htmlFor="doc-upload-folder" className="text-xs font-medium text-muted-foreground">
                Carica nella cartella
              </label>
              <select
                id="doc-upload-folder"
                value={uploadFolderId ?? ''}
                onChange={(e) => setUploadFolderId(e.target.value || null)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                disabled={!storageConfigured || uploading}
              >
                {folderOptions.map((o) => (
                  <option key={o.id || 'root'} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
                disabled={!storageConfigured || uploading}
                onChange={handleFile}
              />
              <input
                ref={cameraRef}
                type="file"
                className="sr-only"
                accept="image/*"
                capture="environment"
                disabled={!storageConfigured || uploading}
                onChange={handleFile}
              />
              <button
                type="button"
                disabled={!storageConfigured || uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                {uploading ? 'Caricamento…' : 'Carica file'}
              </button>
              <button
                type="button"
                disabled={!storageConfigured || uploading}
                onClick={() => cameraRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold hover:bg-muted disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
                Scansiona
              </button>
              <button
                type="button"
                onClick={newFolder}
                disabled={!storageConfigured}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold hover:bg-muted disabled:opacity-50"
              >
                <FolderPlus className="h-5 w-5" />
                Nuova cartella
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Max {formatBytes(maxBytes)} · PDF, immagini, Office, testo · Scansiona acquisisce una foto (JPEG/PNG)
              dalla fotocamera.
            </p>
          </div>
        </div>

        {!storageConfigured && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="font-medium">Archivio non attivo sul server</p>
              <p className="mt-1 text-muted-foreground">
                Configura <code className="rounded bg-muted px-1">S3_BUCKET</code>, chiavi e opz.{' '}
                <code className="rounded bg-muted px-1">S3_ENDPOINT</code> sul backend. Il bucket può essere{' '}
                <strong>privato</strong>: la lettura avviene tramite URL firmati. Per upload diretto dal browser
                serve CORS con metodo <strong>PUT</strong>.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {folders.length === 0 && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p>Nessun documento ancora. Crea una cartella o carica un file.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {folders.map((f) => {
              const block = grouped.byFolder.get(f.id)
              return renderFolderSection(f, block?.docs ?? [])
            })}

            <section className="overflow-hidden rounded-2xl border border-dashed border-border bg-card/40 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <FolderOpen className="h-5 w-5 text-muted-foreground" aria-hidden />
                <h2 className="font-semibold text-foreground">Senza cartella</h2>
                <span className="text-sm text-muted-foreground">({grouped.unfiled.length})</span>
              </div>
              <ul className="space-y-2 p-3">
                {grouped.unfiled.length === 0 ? (
                  <li className="py-4 text-center text-sm text-muted-foreground">
                    Nessun file fuori dalle cartelle.
                  </li>
                ) : (
                  grouped.unfiled.map(renderDocRow)
                )}
              </ul>
            </section>
          </div>
        )}
      </main>

      {viewer && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doc-viewer-title"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 id="doc-viewer-title" className="min-w-0 truncate text-lg font-semibold">
              {viewer.originalName}
            </h2>
            <button
              type="button"
              onClick={closeViewer}
              className="rounded-xl p-2 hover:bg-muted"
              aria-label="Chiudi"
            >
              <X className="h-6 w-6" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-4">
            {viewerLoading && (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
            {!viewerLoading && viewer.url && mimeCategory(viewer.mimeType) === 'pdf' && (
              <iframe
                title={viewer.originalName}
                src={viewer.url}
                className="h-[min(80vh,720px)] w-full rounded-xl border border-border bg-white"
              />
            )}
            {!viewerLoading && viewer.url && mimeCategory(viewer.mimeType) === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={viewer.url}
                alt={viewer.originalName}
                className="mx-auto max-h-[min(80vh,720px)] w-auto max-w-full rounded-xl object-contain"
              />
            )}
            {!viewerLoading && viewer.url && mimeCategory(viewer.mimeType) === 'other' && (
              <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-muted-foreground">
                  Anteprima non disponibile per questo tipo di file. Apri con il link firmato (valido alcuni
                  minuti).
                </p>
                <a
                  href={viewer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-95"
                >
                  Apri / scarica
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {viewerError && !viewer && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-destructive/30 bg-destructive/15 px-4 py-3 text-sm text-destructive shadow-lg sm:left-auto sm:right-4 sm:w-96">
          {viewerError}
        </div>
      )}
    </div>
  )
}
