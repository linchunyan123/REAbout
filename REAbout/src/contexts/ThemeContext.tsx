import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('focusboard.theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('focusboard.theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme: () => setTheme((value) => (value === 'light' ? 'dark' : 'light')) }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- colocated provider hook is the context's public API.
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
