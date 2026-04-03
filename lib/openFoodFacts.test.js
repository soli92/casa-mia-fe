import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchProductByBarcode } from './openFoodFacts'

describe('fetchProductByBarcode', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('codice troppo corto → not found senza fetch', async () => {
    const r = await fetchProductByBarcode('1234567')
    expect(r.found).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('HTTP non ok → fallback nome da barcode', async () => {
    const r = await fetchProductByBarcode('8000500310407')
    expect(r.found).toBe(false)
    expect(r.name).toContain('8000500310407')
    expect(r.category).toBe('ALTRO')
  })

  it('status diverso da 1 → fallback', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 0, product: null }),
    })
    const r = await fetchProductByBarcode('8000500310407')
    expect(r.found).toBe(false)
    expect(r.name).toMatch(/Prodotto|8000500310407/)
  })

  it('prodotto trovato → nome e categoria mappata', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: {
          product_name_it: 'Acqua minerale',
          brands: 'Brand',
          categories_tags: ['en:beverages', 'en:waters'],
        },
      }),
    })
    const r = await fetchProductByBarcode('8000500310407')
    expect(r.found).toBe(true)
    expect(r.name).toContain('Acqua')
    expect(r.category).toBe('BEVANDE')
  })

  it('fetch in errore → non lancia, fallback', async () => {
    global.fetch.mockRejectedValue(new Error('network'))
    const r = await fetchProductByBarcode('8000500310407')
    expect(r.found).toBe(false)
    expect(r.category).toBe('ALTRO')
  })
})
