import { Chess } from 'chess.js'
import { useMemo, useState } from 'react'
import { COLORS, COLOR_LABEL } from '../model/categories'
import { openingsFrom } from '../model/tree'
import type { Color, Opening } from '../model/types'
import { Board } from './Board'
import { OpeningPreview } from './OpeningPreview'

interface Props {
  openings: Opening[]
  onOpen: (openingId: string, nodeId: string) => void
}

/** 보드에서 양쪽 수를 직접 두면, 그 수순으로 이어지는 선택한 색의 오프닝이 미니 보드 카드로 나타난다. */
export function Explorer({ openings, onOpen }: Props) {
  const [color, setColor] = useState<Color>('white')
  const [sans, setSans] = useState<string[]>([])

  const fen = useMemo(() => {
    const chess = new Chess()
    for (const san of sans) chess.move(san)
    return chess.fen()
  }, [sans])
  const matches = openingsFrom(openings, color, sans)
  const side: Color = sans.length % 2 === 0 ? 'white' : 'black' // 지금 둘 차례
  const moves = [...new Set(matches.flatMap((m) => m.op.nodes[m.nodeId].children.map((c) => m.op.nodes[c].san)))]

  const onMove = (from: string, to: string) => {
    try {
      const { san } = new Chess(fen).move({ from, to, promotion: 'q' }) // ponytail: 승격은 항상 퀸
      setSans([...sans, san])
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <main>
        <div className="board-wrap">
          <Board fen={fen} orientation={color} onMove={onMove} />
        </div>
        <div className="row">
          {COLORS.map((c) => (
            <button key={c} className={color === c ? 'sel' : ''} onClick={() => setColor(c)}>
              {COLOR_LABEL[c]}
            </button>
          ))}
          <button disabled={sans.length === 0} onClick={() => setSans(sans.slice(0, -1))}>
            한 수 무르기
          </button>
          <button disabled={sans.length === 0} onClick={() => setSans([])}>
            처음으로
          </button>
        </div>
        <p className="pv">{sans.map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}.${s}` : s)).join(' ')}</p>
        <p className="dim">보드에서 백·흑 수를 번갈아 두면 그 수순으로 이어지는 오프닝만 남습니다.</p>
      </main>
      <aside className="right">
        <h2>가능한 오프닝 ({matches.length})</h2>
        {matches.length === 0 ? (
          <p className="dim">이 수순으로 이어지는 {COLOR_LABEL[color]} 오프닝이 라이브러리에 없습니다.</p>
        ) : (
          <div className="previews">
            {matches.map((m) => (
              <OpeningPreview
                key={`${m.op.id}:${sans.join(' ')}`}
                op={m.op}
                fromId={m.nodeId}
                orientation={color}
                onOpen={() => onOpen(m.op.id, m.nodeId)}
              />
            ))}
          </div>
        )}
        {moves.length > 0 && (
          <section className="panel next-moves">
            <h2>가능한 {COLOR_LABEL[side]}의 수</h2>
            <p className="pv">{moves.join('  ')}</p>
          </section>
        )}
      </aside>
    </>
  )
}
