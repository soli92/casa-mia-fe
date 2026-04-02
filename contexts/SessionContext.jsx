'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getMe, updateFamily as apiUpdateFamily } from '@/lib/api'
import {
  LS_TOKEN_KEY,
  loadStoredSession,
  persistSession,
} from '@/lib/authSession'

const defaultSession = {
  user: null,
  family: null,
  hydrated: false,
  refreshSession: async () => {},
  updateFamilyName: async () => undefined,
  isFamilyScope: false,
}

const SessionContext = createContext(defaultSession)

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)
  const [family, setFamily] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  const applyPayload = useCallback((payload) => {
    if (payload?.user) setUser(payload.user)
    if (payload?.family) setFamily(payload.family)
    if (payload?.user || payload?.family) {
      persistSession({ user: payload.user, family: payload.family })
    }
  }, [])

  const refreshSession = useCallback(async () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem(LS_TOKEN_KEY)
    if (!token) {
      setUser(null)
      setFamily(null)
      return
    }
    try {
      const data = await getMe()
      applyPayload(data)
    } catch {
      /* token scaduto / 401 gestito da interceptor */
    }
  }, [applyPayload])

  useEffect(() => {
    const { user: u, family: f } = loadStoredSession()
    setUser(u)
    setFamily(f)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const token = localStorage.getItem(LS_TOKEN_KEY)
    if (token) {
      refreshSession()
    }
  }, [hydrated, refreshSession])

  const updateFamilyName = useCallback(
    async (name) => {
      const data = await apiUpdateFamily(name)
      if (data?.family) {
        setFamily(data.family)
        persistSession({ family: data.family })
      }
      return data?.family
    },
    []
  )

  const value = useMemo(
    () => ({
      user,
      family,
      hydrated,
      refreshSession,
      updateFamilyName,
      /** Dati condivisi dalla stessa famiglia (backend: tutti i MEMBER usano familyId) */
      isFamilyScope: Boolean(family?.id),
    }),
    [user, family, hydrated, refreshSession, updateFamilyName]
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
