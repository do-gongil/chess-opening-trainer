import { COLOR_LABEL } from '../model/categories'
import { useLibrary } from '../model/store'
import { deleteSubtree, promoteToMain, setComment } from '../model/tree'
import type { Opening } from '../model/types'

interface Props {
  op: Opening
  nodeId: string
  editing: boolean
  onChange: (op: Opening) => void
  onSelect: (id: string) => void
  onSelectOpening: (id: string) => void
}

/** related는 한쪽에만 적혀 있어도 양방향으로 보이게 합친다 */
function relatedOf(op: Opening, all: Opening[]) {
  const mine = new Set(op.related ?? [])
  return all.filter((o) => o.id !== op.id && (mine.has(o.name) || (o.related ?? []).includes(op.name)))
}

export function CommentPanel({ op, nodeId, editing, onChange, onSelect, onSelectOpening }: Props) {
  const { lib } = useLibrary()
  const node = op.nodes[nodeId]
  const parent = node.parent ? op.nodes[node.parent] : null
  const isMain = !parent || parent.children[0] === nodeId

  if (!parent) {
    const rel = relatedOf(op, lib.openings)
    const opposite = rel.filter((o) => o.color !== op.color)
    const same = rel.filter((o) => o.color === op.color)
    const oppositeTitle = op.color === 'white' ? '대응하는 흑 디펜스·갬빗' : '맞서는 백 시스템·오프닝·갬빗'
    const chips = (list: Opening[]) => (
      <div className="row">
        {list.map((o) => (
          <button key={o.id} className="chip" onClick={() => onSelectOpening(o.id)}>
            {COLOR_LABEL[o.color]} · {o.name}
          </button>
        ))}
      </div>
    )
    return (
      <section className="panel">
        {editing ? (
          <>
            <input value={op.name} onChange={(e) => onChange({ ...op, name: e.target.value })} />
            <textarea value={op.description} placeholder="오프닝 설명" onChange={(e) => onChange({ ...op, description: e.target.value })} />
            <input
              value={(op.related ?? []).join(', ')}
              placeholder="관련 오프닝 이름 (쉼표 구분)"
              onChange={(e) => onChange({ ...op, related: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            />
          </>
        ) : (
          <>
            <h2>{op.name}</h2>
            <p>{op.description || <span className="dim">설명 없음</span>}</p>
          </>
        )}
        {opposite.length > 0 && (
          <>
            <h3>{oppositeTitle}</h3>
            {chips(opposite)}
          </>
        )}
        {same.length > 0 && (
          <>
            <h3>같은 색 관련 오프닝</h3>
            {chips(same)}
          </>
        )}
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>
        {node.san} <small className={isMain ? 'tag' : 'tag dim'}>{isMain ? '메인' : '변형'}</small>
      </h2>
      {editing ? (
        <textarea value={node.comment} placeholder="이 수에 대한 해설" onChange={(e) => onChange(setComment(op, nodeId, e.target.value))} />
      ) : (
        <p>{node.comment || <span className="dim">해설 없음</span>}</p>
      )}
      {editing && (
        <div className="row">
          {!isMain && <button onClick={() => onChange(promoteToMain(op, nodeId))}>메인으로</button>}
          <button
            onClick={() => {
              if (!confirm(`${node.san} 이하 변형을 모두 삭제할까요?`)) return
              onChange(deleteSubtree(op, nodeId))
              onSelect(parent.id)
            }}
          >
            삭제
          </button>
        </div>
      )}
    </section>
  )
}
