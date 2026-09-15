import { useEffect, useRef, useState } from 'react'
import { createEngine, type Engine, type Eval } from './stockfish'

/** 현재 fen의 평가를 백 기준으로 돌려준다. enabled가 false면 Worker를 만들지 않는다(7MB 지연 로드). */
export function useEngine(fen: string, enabled: boolean): Eval | null {
  const [ev, setEv] = useState<Eval | null>(null)
  const ref = useRef<Engine | null>(null)

  useEffect(() => {
    if (!enabled) return
    const engine = createEngine(setEv)
    ref.current = engine
    return () => {
      engine.dispose()
      ref.current = null
      setEv(null)
    }
  }, [enabled])

  useEffect(() => {
    ref.current?.analyze(fen)
  }, [fen, enabled])

  if (!ev || ev.fen !== fen) return null
  const sign = fen.split(' ')[1] === 'b' ? -1 : 1
  return {
    ...ev,
    cp: ev.cp === undefined ? undefined : ev.cp * sign,
    mate: ev.mate === undefined ? undefined : ev.mate * sign,
  }
}
