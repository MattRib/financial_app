import React from 'react'
import { MainLayout } from '../../components/layout'

const Settings: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500">Página em desenvolvimento</p>
        </div>
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-gray-400">Esta página será implementada em breve</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Settings

