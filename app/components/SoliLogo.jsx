'use client'

const VARIANTS = {
  wordmark: {
    light: '/brand-assets/soli-icons/soli-icon-4x3-with-text-mono.svg',
    dark: '/brand-assets/soli-icons/soli-icon-4x3-with-text-gold.svg',
    alt: 'Soli',
  },
  symbol: {
    light: '/brand-assets/soli-category-icons/soli-icon-symbol.svg',
    dark: '/brand-assets/soli-category-icons/soli-icon-symbol.svg',
    alt: 'Soli symbol',
  },
}

export default function SoliLogo({
  variant = 'wordmark',
  size = 'md',
  className = '',
  alt,
}) {
  const selected = VARIANTS[variant] || VARIANTS.wordmark
  const sizeClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-11' : 'h-9'
  const rootClass = `soli-logo ${sizeClass} ${className}`.trim()

  return (
    <span className={rootClass} aria-label={alt || selected.alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="soli-logo__light" src={selected.light} alt={alt || selected.alt} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="soli-logo__dark" src={selected.dark} alt={alt || selected.alt} />
    </span>
  )
}
