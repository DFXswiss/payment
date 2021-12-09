import React, { createContext, useContext, useEffect, useState } from 'react'
import { ColorSchemeName } from 'react-native'

interface ThemeLoader {
  theme: NonNullable<ColorSchemeName>
  isThemeLoaded: boolean
}

export function useTheme (): ThemeLoader {
  return {
    isThemeLoaded: true,
    theme: 'dark'
  }
}

interface Theme {
  theme: NonNullable<ColorSchemeName>
  setTheme: (theme: NonNullable<ColorSchemeName>) => void
  isLight: boolean
}

const ThemeContext = createContext<Theme>(undefined as any)

export function useThemeContext (): Theme {
  return useContext(ThemeContext)
}

export function ThemeProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { theme } = useTheme()
  const [currentTheme, setTheme] = useState<NonNullable<ColorSchemeName>>(theme)

  useEffect(() => {
    setTheme(theme)
  }, [theme])

  const context: Theme = {
    theme: currentTheme,
    setTheme,
    isLight: currentTheme === 'light'
  }

  return (
    <ThemeContext.Provider value={context}>
      {props.children}
    </ThemeContext.Provider>
  )
}
