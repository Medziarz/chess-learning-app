import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ThemeType = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light')

  // Load theme from localStorage on init
  useEffect(() => {
    const savedTheme = localStorage.getItem('chess-theme') as ThemeType
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Apply theme to document body and save to localStorage
  useEffect(() => {
    document.body.className = theme
    localStorage.setItem('chess-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}