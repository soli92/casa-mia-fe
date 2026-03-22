'use client'
import Link from 'next/link'
import { ShoppingCart, Package, ChefHat, Calendar, Wifi, Home } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12">🏠 Casa Mia</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card href="/shopping" icon={<ShoppingCart size={48} />} title="Lista Spesa" bg="bg-green-500" />
          <Card href="/pantry" icon={<Package size={48} />} title="Dispensa" bg="bg-orange-500" />
          <Card href="/recipes" icon={<ChefHat size={48} />} title="Ricette" bg="bg-purple-500" />
          <Card href="/deadlines" icon={<Calendar size={48} />} title="Scadenze" bg="bg-red-500" />
          <Card href="/iot" icon={<Wifi size={48} />} title="Hub IoT" bg="bg-blue-500" />
          <Card href="/login" icon={<Home size={48} />} title="Login" bg="bg-gray-700" />
        </div>
      </div>
    </div>
  )
}

function Card({ href, icon, title, bg }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition hover:-translate-y-1">
        <div className={`${bg} w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-center">{title}</h3>
      </div>
    </Link>
  )
}
