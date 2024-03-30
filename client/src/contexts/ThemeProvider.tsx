import { createContext, useContext, useEffect, useState } from "react"

type ThemeOptions = "dark" | "light" | "system"
type ThemeContextType = {
  theme: ThemeOptions
  setTheme: (theme: ThemeOptions) => void
  isDark: boolean
  toggleTheme: (theme: ThemeOptions) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function useThemeContext() {
  return useContext(ThemeContext)!
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeOptions>(getTheme("system"))

  const isDark = theme === "dark"

  const toggleTheme = (theme: ThemeOptions) => {
    setTheme(getTheme(theme))
  }

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")
    root.classList.add(getTheme(theme))

    const themeColor = theme === "dark" ? "black" : "white"
    const themeTextColor = theme === "dark" ? "white" : "black"
    document.body.className = `bg-${themeColor} text-${themeTextColor} h-screen`
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

function getTheme(themeOption: ThemeOptions) {
  switch (themeOption) {
    case "dark":
      return "dark"
    case "system":
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    default:
      return "light"
  }
}
