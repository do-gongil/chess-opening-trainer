import type { Category, Color } from './types'

export const COLORS: Color[] = ['white', 'black']
export const CATEGORIES: Record<Color, Category[]> = {
  white: ['system', 'opening', 'attack'],
  black: ['defense', 'system', 'counter'],
}
