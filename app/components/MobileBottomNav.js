'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingCart,
  Package,
  ChefHat,
  Calendar,
  Wifi,
  StickyNote,
  Users,
} from 'lucide-react'

const items = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/famiglia', icon: Users, label: 'Famiglia' },
  { href: '/lavagna', icon: StickyNote, label: 'Lavagna' },
  { href: '/shopping', icon: ShoppingCart, label: 'Spesa' },
  { href: '/pantry', icon: Package, label: 'Dispensa' },
  { href: '/recipes', icon: ChefHat, label: 'Ricette' },
  { href: '/deadlines', icon: Calendar, label: 'Scadenze' },
  { href: '/iot', icon: Wifi, label: 'IoT' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
      style={{
        paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))',
      }}
      aria-label="Navigazione principale"
    >
      <ul className="flex max-w-full items-stretch justify-start gap-0 overflow-x-auto overflow-y-hidden px-0.5 pt-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <li key={href} className="min-w-[3.35rem] shrink-0">
              <Link
                href={href}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 active:scale-[0.98] ${
                  active
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={active ? 2.25 : 2}
                  aria-hidden
                />
                <span className="max-w-full truncate px-0.5 text-center text-[10px] font-semibold leading-tight sm:text-[11px]">
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
