import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { mainLine } from '../model/tree'
import type { Color, Opening } from '../model/types'
import { Board } from './Board'

const TICK_MS = 900
const HOLD_TICKS = 2 // 마지막 국면에서 더 머무는 틱 수

interface Props {
  op: Opening
  fromId: string // 뒤에 이어지는 수가 있는 노드(openingsFrom 결과)
  orientation: Color
  onOpen: () => void
}

/** fromId 국면에서 시작해 메인 라인을 반복 재생하는 미니 보드 카드. 수순이 바뀌면 부모가 key로 0부터 다시 시작시킨다. */
export function OpeningPreview({ op, fromId, orientation, onOpen }: Props) {
  const i18n = useI18n()
  const ids = [fromId, ...mainLine(op, fromId)]
  const last = ids.length - 1
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s >= last + HOLD_TICKS ? 0 : s + 1)), TICK_MS)
    return () => clearInterval(t)
  }, [last])

  const shown = ids[Math.min(step, last)]
  return (
    <button className="preview" onClick={onOpen}>
      <strong>{i18n.name(op)}</strong>
      <span className="dim">{op.nodes[ids[1]].san}</span>
      <Board fen={op.nodes[shown].fen} orientation={orientation} />
      <span className="pv">{step >= 1 ? op.nodes[shown].san : ''}</span>
    </button>
  )
}
