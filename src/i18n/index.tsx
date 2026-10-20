import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Opening } from '../model/types'
import { MESSAGES, type Lang, type Messages } from './messages'
import { moveComment, openingDescription, openingName } from './seedText'

const KEY = 'chess-study.lang'
const isLang = (x: unknown): x is Lang => x === 'ko' || x === 'en'

function initialLang(): Lang {
  const saved = localStorage.getItem(KEY)
  if (isLang(saved)) return saved
  const browser = navigator.language.slice(0, 2)
  return isLang(browser) ? browser : 'en'
}

interface I18n {
  lang: Lang
  setLang: (lang: Lang) => void
  m: Messages
  /** 시드 오프닝의 이름·설명·해설은 현재 언어로, 사용자가 고친 값은 저장된 그대로 */
  name: (op: Opening) => string
  description: (op: Opening) => string
  comment: (op: Opening, nodeId: string) => string
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const m = MESSAGES[lang]
  useEffect(() => {
    localStorage.setItem(KEY, lang)
    document.documentElement.lang = lang
    document.title = m.title
  }, [lang, m])
  const value: I18n = {
    lang,
    setLang,
    m,
    name: (op) => openingName(op, lang),
    description: (op) => openingDescription(op, lang),
    comment: (op, nodeId) => moveComment(op, nodeId, lang),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('I18nProvider 밖에서 useI18n 호출')
  return ctx
}
