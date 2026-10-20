import type { Category, Color } from '../model/types'

export type Lang = 'ko' | 'en'
export const LANGS: [Lang, string][] = [
  ['ko', '한국어'],
  ['en', 'English'],
]

const ko = {
  title: '체스 오프닝 학습',
  language: '언어',
  modes: { explore: '오프닝', browse: '탐색', edit: '편집', drill: '훈련' },
  color: { white: '백', black: '흑' } satisfies Record<Color, string>,
  category: { system: '시스템', opening: '오프닝', attack: '어택', defense: '디펜스', counter: '카운터' } satisfies Record<Category, string>,

  addOpeningHint: '편집 모드에서 오프닝을 추가하세요.',
  notInTheory: (san: string) => `${san}은(는) 이론에 없는 수입니다. 편집 모드에서 추가할 수 있습니다.`,
  navHint: '← → 메인 라인 이동, ↑ ↓ 변형 전환',
  editHint: ' · 보드에서 수를 두면 트리에 추가됩니다',

  none: '없음',
  remove: '삭제',
  newOpening: '새 오프닝',
  namePlaceholder: '이름',
  descPlaceholder: '설명',
  add: '추가',
  exportData: '내보내기',
  importData: '가져오기',
  reset: '초기화',
  badFile: '형식이 맞지 않는 파일입니다',
  confirmImport: (n: number) => `오프닝 ${n}개로 현재 데이터를 덮어씁니다. 계속할까요?`,
  confirmRemove: (name: string) => `'${name}'을(를) 삭제할까요?`,
  confirmReset: '모든 데이터를 시드로 초기화합니다. 계속할까요?',

  oppositeOfWhite: '대응하는 흑 디펜스·갬빗',
  oppositeOfBlack: '맞서는 백 시스템·오프닝·갬빗',
  sameColorRelated: '같은 색 관련 오프닝',
  openingDescPlaceholder: '오프닝 설명',
  relatedPlaceholder: '관련 오프닝 이름 (쉼표 구분)',
  noDescription: '설명 없음',
  mainTag: '메인',
  variationTag: '변형',
  commentPlaceholder: '이 수에 대한 해설',
  noComment: '해설 없음',
  promote: '메인으로',
  confirmRemoveSubtree: (san: string) => `${san} 이하 변형을 모두 삭제할까요?`,

  emptyTree: '아직 수가 없습니다. 편집 모드에서 보드에 수를 두면 추가됩니다.',

  engineLabel: '엔진 분석 (Stockfish 18 lite)',
  depth: (d: number) => `깊이 ${d}`,
  analyzing: '분석 중…',

  drillTitle: (name: string) => `${name} 훈련`,
  startPosition: '시작 국면',
  score: (correct: number, total: number) => `정답 ${correct} / ${total}`,
  missedTitle: '틀린 수 (클릭하면 탐색 모드로 이동)',
  again: '다시',
  wrongTryAgain: '틀렸습니다. 힌트 칸을 보고 다시 두세요.',
  yourTurn: '당신 차례입니다. 이론 수를 두세요.',
  opponentThinking: '상대가 두는 중…',

  possibleOpenings: (n: number) => `가능한 오프닝 (${n})`,
  noMatchingOpening: (color: string) => `이 수순으로 이어지는 ${color} 오프닝이 라이브러리에 없습니다.`,
  possibleMoves: (side: string) => `가능한 ${side}의 수`,
  undo: '한 수 무르기',
  toStart: '처음으로',
  explorerHint: '보드에서 백·흑 수를 번갈아 두면 그 수순으로 이어지는 오프닝만 남습니다.',
}

export type Messages = typeof ko

const en: Messages = {
  title: 'Chess Opening Trainer',
  language: 'Language',
  modes: { explore: 'Openings', browse: 'Browse', edit: 'Edit', drill: 'Drill' },
  color: { white: 'White', black: 'Black' },
  category: { system: 'Systems', opening: 'Openings', attack: 'Attacks', defense: 'Defenses', counter: 'Counters' },

  addOpeningHint: 'Add an opening in Edit mode.',
  notInTheory: (san) => `${san} is not in the theory. You can add it in Edit mode.`,
  navHint: '← → move along the main line, ↑ ↓ switch variations',
  editHint: ' · play a move on the board to add it to the tree',

  none: 'None',
  remove: 'Delete',
  newOpening: 'New opening',
  namePlaceholder: 'Name',
  descPlaceholder: 'Description',
  add: 'Add',
  exportData: 'Export',
  importData: 'Import',
  reset: 'Reset',
  badFile: 'The file format is not valid',
  confirmImport: (n) => `This overwrites the current data with ${n} openings. Continue?`,
  confirmRemove: (name) => `Delete '${name}'?`,
  confirmReset: 'This resets all data to the seed. Continue?',

  oppositeOfWhite: 'Black defenses and gambits against it',
  oppositeOfBlack: 'White systems, openings and gambits against it',
  sameColorRelated: 'Related openings of the same color',
  openingDescPlaceholder: 'Opening description',
  relatedPlaceholder: 'Related opening names (comma-separated)',
  noDescription: 'No description',
  mainTag: 'Main',
  variationTag: 'Variation',
  commentPlaceholder: 'Comment on this move',
  noComment: 'No comment',
  promote: 'Make main',
  confirmRemoveSubtree: (san) => `Delete ${san} and all variations below it?`,

  emptyTree: 'No moves yet. Play a move on the board in Edit mode to add one.',

  engineLabel: 'Engine analysis (Stockfish 18 lite)',
  depth: (d) => `depth ${d}`,
  analyzing: 'Analyzing…',

  drillTitle: (name) => `${name} drill`,
  startPosition: 'Start position',
  score: (correct, total) => `Correct ${correct} / ${total}`,
  missedTitle: 'Missed moves (click to review in Browse mode)',
  again: 'Again',
  wrongTryAgain: 'Wrong. Look at the highlighted square and try again.',
  yourTurn: 'Your turn. Play the theory move.',
  opponentThinking: 'Opponent is moving…',

  possibleOpenings: (n) => `Possible openings (${n})`,
  noMatchingOpening: (color) => `No ${color} opening in the library follows this move order.`,
  possibleMoves: (side) => `Possible ${side} moves`,
  undo: 'Undo move',
  toStart: 'Start over',
  explorerHint: 'Play White and Black moves alternately on the board; only openings that follow that move order remain.',
}

export const MESSAGES: Record<Lang, Messages> = { ko, en }
