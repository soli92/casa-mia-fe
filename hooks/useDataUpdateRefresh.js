'use client'

import { useEffect } from 'react'
import { DATA_UPDATE_EVENT } from '@/contexts/CasaMiaWebSocketContext'

/**
 * Riesegue `refetch` quando arriva un `data_update` WebSocket per `resource`.
 */
export function useDataUpdateRefresh(resource, refetch) {
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.resource === resource) refetch()
    }
    window.addEventListener(DATA_UPDATE_EVENT, handler)
    return () => window.removeEventListener(DATA_UPDATE_EVENT, handler)
  }, [resource, refetch])
}
