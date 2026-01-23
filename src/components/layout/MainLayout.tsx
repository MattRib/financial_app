import React from 'react'
import FloatingNavbar from './FloatingNavbar'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Dock Navbar */}
      <FloatingNavbar />

      {/* Main content - with bottom padding for dock navbar */}
      <main className="min-h-screen px-4 lg:px-8 pt-6 pb-24">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
