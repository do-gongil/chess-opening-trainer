import { SEEDS } from '../data/seed'
import type { SeedText } from '../data/seed-i18n'
import { EN } from '../data/seed-i18n-en'
import { pathTo } from '../model/tree'
import type { Opening } from '../model/types'
import type { Lang } from './messages'

const TEXT: Record<Lang, Record<string, SeedText> | undefined> = { ko: undefined, en: EN }
const BY_NAME = new Map(SEEDS.map((s) => [s.name, s]))
const BY_DESC = new Map(SEEDS.map((s) => [s.description, s]))

// 저장소에는 한국어 시드가 그대로 들어 있다. 저장된 값이 시드 원문과 같을 때만 번역을 보여 주고,
// 사용자가 고친 값은 어떤 언어에서도 저장된 그대로 보여 준다.
const seedOf = (op: Opening) => BY_NAME.get(op.name) ?? BY_DESC.get(op.description)

export function openingName(op: Opening, lang: Lang): string {
  const s = seedOf(op)
  return (s && op.name === s.name && TEXT[lang]?.[s.name]?.name) || op.name
}

export function openingDescription(op: Opening, lang: Lang): string {
  const s = seedOf(op)
  return (s && op.description === s.description && TEXT[lang]?.[s.name]?.description) || op.description
}

export function moveComment(op: Opening, nodeId: string, lang: Lang): string {
  const comment = op.nodes[nodeId].comment
  const s = seedOf(op)
  if (!s || !TEXT[lang]) return comment
  const path = pathTo(op, nodeId)
    .map((id) => op.nodes[id].san)
    .filter(Boolean)
    .join(' ')
  return (s.comments?.[path] === comment && TEXT[lang][s.name]?.comments?.[path]) || comment
}
