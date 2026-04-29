'use client'

import SoliLogo from './SoliLogo'

export default function LogoLoader({ label = 'Caricamento…', compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${compact ? '' : 'py-6'}`}>
      <div className="animate-pulse">
        <SoliLogo size={compact ? 'sm' : 'md'} />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
