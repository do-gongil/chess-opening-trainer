import { useEffect, type ReactNode } from 'react'
import type { MoveNode, Opening } from '../model/types'

interface Props {
  op: Opening
  selected: string
  onSelect: (id: string) => void
}

/** fen은 수를 둔 뒤 국면이므로 turn==='b'면 백이 방금 둔 수 */
function label(fen: string, san: string, lineStart: boolean) {
  const [, turn, , , , full] = fen.split(' ')
  if (turn === 'b') return `${full}. ${san}`
  return lineStart ? `${Number(full) - 1}... ${san}` : san
}

/** startId부터 메인 라인을 가로로 이어 붙이고, 갈림길마다 변형을 들여쓴 블록으로 끼워 넣는다 */
function Line({ op, startId, selected, onSelect }: Props & { startId: string }) {
  const items: ReactNode[] = []
  let lineStart = true
  let id: string | undefined = startId
  while (id) {
    const n: MoveNode = op.nodes[id]
    if (n.san) {
      const cur: string = id
      items.push(
        <button key={cur} className={'move' + (cur === selected ? ' sel' : '')} onClick={() => onSelect(cur)}>
          {label(n.fen, n.san, lineStart)}
        </button>,
      )
      lineStart = false
    }
    const alts: string[] = n.children.slice(1)
    if (alts.length) {
      items.push(
        <div className="vars" key={id + ':v'}>
          {alts.map((a) => (
            <div className="var" key={a}>
              <Line op={op} startId={a} selected={selected} onSelect={onSelect} />
            </div>
          ))}
        </div>,
      )
      lineStart = true
    }
    id = n.children[0]
  }
  return <>{items}</>
}

export function MoveTree(props: Props) {
  useEffect(() => {
    document.querySelector('.tree .move.sel')?.scrollIntoView({ block: 'nearest' })
  }, [props.selected])
  const empty = props.op.nodes[props.op.root].children.length === 0
  return (
    <section className="panel tree">
      {empty ? <p className="dim">아직 수가 없습니다. 편집 모드에서 보드에 수를 두면 추가됩니다.</p> : <Line {...props} startId={props.op.root} />}
    </section>
  )
}
