import { describe, it, expect } from 'vitest'
import { parseExpiryFromText, guessProductNameFromOcr } from './pantryOcr'

describe('parseExpiryFromText', () => {
  it('ritorna stringa vuota per input non valido', () => {
    expect(parseExpiryFromText('')).toBe('')
    expect(parseExpiryFromText(null)).toBe('')
  })

  it('riconosce formato gg/mm/aaaa', () => {
    expect(parseExpiryFromText('Scadenza 15/12/2026 lotto A')).toBe('2026-12-15')
  })

  it('riconosce formato aaaa-mm-gg', () => {
    expect(parseExpiryFromText('2027-03-01 confezione')).toBe('2027-03-01')
  })

  it('sceglie la data più futura tra più match', () => {
    const t = '01/01/2025 e anche 31/12/2028 fine'
    expect(parseExpiryFromText(t)).toBe('2028-12-31')
  })
})

describe('guessProductNameFromOcr', () => {
  it('ignora righe rumorose e numeri puri', () => {
    const text = ['Totale 12,50 €', 'www.example.com', 'Yogurt greco intero'].join('\n')
    expect(guessProductNameFromOcr(text)).toContain('Yogurt')
  })

  it('preferisce la riga candidata più lunga', () => {
    const text = 'OK\nLatte\nLatte intero a lunga conservazione 1L'
    expect(guessProductNameFromOcr(text)).toContain('conservazione')
  })

  it('fallback se nessun candidato alfabetico', () => {
    expect(guessProductNameFromOcr('12')).toBe('12')
  })
})
