import { Chess } from 'chess.js'
import { useMemo } from 'react'
import type { Eval } from '../engine/stockfish'

interface Props {
  fen: string
  ev: Eval | null
  on: boolean
  setOn: (on: boolean) => void
}

function score(ev: Eval) {
  if (ev.mate !== undefined) return ev.mate > 0 ? `M${ev.mate}` : `-M${-ev.mate}`
  const v = (ev.cp ?? 0) / 100
  return (v > 0 ? '+' : '') + v.toFixed(2)
}

/** UCI 좌표 수열을 SAN으로. 첫 실패에서 멈춘다. */
function toSan(fen: string, pv: string[]) {
  const c = new Chess(fen)
  const out: string[] = []
  for (const m of pv.slice(0, 8)) {
    try {
      out.push(c.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] }).san)
    } catch {
      break
    }
  }
  return out
}

export function EnginePanel({ fen, ev, on, setOn }: Props) {
  const pv = useMemo(() => (ev ? toSan(fen, ev.pv) : []), [fen, ev])
  return (
    <section className="panel">
      <label>
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} /> 엔진 분석 (Stockfish 18 lite)
      </label>
      {on &&
        (ev ? (
          <div>
            <b className="score">{score(ev)}</b> <small className="dim">깊이 {ev.depth}</small>
            <div className="pv">{pv.join(' ')}</div>
          </div>
        ) : (
          <p className="dim">분석 중…</p>
        ))}
    </section>
  )
}
