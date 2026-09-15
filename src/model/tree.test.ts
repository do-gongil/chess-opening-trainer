import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { seedLibrary } from '../data/seed'
import { addMove, deleteSubtree, linesToOpening, mainLine, pathTo, promoteToMain } from './tree'

const meta = { color: 'white', category: 'system', name: 't', description: '' } as const

describe('tree', () => {
  it('linesToOpening: 접두어 공유, 첫 라인이 메인, fen은 chess.js 재생과 일치', () => {
    const op = linesToOpening(meta, [['d4', 'd5', 'Bf4'], ['d4', 'Nf6', 'Bf4']], { 'd4 d5': 'hi' })
    const root = op.nodes[op.root]
    expect(root.children).toHaveLength(1)
    const d4 = op.nodes[root.children[0]]
    expect(d4.children.map((c) => op.nodes[c].san)).toEqual(['d5', 'Nf6'])
    expect(mainLine(op).map((c) => op.nodes[c].san)).toEqual(['d4', 'd5', 'Bf4'])
    expect(op.nodes[d4.children[0]].comment).toBe('hi')
    const leaf = mainLine(op).at(-1)!
    const c = new Chess()
    for (const san of ['d4', 'd5', 'Bf4']) c.move(san)
    expect(op.nodes[leaf].fen).toBe(c.fen())
    expect(Object.keys(op.nodes)).toHaveLength(6)
  })

  it('addMove: 같은 수 두 번이면 같은 id, 원본 불변, 불법 수는 throw', () => {
    const op0 = linesToOpening(meta, [])
    const a = addMove(op0, op0.root, 'e4')
    const b = addMove(a.opening, op0.root, 'e4')
    expect(b.nodeId).toBe(a.nodeId)
    expect(b.opening.nodes[op0.root].children).toHaveLength(1)
    expect(op0.nodes[op0.root].children).toHaveLength(0)
    expect(() => addMove(op0, op0.root, 'e5')).toThrow()
  })

  it('promoteToMain: 형제 순서 앞으로', () => {
    const op = linesToOpening(meta, [['d4'], ['e4'], ['c4']])
    const e4 = op.nodes[op.root].children[1]
    const p = promoteToMain(op, e4)
    expect(p.nodes[p.root].children.map((c) => p.nodes[c].san)).toEqual(['e4', 'd4', 'c4'])
  })

  it('deleteSubtree: 후손 전부 + 부모 children에서 제거, 루트는 불가', () => {
    const op = linesToOpening(meta, [['d4', 'd5', 'Bf4'], ['d4', 'Nf6']])
    const d4 = op.nodes[op.root].children[0]
    const d = deleteSubtree(op, d4)
    expect(Object.keys(d.nodes)).toEqual([d.root])
    expect(d.nodes[d.root].children).toEqual([])
    expect(deleteSubtree(op, op.root)).toBe(op)
  })

  it('pathTo: 루트..리프', () => {
    const op = linesToOpening(meta, [['d4', 'd5', 'Bf4']])
    const leaf = mainLine(op).at(-1)!
    expect(pathTo(op, leaf).map((c) => op.nodes[c].san)).toEqual(['', 'd4', 'd5', 'Bf4'])
  })

  it('시드 데이터가 전부 합법이고 메인 라인이 충분히 길다', () => {
    const lib = seedLibrary()
    expect(lib.openings.length).toBeGreaterThanOrEqual(8)
    for (const op of lib.openings) expect(mainLine(op).length, op.name).toBeGreaterThan(5)
  })

  it('시드의 related 이름이 전부 실제 오프닝을 가리키고, 이름은 중복되지 않는다', () => {
    const lib = seedLibrary()
    const names = new Set(lib.openings.map((o) => o.name))
    expect(names.size).toBe(lib.openings.length)
    for (const op of lib.openings)
      for (const r of op.related ?? []) expect(names.has(r), `${op.name} → ${r}`).toBe(true)
  })
})
