import { Chess } from 'chess.js'
import { useEffect, useMemo, useState } from 'react'
import type { Eval } from '../engine/stockfish'
import { useI18n } from '../i18n'

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
  const [available, setAvailable] = useState(true)
  // 엔진 파일(public/engine/)은 GPLv3라 저장소에 없다. 없으면 Worker가 영원히 응답하지 않으므로 체크박스를 막는다.
  // dev 서버는 없는 파일에도 index.html을 200으로 돌려주므로 text/html 은 없는 것으로 본다.
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}engine/stockfish-18-lite-single.js`, { method: 'HEAD' })
      .then((r) => setAvailable(r.ok && !r.headers.get('content-type')?.includes('text/html')))
      .catch(() => setAvailable(false))
  }, [])
  const { m } = useI18n()
  const pv = useMemo(() => (ev ? toSan(fen, ev.pv) : []), [fen, ev])
  return (
    <section className="panel">
      <label>
        <input type="checkbox" checked={on && available} disabled={!available} onChange={(e) => setOn(e.target.checked)} /> {m.engineLabel}
      </label>
      {!available && <p className="dim">{m.engineMissing}</p>}
      {on && available &&
        (ev ? (
          <div>
            <b className="score">{score(ev)}</b> <small className="dim">{m.depth(ev.depth)}</small>
            <div className="pv">{pv.join(' ')}</div>
          </div>
        ) : (
          <p className="dim">{m.analyzing}</p>
        ))}
    </section>
  )
}
