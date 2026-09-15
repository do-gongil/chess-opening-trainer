import { useEffect } from 'react'
import type { Opening } from '../model/types'

/** ← 부모, → 메인 자식, ↑↓ 형제 변형. op이 없으면 비활성. 입력 요소에 포커스가 있으면 무시. */
export function useKeyNav(op: Opening | undefined, nodeId: string, go: (id: string) => void) {
  useEffect(() => {
    if (!op || !op.nodes[nodeId]) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const n = op.nodes[nodeId]
      let next: string | undefined
      if (e.key === 'ArrowRight') next = n.children[0]
      else if (e.key === 'ArrowLeft') next = n.parent ?? undefined
      else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && n.parent) {
        const sib = op.nodes[n.parent].children
        const i = sib.indexOf(nodeId)
        next = sib[(i + (e.key === 'ArrowDown' ? 1 : sib.length - 1)) % sib.length]
      } else return
      e.preventDefault()
      if (next && next !== nodeId) go(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [op, nodeId, go])
}
