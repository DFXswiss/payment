import { useThemeContext } from '@contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import React from 'react'
import { Text, TextProps } from '../Text'
import { ThemedProps } from './index'

type ThemedTextProps = TextProps & ThemedProps

export function ThemedText (props: ThemedTextProps): JSX.Element {
  // TODO: TypeError: _useThemeContext is undefined
  // const { isLight } = useThemeContext()
  const { isLight } = true

  const {
    style,
    light = tailwind('text-black'),
    dark = tailwind('text-white text-opacity-90'),
    ...otherProps
  } = props
  return (
    <Text
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
