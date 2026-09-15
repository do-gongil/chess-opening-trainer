import type { Category, Color } from './types'

export const COLORS: Color[] = ['white', 'black']
export const CATEGORIES: Record<Color, Category[]> = {
  white: ['system', 'opening', 'attack'],
  black: ['defense', 'system', 'counter'],
}
export const COLOR_LABEL: Record<Color, string> = { white: '백', black: '흑' }
export const CATEGORY_LABEL: Record<Category, string> = {
  system: '시스템',
  opening: '오프닝',
  attack: '어택',
  defense: '디펜스',
  counter: '카운터',
}
