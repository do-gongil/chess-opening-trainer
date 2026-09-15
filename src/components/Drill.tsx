import { Chess } from 'chess.js'
import { useEffect, useState, type CSSProperties } from 'react'
import { pathTo } from '../model/tree'
import type { Opening } from '../model/types'
import { Board } from './Board'

const HINT: CSSProperties = { background: 'rgba(255, 170, 0, 0.6)' }

interface Props {
  op: Opening
  onReview: (nodeId: string) => void
}

/** 상대 차례는 무작위 변형으로 자동 착수, 내 차례는 이론 수(자식 중 아무거나) 맞히기. 리프까지 진행. */
export function Drill({ op, onReview }: Props) {
  const me = op.color === 'white' ? 'w' : 'b'
  const [cur, setCur] = useState(op.root)
  const [attempts, setAttempts] = useState(0)
  const [total, setTotal] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [missed, setMissed] = useState<string[]>([])
  const [styles, setStyles] = useState<Record<string, CSSProperties>>({})

  const node = op.nodes[cur]
  const done = node.children.length === 0
  const myTurn = !done && node.fen.split(' ')[1] === me

  useEffect(() => {
    if (done || myTurn) return
    const pick = node.children[Math.floor(Math.random() * node.children.length)]
    const t = setTimeout(() => setCur(pick), 400)
    return () => clearTimeout(t)
  }, [node, done, myTurn])

  const advance = (to: string, ok: boolean) => {
    setTotal((t) => t + 1)
    if (ok) setCorrect((c) => c + 1)
    else setMissed((m) => [...m, to])
    setAttempts(0)
    setStyles({})
    setCur(to)
  }

  const onMove = (from: string, to: string) => {
    if (!myTurn || attempts >= 2) return false
    let san: string
    try {
      san = new Chess(node.fen).move({ from, to, promotion: 'q' }).san // ponytail: 승격은 항상 퀸
    } catch {
      return false
    }
    const hit = node.children.find((c) => op.nodes[c].san === san)
    if (hit) {
      advance(hit, attempts === 0)
      return true
    }
    const main = node.children[0]
    const answer = new Chess(node.fen).move(op.nodes[main].san)
    if (attempts === 0) {
      setAttempts(1)
      setStyles({ [answer.from]: HINT })
    } else {
      setAttempts(2)
      setStyles({ [answer.from]: HINT, [answer.to]: HINT })
      setTimeout(() => advance(main, false), 800)
    }
    return false
  }

  const reset = () => {
    setCur(op.root)
    setAttempts(0)
    setTotal(0)
    setCorrect(0)
    setMissed([])
    setStyles({})
  }

  const played = pathTo(op, cur)
    .map((id) => op.nodes[id].san)
    .filter(Boolean)
    .join(' ')

  return (
    <div className="drill">
      <div className="board-wrap">
        <Board fen={node.fen} orientation={op.color} onMove={onMove} squareStyles={styles} />
      </div>
      <section className="panel">
        <h2>{op.name} 훈련</h2>
        <p className="pv">{played || '시작 국면'}</p>
        {done ? (
          <>
            <p>
              <b>정답 {correct} / {total}</b>
            </p>
            {missed.length > 0 && (
              <>
                <p className="dim">틀린 수 (클릭하면 탐색 모드로 이동)</p>
                <div className="row">
                  {missed.map((id) => (
                    <button key={id} onClick={() => onReview(id)}>
                      {op.nodes[id].san}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button onClick={reset}>다시</button>
          </>
        ) : (
          <p>{myTurn ? (attempts ? '틀렸습니다. 힌트 칸을 보고 다시 두세요.' : '당신 차례입니다. 이론 수를 두세요.') : '상대가 두는 중…'}</p>
        )}
      </section>
    </div>
  )
}
