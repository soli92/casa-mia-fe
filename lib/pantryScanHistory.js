const KEY = 'casaMia:pantryScanHistory'
const MAX = 25

/**
 * @typedef {{ id: string, at: string, source: 'barcode'|'ocr', name: string, category?: string, barcode?: string, expirationDate?: string }} PantryScanHistoryRow
 */

/** @returns {PantryScanHistoryRow[]} */
export function loadPantryScanHistory() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/**
 * @param {Omit<PantryScanHistoryRow, 'id'|'at'>} entry
 * @returns {PantryScanHistoryRow[]}
 */
export function pushPantryScanHistory(entry) {
  const prev = loadPantryScanHistory()
  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
    ...entry,
  }
  const filtered = entry.barcode
    ? prev.filter((p) => p.barcode !== entry.barcode)
    : prev
  const next = [row, ...filtered].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function clearPantryScanHistory() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
