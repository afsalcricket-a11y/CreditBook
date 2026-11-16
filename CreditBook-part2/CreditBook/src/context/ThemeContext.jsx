import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('cb-theme') || 'system')

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    }
    apply()
    localStorage.setItem('cb-theme', theme) // only the theme choice, never business data
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
