import { useEffect, useLayoutEffect } from 'react'
import { useThemeStore } from '../../store/themeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useThemeStore((s) => s.theme)
  const hasHydrated = useThemeStore((s) => s._hasHydrated)

  // Apply theme class immediately when theme changes
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Also apply on initial hydration
  useEffect(() => {
    if (hasHydrated) {
      const root = document.documentElement
      if (theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [hasHydrated, theme])

  return <>{children}</>
}
