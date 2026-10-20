import { Chess } from 'chess.js'
import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { COLORS } from '../model/categories'
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
  const { m } = useI18n()
  const [color, setColor] = useState<Color>('white')
  const [sans, setSans] = useState<string[]>([])

  const fen = useMemo(() => {
    const chess = new Chess()
    for (const san of sans) chess.move(san)
    return chess.fen()
  }, [sans])
  const matches = openingsFrom(openings, color, sans)
  const side: Color = sans.length % 2 === 0 ? 'white' : 'black' // 지금 둘 차례
  const moves = [...new Set(matches.flatMap((x) => x.op.nodes[x.nodeId].children.map((c) => x.op.nodes[c].san)))]

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
              {m.color[c]}
            </button>
          ))}
          <button disabled={sans.length === 0} onClick={() => setSans(sans.slice(0, -1))}>
            {m.undo}
          </button>
          <button disabled={sans.length === 0} onClick={() => setSans([])}>
            {m.toStart}
          </button>
        </div>
        <p className="pv">{sans.map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}.${s}` : s)).join(' ')}</p>
        <p className="dim">{m.explorerHint}</p>
      </main>
      <aside className="right">
        <h2>{m.possibleOpenings(matches.length)}</h2>
        {matches.length === 0 ? (
          <p className="dim">{m.noMatchingOpening(m.color[color])}</p>
        ) : (
          <div className="previews">
            {matches.map((x) => (
              <OpeningPreview
                key={`${x.op.id}:${sans.join(' ')}`}
                op={x.op}
                fromId={x.nodeId}
                orientation={color}
                onOpen={() => onOpen(x.op.id, x.nodeId)}
              />
            ))}
          </div>
        )}
        {moves.length > 0 && (
          <section className="panel next-moves">
            <h2>{m.possibleMoves(m.color[side])}</h2>
            <p className="pv">{moves.join('  ')}</p>
          </section>
        )}
      </aside>
    </>
  )
}
