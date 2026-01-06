import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage, RegisterPage } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/categories'
import Budgets from './pages/Budgets'
import Investments from './pages/Investments'
import Goals from './pages/Goals'
import Debts from './pages/Debts'
import Settings from './pages/settings'
import NotFound from './pages/404/notFound'
import PrivateRoute from './components/layout/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <PrivateRoute>
              <Budgets />
            </PrivateRoute>
          }
        />
        <Route
          path="/investments"
          element={
            <PrivateRoute>
              <Investments />
            </PrivateRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <Goals />
            </PrivateRoute>
          }
        />
        <Route
          path="/debts"
          element={
            <PrivateRoute>
              <Debts />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
