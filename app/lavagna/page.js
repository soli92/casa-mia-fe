'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  StickyNote,
  Plus,
  Trash2,
  Pencil,
  GripVertical,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import {
  getPostIts,
  createPostIt,
  updatePostIt,
  deletePostIt,
} from '@/lib/api'
import { useCasaMiaWebSocketContext } from '@/contexts/CasaMiaWebSocketContext'
import { useDataUpdateRefresh } from '@/hooks/useDataUpdateRefresh'
import LogoLoader from '../components/LogoLoader'

const COLORS = [
  { id: 'amber', label: 'Giallo' },
  { id: 'rose', label: 'Rosa' },
  { id: 'sky', label: 'Azzurro' },
  { id: 'lime', label: 'Verde' },
  { id: 'violet', label: 'Viola' },
]

const COLOR_CLASS = {
  amber:
    'border-amber-300/90 bg-amber-100 text-amber-950 shadow-amber-200/40 dark:border-amber-700 dark:bg-amber-950/55 dark:text-amber-50 dark:shadow-black/30',
  rose:
    'border-rose-300/90 bg-rose-100 text-rose-950 shadow-rose-200/40 dark:border-rose-700 dark:bg-rose-950/55 dark:text-rose-50 dark:shadow-black/30',
  sky:
    'border-sky-300/90 bg-sky-100 text-sky-950 shadow-sky-200/40 dark:border-sky-700 dark:bg-sky-950/55 dark:text-sky-50 dark:shadow-black/30',
  lime:
    'border-lime-300/90 bg-lime-100 text-lime-950 shadow-lime-200/40 dark:border-lime-700 dark:bg-lime-950/55 dark:text-lime-50 dark:shadow-black/30',
  violet:
    'border-violet-300/90 bg-violet-100 text-violet-950 shadow-violet-200/40 dark:border-violet-700 dark:bg-violet-950/55 dark:text-violet-50 dark:shadow-black/30',
}

function clampPct(v) {
  return Math.min(100, Math.max(0, v))
}

export default function LavagnaPage() {
  const router = useRouter()
  const { sendFamilyUpdate } = useCasaMiaWebSocketContext()
  const boardRef = useRef(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [localPos, setLocalPos] = useState({})
  const dragRef = useRef(null)
  const [editing, setEditing] = useState(null)
  const [editText, setEditText] = useState('')
  const [editColor, setEditColor] = useState('amber')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getPostIts()
      setNotes(data)
    } catch (e) {
      console.error(e)
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

  useDataUpdateRefresh('board', load)

  const broadcast = useCallback(
    (action, data = {}) => {
      sendFamilyUpdate('board', action, data)
    },
    [sendFamilyUpdate]
  )

  const handleAdd = async () => {
    try {
      const n = await createPostIt({})
      setNotes((prev) => [...prev, n])
      broadcast('create', { id: n.id })
      setEditing(n)
      setEditText(n.content)
      setEditColor(n.color || 'amber')
    } catch (e) {
      console.error(e)
    }
  }

  const openEdit = (n) => {
    setEditing(n)
    setEditText(n.content)
    setEditColor(n.color || 'amber')
  }

  const saveEdit = async () => {
    if (!editing) return
    const t = editText.trim()
    if (!t) return
    setSaving(true)
    try {
      const updated = await updatePostIt(editing.id, {
        content: t,
        color: editColor,
      })
      setNotes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      broadcast('update', { id: updated.id })
      setEditing(null)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const removeNote = async (id) => {
    if (!confirm('Eliminare questo post-it?')) return
    try {
      await deletePostIt(id)
      setNotes((prev) => prev.filter((x) => x.id !== id))
      setLocalPos((p) => {
        const next = { ...p }
        delete next[id]
        return next
      })
      broadcast('delete', { id })
      if (editing?.id === id) setEditing(null)
    } catch (e) {
      console.error(e)
    }
  }

  const onPointerDownNote = (e, note) => {
    if (e.target.closest('[data-note-action]')) return
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const x = localPos[note.id]?.xPercent ?? note.xPercent
    const y = localPos[note.id]?.yPercent ?? note.yPercent
    dragRef.current = {
      id: note.id,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: x,
      origY: y,
      width: rect.width,
      height: rect.height,
    }
  }

  const onPointerMoveNote = (e) => {
    const d = dragRef.current
    if (!d || d.pointerId !== e.pointerId) return
    const dxPct = ((e.clientX - d.startClientX) / d.width) * 100
    const dyPct = ((e.clientY - d.startClientY) / d.height) * 100
    setLocalPos((prev) => ({
      ...prev,
      [d.id]: {
        xPercent: clampPct(d.origX + dxPct),
        yPercent: clampPct(d.origY + dyPct),
      },
    }))
  }

  const onPointerUpNote = async (e) => {
    const d = dragRef.current
    if (!d || d.pointerId !== e.pointerId) return
    dragRef.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    const pos = localPos[d.id]
    if (!pos) return
    try {
      const updated = await updatePostIt(d.id, {
        xPercent: pos.xPercent,
        yPercent: pos.yPercent,
      })
      setNotes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      setLocalPos((p) => {
        const next = { ...p }
        delete next[d.id]
        return next
      })
      broadcast('update', { id: d.id })
    } catch (err) {
      console.error(err)
      setLocalPos((p) => {
        const next = { ...p }
        delete next[d.id]
        return next
      })
      load()
    }
  }

  const displayPos = (note) => localPos[note.id] ?? { xPercent: note.xPercent, yPercent: note.yPercent }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <div className="app-main-shell">
        <header className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
              <StickyNote className="h-7 w-7 shrink-0 text-primary" />
              Lavagna
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Post-it condivisi con la tua famiglia: trascina per spostare, modifica o elimina.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-95 active:scale-[0.99]"
          >
            <Plus className="h-5 w-5" />
            Nuovo post-it
          </button>
        </header>

        <div
          ref={boardRef}
          className="relative min-h-[62dvh] w-full touch-none overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 shadow-inner [background-image:linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:22px_22px] dark:bg-muted/20 dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)]"
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <LogoLoader compact label="Caricamento lavagna…" />
            </div>
          )}

          {!loading && notes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
              <StickyNote className="h-14 w-14 opacity-40" />
              <p className="max-w-sm text-sm sm:text-base">
                Nessun post-it. Tocca <strong className="text-foreground">Nuovo post-it</strong> per iniziare la
                lavagna condivisa.
              </p>
            </div>
          )}

          {notes.map((note) => {
            const pos = displayPos(note)
            const rot = note.rotation ?? 0
            const cls = COLOR_CLASS[note.color] || COLOR_CLASS.amber
            return (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                onPointerDown={(e) => onPointerDownNote(e, note)}
                onPointerMove={onPointerMoveNote}
                onPointerUp={onPointerUpNote}
                onPointerCancel={onPointerUpNote}
                className={`absolute w-[min(88vw,240px)] cursor-grab select-none rounded-lg border-2 p-3 shadow-lg active:cursor-grabbing ${cls}`}
                style={{
                  left: `${pos.xPercent}%`,
                  top: `${pos.yPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                  zIndex: note.zIndex ?? 1,
                }}
              >
                <div className="mb-2 flex items-start justify-between gap-1 border-b border-black/10 pb-2 dark:border-white/10">
                  <div className="flex min-w-0 items-center gap-1 text-xs font-medium opacity-80">
                    <GripVertical className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{note.createdBy?.name || 'Famiglia'}</span>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      type="button"
                      data-note-action
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(note)
                      }}
                      className="rounded-md p-2 text-foreground/80 hover:bg-black/10 dark:hover:bg-white/10"
                      aria-label="Modifica"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      data-note-action
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNote(note.id)
                      }}
                      className="rounded-md p-2 text-destructive hover:bg-destructive/15"
                      aria-label="Elimina"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-snug">{note.content}</p>
              </div>
            )
          })}
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lavagna-edit-title"
        >
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-2xl sm:rounded-2xl">
            <h2 id="lavagna-edit-title" className="mb-3 text-lg font-semibold text-foreground">
              Modifica post-it
            </h2>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Testo</label>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={5}
              className="mb-4 w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={2000}
            />
            <p className="mb-2 text-xs font-medium text-muted-foreground">Colore</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setEditColor(c.id)}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                    editColor === c.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  } ${COLOR_CLASS[c.id]}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="min-h-11 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={saving || !editText.trim()}
                onClick={saveEdit}
                className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50"
              >
                {saving ? 'Salvataggio…' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
