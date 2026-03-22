'use client'
import Link from 'next/link'
import { ShoppingCart, Package, ChefHat, Calendar, Wifi, Home, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Effetti decorativi */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
              <Home className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            🏠 Casa Mia
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light max-w-2xl mx-auto">
            La tua casa intelligente, organizzata e connessa. Tutto sotto controllo in un'unica app.
          </p>
          <Link href="/login">
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center mx-auto space-x-2">
              <span>Inizia ora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            href="/login" 
            icon={<ShoppingCart className="w-8 h-8" />} 
            title="Lista Spesa" 
            description="Gestisci i tuoi acquisti con categorie e storico"
            gradient="from-green-400 to-green-600"
          />
          <Card 
            href="/login" 
            icon={<Package className="w-8 h-8" />} 
            title="Dispensa Intelligente" 
            description="Monitora le scadenze e non sprecare più cibo"
            gradient="from-orange-400 to-orange-600"
          />
          <Card 
            href="/login" 
            icon={<ChefHat className="w-8 h-8" />} 
            title="Ricette Suggerite" 
            description="Ricette personalizzate in base a ciò che hai"
            gradient="from-purple-400 to-purple-600"
          />
          <Card 
            href="/login" 
            icon={<Calendar className="w-8 h-8" />} 
            title="Calendario Scadenze" 
            description="Bollette, tasse e abbonamenti sempre sotto controllo"
            gradient="from-red-400 to-red-600"
          />
          <Card 
            href="/login" 
            icon={<Wifi className="w-8 h-8" />} 
            title="Hub IoT" 
            description="Controlla dispositivi smart in tempo reale"
            gradient="from-blue-400 to-blue-600"
          />
          <Card 
            href="/register" 
            icon={<Home className="w-8 h-8" />} 
            title="Multi-famiglia" 
            description="Condividi la gestione con tutta la famiglia"
            gradient="from-pink-400 to-pink-600"
          />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/80">
          <p className="text-sm">Sviluppato con ❤️ da Soli AI Agent</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

function Card({ href, icon, title, description, gradient }) {
  return (
    <Link href={href}>
      <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
        <div className={`bg-gradient-to-br ${gradient} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}
