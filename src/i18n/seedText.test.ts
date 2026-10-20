import { describe, expect, it } from 'vitest'
import { SEEDS, seedLibrary } from '../data/seed'
import { EN } from '../data/seed-i18n-en'
import { findByPath, newOpening, setComment } from '../model/tree'
import { moveComment, openingDescription, openingName } from './seedText'

describe('en 시드 번역', () => {
  const text = EN
  it('모든 시드의 이름·설명·해설 키를 빠짐없이, 남는 것 없이 담는다', () => {
    expect(Object.keys(text).sort()).toEqual(SEEDS.map((s) => s.name).sort())
    for (const s of SEEDS) {
      const t = text[s.name]
      expect(t.name.trim(), s.name).not.toBe('')
      expect(t.description.trim(), s.name).not.toBe('')
      expect(Object.keys(t.comments ?? {}).sort(), s.name).toEqual(Object.keys(s.comments ?? {}).sort())
    }
  })

  it('번역된 오프닝 이름이 서로 겹치지 않는다', () => {
    const names = Object.values(text).map((t) => t.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('시드 텍스트 표시 규칙', () => {
  const seed = SEEDS[0]
  const commentPath = Object.keys(seed.comments!)[0]
  const op = seedLibrary().openings[0]
  const nodeId = findByPath(op, commentPath.split(' '))!

  it('ko는 저장된 값 그대로', () => {
    expect(openingName(op, 'ko')).toBe(seed.name)
    expect(moveComment(op, nodeId, 'ko')).toBe(seed.comments![commentPath])
  })

  it('손대지 않은 시드는 현재 언어 번역을 보여 준다', () => {
    expect(openingName(op, 'en')).toBe(EN[seed.name].name)
    expect(openingDescription(op, 'en')).toBe(EN[seed.name].description)
    expect(moveComment(op, nodeId, 'en')).toBe(EN[seed.name].comments![commentPath])
  })

  it('사용자가 고친 필드만 저장된 그대로 두고 나머지는 계속 번역한다', () => {
    const edited = setComment({ ...op, name: '내 런던' }, nodeId, '내 해설')
    expect(openingName(edited, 'en')).toBe('내 런던')
    expect(moveComment(edited, nodeId, 'en')).toBe('내 해설')
    expect(openingDescription(edited, 'en')).toBe(EN[seed.name].description)
  })

  it('사용자가 만든 오프닝은 어떤 언어에서도 그대로', () => {
    const mine = newOpening({ color: 'white', category: 'system', name: 'My line', description: 'mine' })
    expect(openingName(mine, 'en')).toBe('My line')
    expect(openingDescription(mine, 'en')).toBe('mine')
  })
})
