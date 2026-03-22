'use client'
import Link from 'next/link'
import { ShoppingCart, Package, ChefHat, Calendar, Wifi, LogIn, Sparkles } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Lista della Spesa",
      description: "Organizza i tuoi acquisti con categorie intelligenti",
      href: "/login",
      gradient: "from-green-400 to-emerald-600",
      iconBg: "bg-green-500"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Dispensa Smart",
      description: "Monitora le scadenze e non sprecare cibo",
      href: "/login",
      gradient: "from-orange-400 to-red-500",
      iconBg: "bg-orange-500"
    },
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: "Ricette Suggerite",
      description: "Idee basate sui prodotti che hai in casa",
      href: "/login",
      gradient: "from-purple-400 to-pink-500",
      iconBg: "bg-purple-500"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Calendario Scadenze",
      description: "Non dimenticare mai più una bolletta",
      href: "/login",
      gradient: "from-blue-400 to-indigo-600",
      iconBg: "bg-blue-500"
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "Hub IoT",
      description: "Controlla i tuoi dispositivi smart in tempo reale",
      href: "/login",
      gradient: "from-cyan-400 to-blue-500",
      iconBg: "bg-cyan-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Casa Mia
            </span>
          </div>
          <Link 
            href="/login"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <LogIn className="w-5 h-5" />
            <span className="font-semibold">Accedi</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">La tua casa intelligente</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Gestisci la tua casa
            <br />
            in modo intelligente
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
            Tutto ciò che ti serve per organizzare spesa, dispensa, scadenze e dispositivi smart in un'unica app
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105 shadow-2xl hover:shadow-3xl text-lg"
            >
              Inizia Gratis
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-50 transition-all hover:scale-105 shadow-lg text-lg border-2 border-indigo-200"
            >
              Accedi
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
            >
              <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
              <div className="p-8">
                <div className={`${feature.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-600">
            © 2024 Casa Mia. Gestione domestica intelligente.
          </p>
        </div>
      </footer>
    </div>
  )
}
