'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Package, ChefHat, Calendar, Cpu, LogOut, Bell } from 'lucide-react'
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/')
  }

  const cards = [
    {
      title: 'Lista della Spesa',
      description: 'Organizza i tuoi acquisti',
      icon: ShoppingCart,
      href: '/shopping',
      gradient: 'from-green-400 to-green-600',
      stats: '12 prodotti'
    },
    {
      title: 'Dispensa',
      description: 'Inventario prodotti in casa',
      icon: Package,
      href: '/pantry',
      gradient: 'from-orange-400 to-orange-600',
      stats: '3 in scadenza'
    },
    {
      title: 'Ricette',
      description: 'Suggerimenti personalizzati',
      icon: ChefHat,
      href: '/recipes',
      gradient: 'from-purple-400 to-purple-600',
      stats: '8 disponibili'
    },
    {
      title: 'Scadenze',
      description: 'Calendario pagamenti',
      icon: Calendar,
      href: '/deadlines',
      gradient: 'from-red-400 to-red-600',
      stats: '2 imminenti'
    },
    {
      title: 'Hub IoT',
      description: 'Dispositivi smart home',
      icon: Cpu,
      href: '/iot',
      gradient: 'from-blue-400 to-blue-600',
      stats: '5 online'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Casa Mia</h1>
                {user && <p className="text-sm text-gray-500">Ciao, {user.name}! 👋</p>}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Esci</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600">Gestisci la tua casa in modo intelligente</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className={`bg-gradient-to-br ${card.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{card.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">{card.stats}</span>
                    <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Vai →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-green-900">Spesa settimanale</h3>
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">€87,50</p>
            <p className="text-sm text-green-600 mt-1">-12% rispetto a settimana scorsa</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-orange-900">Prodotti in scadenza</h3>
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-700">3</p>
            <p className="text-sm text-orange-600 mt-1">Controlla la dispensa</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-purple-900">Prossime scadenze</h3>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-700">2</p>
            <p className="text-sm text-purple-600 mt-1">Nei prossimi 7 giorni</p>
          </div>
        </div>
      </main>
    </div>
  )
}
