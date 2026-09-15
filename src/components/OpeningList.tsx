import { useState, type ChangeEvent, type FormEvent } from 'react'
import { seedLibrary } from '../data/seed'
import { CATEGORIES, CATEGORY_LABEL, COLORS, COLOR_LABEL } from '../model/categories'
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
      if (!confirm(`오프닝 ${library.openings.length}개로 현재 데이터를 덮어씁니다. 계속할까요?`)) return
      dispatch({ type: 'replace', library })
      onSelect(library.openings[0]?.id ?? '')
    } catch (err) {
      alert(err instanceof Error ? err.message : '가져오기 실패')
    }
  }

  return (
    <nav className="openings">
      {COLORS.map((c) => (
        <div key={c}>
          <h2>{COLOR_LABEL[c]}</h2>
          {CATEGORIES[c].map((cat) => {
            const items = lib.openings.filter((o) => o.color === c && o.category === cat)
            return (
              <div key={cat} className="cat">
                <h3>{CATEGORY_LABEL[cat]}</h3>
                {items.length === 0 && <p className="dim">없음</p>}
                {items.map((o) => (
                  <div key={o.id} className={'opening' + (o.id === selectedId ? ' sel' : '')}>
                    <button onClick={() => onSelect(o.id)}>{o.name}</button>
                    {editing && (
                      <button className="x" title="삭제" onClick={() => confirm(`'${o.name}'을(를) 삭제할까요?`) && dispatch({ type: 'delete', id: o.id })}>
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
          <h3>새 오프닝</h3>
          <select value={color} onChange={(e) => setColor(e.target.value as Color)}>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {COLOR_LABEL[c]}
              </option>
            ))}
          </select>
          <select name="category">
            {CATEGORIES[color].map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABEL[cat]}
              </option>
            ))}
          </select>
          <input name="name" placeholder="이름" required />
          <input name="description" placeholder="설명" />
          <button type="submit">추가</button>
        </form>
      )}
      <div className="tools">
        <button onClick={() => exportLibrary(lib)}>내보내기</button>
        <label className="btn">
          가져오기
          <input type="file" accept=".json,application/json" onChange={onImport} hidden />
        </label>
        <button onClick={() => confirm('모든 데이터를 시드로 초기화합니다. 계속할까요?') && dispatch({ type: 'replace', library: seedLibrary() })}>
          초기화
        </button>
      </div>
    </nav>
  )
}
