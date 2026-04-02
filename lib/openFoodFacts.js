/**
 * Lookup prodotto da barcode (EAN/UPC) via Open Food Facts (client-side, HTTPS).
 * https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

const PANTRY_CATEGORIES = new Set([
  'FRUTTA',
  'VERDURA',
  'CARNE',
  'PESCE',
  'LATTICINI',
  'PANE',
  'PASTA',
  'BEVANDE',
  'SNACK',
  'ALTRO',
])

function mapTagsToCategory(tags) {
  if (!Array.isArray(tags)) return 'ALTRO'
  const t = tags.join(' ').toLowerCase()
  if (t.includes('beverage') || t.includes('bevande') || t.includes('drink')) return 'BEVANDE'
  if (t.includes('dairy') || t.includes('latte') || t.includes('yogurt') || t.includes('formaggio'))
    return 'LATTICINI'
  if (t.includes('meat') || t.includes('carne') || t.includes('wurst')) return 'CARNE'
  if (t.includes('fish') || t.includes('pesce') || t.includes('seafood')) return 'PESCE'
  if (t.includes('fruit') || t.includes('frutta')) return 'FRUTTA'
  if (t.includes('vegetable') || t.includes('verdura') || t.includes('legume')) return 'VERDURA'
  if (t.includes('pasta') || t.includes('noodle')) return 'PASTA'
  if (t.includes('bread') || t.includes('pane') || t.includes('bakery')) return 'PANE'
  if (t.includes('snack') || t.includes('crisp') || t.includes('cookie') || t.includes('cioccolat'))
    return 'SNACK'
  return 'ALTRO'
}

function normalizeCategory(c) {
  return PANTRY_CATEGORIES.has(c) ? c : 'ALTRO'
}

/**
 * @param {string} barcode
 * @returns {Promise<{ name: string, category: string, brands?: string, found: boolean }>}
 */
export async function fetchProductByBarcode(barcode) {
  const code = String(barcode ?? '').replace(/\D/g, '')
  if (!code || code.length < 8) {
    return { found: false, name: '', category: 'ALTRO' }
  }

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`
    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
    if (!res.ok) return { found: false, name: `Prodotto ${code}`, category: 'ALTRO' }
    const data = await res.json()
    if (data.status !== 1 || !data.product) {
      return { found: false, name: `Prodotto ${code}`, category: 'ALTRO' }
    }
    const p = data.product
    const name =
      p.product_name_it ||
      p.product_name ||
      p.generic_name_it ||
      p.generic_name ||
      `Prodotto ${code}`
    const tags = p.categories_tags || p.categories_properties_tags || []
    const category = normalizeCategory(mapTagsToCategory(tags))
    const brands = typeof p.brands === 'string' ? p.brands : undefined
    const label = brands ? `${name} (${brands})` : name
    return { found: true, name: label.trim(), category, brands }
  } catch {
    return { found: false, name: `Prodotto ${code}`, category: 'ALTRO' }
  }
}
