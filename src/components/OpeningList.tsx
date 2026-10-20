import { useState, type ChangeEvent, type FormEvent } from 'react'
import { seedLibrary } from '../data/seed'
import { useI18n } from '../i18n'
import { CATEGORIES, COLORS } from '../model/categories'
import { exportLibrary, importLibrary, useLibrary } from '../model/store'
import { newOpening } from '../model/tree'
import type { Category, Color } from '../model/types'

interface Props {
  selectedId: string
  editing: boolean
  onSelect: (id: string) => void
}

export function OpeningList({ selectedId, editing, onSelect }: Props) {
  const { lib, dispatch } = useLibrary()
  const i18n = useI18n()
  const { m } = i18n
  const [color, setColor] = useState<Color>('white')

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    if (!name) return
    const op = newOpening({ color, category: f.get('category') as Category, name, description: String(f.get('description') ?? '') })
    dispatch({ type: 'add', opening: op })
    onSelect(op.id)
    e.currentTarget.reset()
  }

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const library = await importLibrary(file)
      if (!confirm(m.confirmImport(library.openings.length))) return
      dispatch({ type: 'replace', library })
      onSelect(library.openings[0]?.id ?? '')
    } catch {
      alert(m.badFile)
    }
  }

  return (
    <nav className="openings">
      {COLORS.map((c) => (
        <div key={c}>
          <h2>{m.color[c]}</h2>
          {CATEGORIES[c].map((cat) => {
            const items = lib.openings.filter((o) => o.color === c && o.category === cat)
            return (
              <div key={cat} className="cat">
                <h3>{m.category[cat]}</h3>
                {items.length === 0 && <p className="dim">{m.none}</p>}
                {items.map((o) => (
                  <div key={o.id} className={'opening' + (o.id === selectedId ? ' sel' : '')}>
                    <button onClick={() => onSelect(o.id)}>{i18n.name(o)}</button>
                    {editing && (
                      <button className="x" title={m.remove} onClick={() => confirm(m.confirmRemove(i18n.name(o))) && dispatch({ type: 'delete', id: o.id })}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      ))}
      {editing && (
        <form className="new" onSubmit={submit}>
          <h3>{m.newOpening}</h3>
          <select value={color} onChange={(e) => setColor(e.target.value as Color)}>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {m.color[c]}
              </option>
            ))}
          </select>
          <select name="category">
            {CATEGORIES[color].map((cat) => (
              <option key={cat} value={cat}>
                {m.category[cat]}
              </option>
            ))}
          </select>
          <input name="name" placeholder={m.namePlaceholder} required />
          <input name="description" placeholder={m.descPlaceholder} />
          <button type="submit">{m.add}</button>
        </form>
      )}
      <div className="tools">
        <button onClick={() => exportLibrary(lib)}>{m.exportData}</button>
        <label className="btn">
          {m.importData}
          <input type="file" accept=".json,application/json" onChange={onImport} hidden />
        </label>
        <button onClick={() => confirm(m.confirmReset) && dispatch({ type: 'replace', library: seedLibrary() })}>
          {m.reset}
        </button>
      </div>
    </nav>
  )
}
