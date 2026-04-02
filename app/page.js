'use client'

import Link from 'next/link'
import {
  ShoppingCart,
  Package,
  ChefHat,
  Calendar,
  Wifi,
  Home,
  ArrowRight,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
      <div className="pointer-events-none absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur-md">
              <Home className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="mb-6 text-5xl font-bold drop-shadow-sm md:text-7xl">
            🏠 Casa Mia
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl font-light text-muted-foreground md:text-2xl">
            La tua casa intelligente, organizzata e connessa. Tutto sotto controllo in un&apos;unica app.
          </p>
          <Link href="/login">
            <button
              type="button"
              className="mx-auto flex items-center space-x-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-xl transition-transform hover:scale-105 hover:opacity-95"
            >
              <span>Inizia ora</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            href="/login"
            icon={<ShoppingCart className="h-8 w-8" />}
            title="Lista Spesa"
            description="Gestisci i tuoi acquisti con categorie e storico"
            accent="from-emerald-500 to-emerald-700"
          />
          <Card
            href="/login"
            icon={<Package className="h-8 w-8" />}
            title="Dispensa Intelligente"
            description="Monitora le scadenze e non sprecare più cibo"
            accent="from-orange-500 to-orange-700"
          />
          <Card
            href="/login"
            icon={<ChefHat className="h-8 w-8" />}
            title="Ricette Suggerite"
            description="Ricette personalizzate in base a ciò che hai"
            accent="from-violet-500 to-violet-700"
          />
          <Card
            href="/login"
            icon={<Calendar className="h-8 w-8" />}
            title="Calendario Scadenze"
            description="Bollette, tasse e abbonamenti sempre sotto controllo"
            accent="from-red-500 to-red-700"
          />
          <Card
            href="/login"
            icon={<Wifi className="h-8 w-8" />}
            title="Hub IoT"
            description="Controlla dispositivi smart in tempo reale"
            accent="from-sky-500 to-sky-700"
          />
          <Card
            href="/register"
            icon={<Home className="h-8 w-8" />}
            title="Multi-famiglia"
            description="Condividi la gestione con tutta la famiglia"
            accent="from-pink-500 to-pink-700"
          />
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Sviluppato con ❤️ da Soli AI Agent</p>
        </div>
      </div>
    </div>
  )
}

function Card({ href, icon, title, description, accent }) {
  return (
    <Link href={href}>
      <div className="group rounded-2xl border border-border bg-card/90 p-8 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl">
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-card-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
