'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Package, ChefHat, Calendar, Cpu, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import Navbar from '../components/Navbar'

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
      description: 'Gestisci i tuoi acquisti',
      icon: ShoppingCart,
      href: '/shopping',
      gradient: 'from-green-400 to-emerald-600',
      stats: '12 articoli'
    },
    {
      title: 'Dispensa',
      description: 'Inventario e scadenze',
      icon: Package,
      href: '/pantry',
      gradient: 'from-orange-400 to-red-500',
      stats: '28 prodotti'
    },
    {
      title: 'Ricette',
      description: 'Suggerimenti personalizzati',
      icon: ChefHat,
      href: '/recipes',
      gradient: 'from-purple-400 to-pink-500',
      stats: '15 ricette'
    },
    {
      title: 'Scadenze',
      description: 'Bollette e pagamenti',
      icon: Calendar,
      href: '/deadlines',
      gradient: 'from-blue-400 to-indigo-600',
      stats: '3 prossime'
    },
    {
      title: 'Hub IoT',
      description: 'Dispositivi smart',
      icon: Cpu,
      href: '/iot',
      gradient: 'from-cyan-400 to-blue-500',
      stats: '5 dispositivi'
    },
  ]

  const quickStats = [
    {
      label: 'In scadenza oggi',
      value: '2',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Prodotti in casa',
      value: '28',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Scadenze mese',
      value: '8',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Dispositivi attivi',
      value: '5/5',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ciao{user ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Ecco un riepilogo della tua casa
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} w-14 h-14 rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{card.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">{card.stats}</span>
                    <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Alert Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-start">
            <div className="bg-yellow-100 rounded-xl p-3 mr-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Notifiche Importanti</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-yellow-800">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  2 prodotti in scadenza oggi nella dispensa
                </li>
                <li className="flex items-center text-yellow-800">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Bolletta luce in scadenza tra 3 giorni
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
