import { linesToOpening } from '../model/tree'
import type { Library, OpeningMeta } from '../model/types'
import { BLACK } from './seed-black'
import { WHITE } from './seed-white'

export interface Seed extends OpeningMeta {
  lines: string[] // 공백 구분 SAN. 첫 줄이 메인, 나머지는 공통 접두어에서 분기
  comments?: Record<string, string> // 키: 'd4 d5 Bf4' 형식의 수 경로
}

export const SEEDS: Seed[] = [...WHITE, ...BLACK]

export function seedLibrary(): Library {
  return {
    version: 1,
    openings: SEEDS.map(({ lines, comments, ...meta }) =>
      linesToOpening(meta, lines.map((l) => l.split(' ')), comments),
    ),
  }
}
