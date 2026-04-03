import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  loadPantryScanHistory,
  pushPantryScanHistory,
  clearPantryScanHistory,
} from './pantryScanHistory'

const mem = {}

beforeEach(() => {
  vi.stubGlobal('window', globalThis)
  Object.keys(mem).forEach((k) => delete mem[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => {
      mem[k] = String(v)
    },
    removeItem: (k) => {
      delete mem[k]
    },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pantryScanHistory', () => {
  it('load iniziale vuoto', () => {
    expect(loadPantryScanHistory()).toEqual([])
  })

  it('push aggiunge in testa e deduplica barcode', () => {
    const a = pushPantryScanHistory({
      source: 'barcode',
      name: 'A',
      category: 'ALTRO',
      barcode: '111',
    })
    expect(a).toHaveLength(1)
    expect(a[0].barcode).toBe('111')

    const b = pushPantryScanHistory({
      source: 'barcode',
      name: 'A2',
      category: 'ALTRO',
      barcode: '111',
    })
    expect(b).toHaveLength(1)
    expect(b[0].name).toBe('A2')

    const c = pushPantryScanHistory({
      source: 'barcode',
      name: 'B',
      category: 'ALTRO',
      barcode: '222',
    })
    expect(c).toHaveLength(2)
    expect(c[0].barcode).toBe('222')
  })

  it('clear rimuove lo storico', () => {
    pushPantryScanHistory({ source: 'ocr', name: 'X', category: 'ALTRO' })
    clearPantryScanHistory()
    expect(loadPantryScanHistory()).toEqual([])
  })
})
