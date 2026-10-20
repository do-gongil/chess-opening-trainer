import { Chess } from 'chess.js'
import { useState } from 'react'
import { Board } from './components/Board'
import { CommentPanel } from './components/CommentPanel'
import { Drill } from './components/Drill'
import { EnginePanel } from './components/EnginePanel'
import { Explorer } from './components/Explorer'
import { MoveTree } from './components/MoveTree'
import { OpeningList } from './components/OpeningList'
import { useEngine } from './engine/useEngine'
import { useKeyNav } from './hooks/useKeyNav'
import { useI18n } from './i18n'
import { LANGS, type Lang } from './i18n/messages'
import { useLibrary } from './model/store'
import { addMove, START_FEN } from './model/tree'
import type { Opening } from './model/types'

type Mode = 'browse' | 'edit' | 'drill' | 'explore'
const MODES: Mode[] = ['explore', 'browse', 'edit', 'drill']

export default function App() {
  const { m, lang, setLang } = useI18n()
  const { lib, dispatch } = useLibrary()
  const [openingId, setOpeningId] = useState(lib.openings[0]?.id ?? '')
  const [nodeId, setNodeId] = useState('')
  const [mode, setMode] = useState<Mode>('browse')
  const [engineOn, setEngineOn] = useState(false)
  const [notice, setNotice] = useState('')

  // 삭제·초기화로 id가 사라지면 첫 오프닝 / 루트로 되돌아간다
  const op: Opening | undefined = lib.openings.find((o) => o.id === openingId) ?? lib.openings[0]
  const node = op ? (op.nodes[nodeId] ?? op.nodes[op.root]) : undefined
  const fen = node?.fen ?? START_FEN

  const go = (id: string) => {
    setNodeId(id)
    setNotice('')
  }
  const selectOpening = (id: string) => {
    setOpeningId(id)
    go(lib.openings.find((o) => o.id === id)?.root ?? '')
  }
  const update = (o: Opening) => dispatch({ type: 'update', opening: o })

  const ev = useEngine(fen, engineOn && mode !== 'drill' && mode !== 'explore')
  useKeyNav(mode === 'drill' || mode === 'explore' ? undefined : op, node?.id ?? '', go)

  const onMove = (from: string, to: string) => {
    if (!op || !node) return false
    let san: string
    try {
      san = new Chess(node.fen).move({ from, to, promotion: 'q' }).san // ponytail: 승격은 항상 퀸
    } catch {
      return false
    }
    const hit = node.children.find((c) => op.nodes[c].san === san)
    if (hit) {
      go(hit)
      return true
    }
    if (mode !== 'edit') {
      setNotice(m.notInTheory(san))
      return false
    }
    const r = addMove(op, node.id, san)
    update(r.opening)
    go(r.nodeId)
    return true
  }

  return (
    <div className="app">
      <header>
        <h1>{m.title}</h1>
        <nav className="tabs">
          {MODES.map((md) => (
            <button key={md} className={mode === md ? 'sel' : ''} onClick={() => setMode(md)}>
              {m.modes[md]}
            </button>
          ))}
        </nav>
        <select className="lang" aria-label={m.language} value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
          {LANGS.map(([l, label]) => (
            <option key={l} value={l}>
              {label}
            </option>
          ))}
        </select>
      </header>
      <aside className="left">
        <OpeningList
          selectedId={op?.id ?? ''}
          editing={mode === 'edit'}
          onSelect={(id) => {
            selectOpening(id)
            if (mode === 'explore') setMode('browse')
          }}
        />
      </aside>
      {mode === 'explore' ? (
        <Explorer
          openings={lib.openings}
          onOpen={(oid, nid) => {
            setOpeningId(oid)
            go(nid)
            setMode('browse')
          }}
        />
      ) : !op || !node ? (
        <main className="wide dim">{m.addOpeningHint}</main>
      ) : mode === 'drill' ? (
        <main className="wide">
          <Drill
            key={op.id}
            op={op}
            onReview={(id) => {
              setMode('browse')
              go(id)
            }}
          />
        </main>
      ) : (
        <>
          <main>
            <div className="board-wrap">
              <Board fen={fen} orientation={op.color} onMove={onMove} />
            </div>
            {notice && <p className="notice">{notice}</p>}
            <p className="dim">
              {m.navHint}
              {mode === 'edit' && m.editHint}
            </p>
          </main>
          <aside className="right">
            <MoveTree op={op} selected={node.id} onSelect={go} />
            <CommentPanel op={op} nodeId={node.id} editing={mode === 'edit'} onChange={update} onSelect={go} onSelectOpening={selectOpening} />
            <EnginePanel fen={fen} ev={ev} on={engineOn} setOn={setEngineOn} />
          </aside>
        </>
      )}
    </div>
  )
}
