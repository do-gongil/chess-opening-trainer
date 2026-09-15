import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { seedLibrary } from '../data/seed'
import type { Library, Opening } from './types'

export type Action =
  | { type: 'add'; opening: Opening }
  | { type: 'update'; opening: Opening }
  | { type: 'delete'; id: string }
  | { type: 'replace'; library: Library }

export function reducer(lib: Library, a: Action): Library {
  switch (a.type) {
    case 'add':
      return { ...lib, openings: [...lib.openings, a.opening] }
    case 'update':
      return { ...lib, openings: lib.openings.map((o) => (o.id === a.opening.id ? a.opening : o)) }
    case 'delete':
      return { ...lib, openings: lib.openings.filter((o) => o.id !== a.id) }
    case 'replace':
      return a.library
  }
}

const KEY = 'chess-study.library'

/** 외부 입력(localStorage, 가져온 파일) 경계 검증 */
export function isLibrary(x: unknown): x is Library {
  if (!x || typeof x !== 'object') return false
  const l = x as Partial<Library>
  if (l.version !== 1 || !Array.isArray(l.openings)) return false
  return l.openings.every(
    (o) =>
      o &&
      typeof o === 'object' &&
      typeof o.id === 'string' &&
      typeof o.name === 'string' &&
      (o.color === 'white' || o.color === 'black') &&
      typeof o.category === 'string' &&
      typeof o.root === 'string' &&
      o.nodes &&
      typeof o.nodes === 'object' &&
      o.root in o.nodes,
  )
}

export function loadLibrary(): Library {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isLibrary(parsed)) return parsed
    }
  } catch {
    /* 손상된 저장소 → 시드로 대체 */
  }
  return seedLibrary()
}

export function exportLibrary(lib: Library) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(lib, null, 2)], { type: 'application/json' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'chess-openings.json' })
  a.click()
  URL.revokeObjectURL(url)
}

export async function importLibrary(file: File): Promise<Library> {
  const parsed: unknown = JSON.parse(await file.text())
  if (!isLibrary(parsed)) throw new Error('형식이 맞지 않는 파일입니다')
  return parsed
}

const LibraryContext = createContext<{ lib: Library; dispatch: Dispatch<Action> } | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [lib, dispatch] = useReducer(reducer, undefined, loadLibrary)
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(lib)), [lib])
  return <LibraryContext.Provider value={{ lib, dispatch }}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('LibraryProvider 밖에서 useLibrary 호출')
  return ctx
}
