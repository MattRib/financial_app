import React from 'react'
import { MainLayout } from '../../components/layout'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'

const StatCard: React.FC<{
  title: string
  value: string
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  color: string
}> = ({ title, value, icon, trend, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-sm mt-1 flex items-center gap-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}% vs mês anterior
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Visão geral das suas finanças</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receitas do mês"
            value="R$ 8.500,00"
            icon={<TrendingUp size={24} className="text-green-600" />}
            color="bg-green-50"
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Despesas do mês"
            value="R$ 4.230,00"
            icon={<TrendingDown size={24} className="text-red-600" />}
            color="bg-red-50"
            trend={{ value: 8, positive: false }}
          />
          <StatCard
            title="Saldo atual"
            value="R$ 4.270,00"
            icon={<Wallet size={24} className="text-indigo-600" />}
            color="bg-indigo-50"
          />
          <StatCard
            title="Investimentos"
            value="R$ 15.000,00"
            icon={<PiggyBank size={24} className="text-amber-600" />}
            color="bg-amber-50"
            trend={{ value: 5, positive: true }}
          />
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por categoria</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-400">Gráfico será implementado aqui</p>
            </div>
          </div>

          {/* Recent transactions placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transações recentes</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-400">Lista de transações será implementada aqui</p>
            </div>
          </div>
        </div>

        {/* Budget alerts placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas de orçamento</h3>
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-400">Alertas de orçamento serão exibidos aqui</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard