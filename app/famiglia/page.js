'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Shield, UserCircle, ArrowLeft, UserPlus, Copy, Check, Pencil, X as XIcon } from 'lucide-react'
import Navbar from '../components/Navbar'
import { LS_TOKEN_KEY } from '@/lib/authSession'
import { getFamilyMembers, addFamilyMember } from '@/lib/api'
import { useSession } from '@/contexts/SessionContext'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import LogoLoader from '../components/LogoLoader'

export default function FamigliaPage() {
  const router = useRouter()
  const { user, family, hydrated, refreshSession, updateFamilyName } = useSession()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ email: '', password: '', name: '' })
  const [addError, setAddError] = useState('')
  const [addBusy, setAddBusy] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const inviteRefreshOnce = useRef(false)
  const [editingFamilyName, setEditingFamilyName] = useState(false)
  const [familyNameDraft, setFamilyNameDraft] = useState('')
  const [savingFamilyName, setSavingFamilyName] = useState(false)
  const [familyNameError, setFamilyNameError] = useState('')

  const load = useCallback(async () => {
    setLoadError('')
    try {
      const data = await getFamilyMembers()
      setMembers(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setLoadError('Impossibile caricare i membri')
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
    load()
  }, [router, load])

  useEffect(() => {
    if (!hydrated || user?.role !== 'ADMIN' || family?.inviteCode || inviteRefreshOnce.current) {
      return
    }
    inviteRefreshOnce.current = true
    refreshSession()
  }, [hydrated, user?.role, family?.inviteCode, refreshSession])

  useEffect(() => {
    if (family?.name) setFamilyNameDraft(family.name)
  }, [family?.name])

  const handleSaveFamilyName = async (e) => {
    e.preventDefault()
    setFamilyNameError('')
    const next = familyNameDraft.trim()
    if (!next) {
      setFamilyNameError('Inserisci un nome')
      return
    }
    setSavingFamilyName(true)
    try {
      await updateFamilyName(next)
      setEditingFamilyName(false)
    } catch (err) {
      setFamilyNameError(err.response?.data?.error || 'Impossibile salvare')
    } finally {
      setSavingFamilyName(false)
    }
  }

  const isAdmin = user?.role === 'ADMIN'
  const inviteCode = family?.inviteCode

  const copyInviteCode = async () => {
    if (!inviteCode || typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setAddError('')
    const email = addForm.email.trim()
    const name = addForm.name.trim()
    const password = addForm.password
    if (!email || !name || !password) {
      setAddError('Compila tutti i campi')
      return
    }
    setAddBusy(true)
    try {
      await addFamilyMember({ email, password, name, role: 'MEMBER' })
      setAddForm({ email: '', password: '', name: '' })
      setShowAdd(false)
      await load()
    } catch (err) {
      setAddError(err.response?.data?.error || 'Errore durante l’invito')
    } finally {
      setAddBusy(false)
    }
  }

  if (!hydrated || loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <div className="app-main-shell flex min-h-[50vh] items-center justify-center">
          <LogoLoader />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="app-main-shell">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">La tua famiglia</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Membri che condividono spesa, dispensa, lavagna e il resto dell’app.
                </p>

                {isAdmin && (
                  <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                    <h2 className="text-sm font-semibold text-foreground">Nome della casa</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Visibile in alto nell&apos;app e nella dashboard per tutti i membri.
                    </p>
                    {!editingFamilyName ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-base font-medium text-foreground">{family?.name || '—'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFamilyNameError('')
                            setFamilyNameDraft(family?.name || '')
                            setEditingFamilyName(true)
                          }}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifica
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSaveFamilyName} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1">
                          <label htmlFor="fam-name" className="sr-only">
                            Nome famiglia
                          </label>
                          <input
                            id="fam-name"
                            value={familyNameDraft}
                            onChange={(e) => setFamilyNameDraft(e.target.value)}
                            className="w-full min-h-10 rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                            maxLength={80}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={savingFamilyName}
                            className="min-h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50"
                          >
                            Salva
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFamilyName(false)
                              setFamilyNameError('')
                              setFamilyNameDraft(family?.name || '')
                            }}
                            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-3 hover:bg-muted"
                            aria-label="Annulla"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    )}
                    {familyNameError && <p className="mt-2 text-sm text-destructive">{familyNameError}</p>}
                  </div>
                )}

                {isAdmin && inviteCode && (
                  <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Codice invito (condividilo con chi deve entrare in questa casa)
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="rounded-lg bg-background px-3 py-2 font-mono text-lg font-semibold tracking-widest text-foreground">
                        {inviteCode}
                      </code>
                      <button
                        type="button"
                        onClick={copyInviteCode}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            Copiato
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copia
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Chi si registra da solo con &quot;Registrati&quot; crea un’altra casa anche se
                      il nome famiglia è uguale. Per vedere gli stessi dati serve questo codice su{' '}
                      <strong className="text-foreground">Unisciti a una casa</strong> (/unisciti) o
                      che tu aggiunga il membro qui sotto.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setAddError('')
                  setShowAdd((v) => !v)
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
              >
                <UserPlus className="h-4 w-4" />
                {showAdd ? 'Chiudi form' : 'Aggiungi membro'}
              </button>
            )}
          </div>
        </div>

        {loadError && (
          <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        )}

        {isAdmin && showAdd && (
          <form
            onSubmit={handleAddMember}
            className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
          >
            <h2 className="mb-3 text-lg font-semibold text-foreground">Nuovo membro</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Crea un account per un familiare (stesso nucleo). Comunicherai tu email e password
              in modo sicuro.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome</label>
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Password provvisoria
                </label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground"
                  autoComplete="new-password"
                />
              </div>
            </div>
            {addError && <p className="mt-3 text-sm text-destructive">{addError}</p>}
            <button
              type="submit"
              disabled={addBusy}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {addBusy ? 'Salvataggio…' : 'Crea membro'}
            </button>
          </form>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => {
            const isYou = m.id === user?.id
            const admin = m.role === 'ADMIN'
            return (
              <li
                key={m.id}
                className={`rounded-2xl border p-4 shadow-sm ${
                  isYou ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      admin ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {admin ? <Shield className="h-5 w-5" /> : <UserCircle className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{m.name}</span>
                      {isYou && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          Tu
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          admin
                            ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {admin ? 'Amministratore' : 'Membro'}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{m.email}</p>
                    {m.createdAt && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Dal {format(new Date(m.createdAt), 'd MMMM yyyy', { locale: it })}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {members.length === 0 && !loadError && (
          <p className="py-12 text-center text-muted-foreground">Nessun membro trovato.</p>
        )}
      </main>
    </div>
  )
}
