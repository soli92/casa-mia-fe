'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Package, ChefHat, Calendar, Cpu, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const cards = [
    {
      title: 'Lista della Spesa',
      description: 'Gestisci la tua lista della spesa',
      icon: ShoppingCart,
      href: '/shopping',
      color: 'bg-blue-500'
    },
    {
      title: 'Dispensa',
      description: 'Inventario prodotti in casa',
      icon: Package,
      href: '/pantry',
      color: 'bg-green-500'
    },
    {
      title: 'Ricette',
      description: 'Suggerimenti basati sulla dispensa',
      icon: ChefHat,
      href: '/recipes',
      color: 'bg-orange-500'
    },
    {
      title: 'Scadenze',
      description: 'Calendario bollette e pagamenti',
      icon: Calendar,
      href: '/deadlines',
      color: 'bg-purple-500'
    },
    {
      title: 'Hub IoT',
      description: 'Gestisci dispositivi smart',
      icon: Cpu,
      href: '/iot',
      color: 'bg-indigo-500'
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Benvenuto{user ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-gray-600">Gestisci la tua casa in modo intelligente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100 hover:border-indigo-200"
            >
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.description}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Promemoria</h3>
            <p className="text-yellow-800">
              Configura il tuo database PostgreSQL su Supabase e inserisci la DATABASE_URL nel backend per iniziare!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
