function pad2(n) {
  return String(n).padStart(2, '0')
}

function isValidYMD(y, m, d) {
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

/** @param {string} text */
export function parseExpiryFromText(text) {
  if (!text || typeof text !== 'string') return ''
  let best = ''
  let bestTime = 0

  const trySet = (y, mo, d) => {
    if (!isValidYMD(y, mo, d)) return
    const iso = `${y}-${pad2(mo)}-${pad2(d)}`
    const t = new Date(y, mo - 1, d).getTime()
    if (t > bestTime) {
      bestTime = t
      best = iso
    }
  }

  const dmy = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/g
  let m
  while ((m = dmy.exec(text)) !== null) {
    let d = parseInt(m[1], 10)
    let mo = parseInt(m[2], 10)
    let y = parseInt(m[3], 10)
    if (y < 100) y += y >= 70 ? 1900 : 2000
    if (mo > 12 && d <= 12) {
      const tmp = d
      d = mo
      mo = tmp
    }
    trySet(y, mo, d)
  }

  const ymd = /\b(20[0-3]\d|19\d{2})[/.-](\d{1,2})[/.-](\d{1,2})\b/g
  while ((m = ymd.exec(text)) !== null) {
    const y = parseInt(m[1], 10)
    const mo = parseInt(m[2], 10)
    const d = parseInt(m[3], 10)
    trySet(y, mo, d)
  }

  return best
}

const NOISE_LINE =
  /^(eur|iva|www\.|http|totale|sconto|€|p\.?\s*iva|cf\s|tel\.|fax|e-mail|mailto:)/i

/** @param {string} text */
export function guessProductNameFromOcr(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const candidates = lines.filter((l) => {
    if (l.length < 3 || l.length > 140) return false
    if (NOISE_LINE.test(l)) return false
    if (/^\d+[,.]?\d*\s*(€|eur)?$/i.test(l)) return false
    if (/^[0-9\s./-]+$/.test(l)) return false
    return /[a-zA-ZÀ-ÿ]/.test(l)
  })

  if (candidates.length === 0) {
    const fallback = lines.find((l) => l.length >= 2)
    return (fallback || 'Prodotto').slice(0, 120)
  }

  candidates.sort((a, b) => b.length - a.length)
  return candidates[0].slice(0, 120)
}

/**
 * @param {File} file
 * @param {(pct: number) => void} [onProgress]
 */
export async function runOcrOnImageFile(file, onProgress) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('ita+eng', 1, {
    logger: (msg) => {
      if (typeof msg?.progress === 'number' && onProgress) {
        const p = msg.progress <= 1 ? Math.round(msg.progress * 100) : Math.round(msg.progress)
        onProgress(Math.min(100, Math.max(0, p)))
      }
    },
  })
  try {
    const { data } = await worker.recognize(file)
    const raw = data?.text ?? ''
    return {
      text: raw,
      name: guessProductNameFromOcr(raw),
      expirationDate: parseExpiryFromText(raw),
    }
  } finally {
    await worker.terminate()
  }
}
