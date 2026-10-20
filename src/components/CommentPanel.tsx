import { useI18n } from '../i18n'
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
  const i18n = useI18n()
  const { m } = i18n
  const node = op.nodes[nodeId]
  const parent = node.parent ? op.nodes[node.parent] : null
  const isMain = !parent || parent.children[0] === nodeId

  if (!parent) {
    const rel = relatedOf(op, lib.openings)
    const opposite = rel.filter((o) => o.color !== op.color)
    const same = rel.filter((o) => o.color === op.color)
    const oppositeTitle = op.color === 'white' ? m.oppositeOfWhite : m.oppositeOfBlack
    const chips = (list: Opening[]) => (
      <div className="row">
        {list.map((o) => (
          <button key={o.id} className="chip" onClick={() => onSelectOpening(o.id)}>
            {m.color[o.color]} · {i18n.name(o)}
          </button>
        ))}
      </div>
    )
    return (
      <section className="panel">
        {editing ? (
          <>
            <input value={i18n.name(op)} onChange={(e) => onChange({ ...op, name: e.target.value })} />
            <textarea value={i18n.description(op)} placeholder={m.openingDescPlaceholder} onChange={(e) => onChange({ ...op, description: e.target.value })} />
            <input
              value={(op.related ?? []).join(', ')}
              placeholder={m.relatedPlaceholder}
              onChange={(e) => onChange({ ...op, related: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            />
          </>
        ) : (
          <>
            <h2>{i18n.name(op)}</h2>
            <p>{i18n.description(op) || <span className="dim">{m.noDescription}</span>}</p>
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
            <h3>{m.sameColorRelated}</h3>
            {chips(same)}
          </>
        )}
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>
        {node.san} <small className={isMain ? 'tag' : 'tag dim'}>{isMain ? m.mainTag : m.variationTag}</small>
      </h2>
      {editing ? (
        <textarea value={i18n.comment(op, nodeId)} placeholder={m.commentPlaceholder} onChange={(e) => onChange(setComment(op, nodeId, e.target.value))} />
      ) : (
        <p>{i18n.comment(op, nodeId) || <span className="dim">{m.noComment}</span>}</p>
      )}
      {editing && (
        <div className="row">
          {!isMain && <button onClick={() => onChange(promoteToMain(op, nodeId))}>{m.promote}</button>}
          <button
            onClick={() => {
              if (!confirm(m.confirmRemoveSubtree(node.san))) return
              onChange(deleteSubtree(op, nodeId))
              onSelect(parent.id)
            }}
          >
            {m.remove}
          </button>
        </div>
      )}
    </section>
  )
}
