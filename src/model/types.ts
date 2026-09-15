export type Color = 'white' | 'black'
export type Category = 'system' | 'opening' | 'attack' | 'defense' | 'counter'

export interface MoveNode {
  id: string
  parent: string | null // 루트만 null
  san: string // 루트는 ''
  fen: string // 이 수를 둔 후 국면. 루트는 초기 FEN
  comment: string
  children: string[] // children[0] = 메인 라인
}

export interface OpeningMeta {
  color: Color
  category: Category
  name: string
  description: string
  related?: string[] // 관련 오프닝 이름. 백 시스템·오프닝 ↔ 대응 디펜스·갬빗. 표시 시 양방향으로 합친다
}

export interface Opening extends OpeningMeta {
  id: string
  root: string
  nodes: Record<string, MoveNode>
}

export interface Library {
  version: 1
  openings: Opening[]
}
