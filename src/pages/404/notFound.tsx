import React from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '../../components/layout'
import { Home } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Página não encontrada</h2>
        <p className="text-gray-500 mb-8">A página que você está procurando não existe.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Home size={20} />
          Voltar para o Dashboard
        </Link>
      </div>
    </MainLayout>
  )
}

export default NotFound

