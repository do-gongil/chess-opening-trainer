import { Chess } from 'chess.js'
import type { MoveNode, Opening, OpeningMeta } from './types'

// 모든 함수는 순수: 입력을 바꾸지 않고 새 Opening을 반환한다.
// ponytail: 전위(transposition) 미지원. 같은 국면이 다른 경로로 나오면 별도 노드. 필요해지면 fen→id 인덱스 추가.

export const START_FEN = new Chess().fen()
const uid = () => crypto.randomUUID()

export function newOpening(meta: OpeningMeta): Opening {
  const root: MoveNode = { id: uid(), parent: null, san: '', fen: START_FEN, comment: '', children: [] }
  return { id: uid(), ...meta, root: root.id, nodes: { [root.id]: root } }
}

/** parentId 아래에 SAN 수를 추가. 같은 수가 이미 있으면 그 id를 돌려준다. 불법 수면 throw. */
export function addMove(op: Opening, parentId: string, san: string): { opening: Opening; nodeId: string } {
  const parent = op.nodes[parentId]
  const chess = new Chess(parent.fen)
  const mv = chess.move(san)
  const existing = parent.children.find((id) => op.nodes[id].san === mv.san)
  if (existing) return { opening: op, nodeId: existing }
  const node: MoveNode = { id: uid(), parent: parentId, san: mv.san, fen: chess.fen(), comment: '', children: [] }
  return {
    opening: {
      ...op,
      nodes: { ...op.nodes, [node.id]: node, [parentId]: { ...parent, children: [...parent.children, node.id] } },
    },
    nodeId: node.id,
  }
}

export function setComment(op: Opening, id: string, comment: string): Opening {
  return { ...op, nodes: { ...op.nodes, [id]: { ...op.nodes[id], comment } } }
}

export function promoteToMain(op: Opening, id: string): Opening {
  const parentId = op.nodes[id].parent
  if (!parentId) return op
  const parent = op.nodes[parentId]
  return {
    ...op,
    nodes: { ...op.nodes, [parentId]: { ...parent, children: [id, ...parent.children.filter((c) => c !== id)] } },
  }
}

export function deleteSubtree(op: Opening, id: string): Opening {
  const parentId = op.nodes[id].parent
  if (!parentId) return op // 루트는 삭제 불가
  const doomed = new Set<string>()
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()!
    doomed.add(cur)
    stack.push(...op.nodes[cur].children)
  }
  const nodes = Object.fromEntries(Object.entries(op.nodes).filter(([k]) => !doomed.has(k)))
  const parent = op.nodes[parentId]
  nodes[parentId] = { ...parent, children: parent.children.filter((c) => c !== id) }
  return { ...op, nodes }
}

/** 루트부터 id까지의 노드 id 배열 */
export function pathTo(op: Opening, id: string): string[] {
  const path: string[] = []
  for (let cur: string | null = id; cur; cur = op.nodes[cur].parent) path.push(cur)
  return path.reverse()
}

/** fromId 이후 메인 라인(children[0] 연쇄)의 노드 id 배열 */
export function mainLine(op: Opening, fromId = op.root): string[] {
  const out: string[] = []
  for (let cur = op.nodes[fromId].children[0]; cur; cur = op.nodes[cur].children[0]) out.push(cur)
  return out
}

/** SAN 경로(['d4','d5','Bf4'])로 노드를 찾는다. 없으면 undefined */
export function findByPath(op: Opening, sans: string[]): string | undefined {
  let cur: string | undefined = op.root
  for (const san of sans) {
    cur = op.nodes[cur!].children.find((c) => op.nodes[c].san === san)
    if (!cur) return undefined
  }
  return cur
}

/** SAN 라인 배열로 오프닝을 만든다. 첫 라인이 메인, 공통 접두어는 공유. comments 키는 'd4 d5 Bf4' 형식. */
export function linesToOpening(meta: OpeningMeta, lines: string[][], comments: Record<string, string> = {}): Opening {
  let op = newOpening(meta)
  for (const line of lines) {
    let cur = op.root
    for (const san of line) {
      const r = addMove(op, cur, san)
      op = r.opening
      cur = r.nodeId
    }
  }
  for (const [key, comment] of Object.entries(comments)) {
    const id = findByPath(op, key ? key.split(' ') : [])
    if (!id) throw new Error(`comment path not found: ${meta.name} / ${key}`)
    op = setComment(op, id, comment)
  }
  return op
}
