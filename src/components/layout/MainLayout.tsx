import React from 'react'
import FloatingNavbar from './FloatingNavbar'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Floating Dock Navbar */}
      <FloatingNavbar />

      {/* Main content - with bottom padding for dock navbar */}
      <main className="min-h-screen px-4 lg:px-8 xl:px-16 pt-8 pb-28 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
