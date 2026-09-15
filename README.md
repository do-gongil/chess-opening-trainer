# 체스 오프닝 학습

백/흑 → 시스템·오프닝·어택 / 디펜스·시스템·카운터 → 오프닝 → 수 트리 구조로 이론 수와 변형을 학습하는 개인용 웹.

## 실행

```
npm install
npm run dev      # http://localhost:5173
npm test         # vitest (model 순수 함수 + 시드 합법성)
npm run build    # dist/ 정적 배포물
```

## Setup — 엔진 배치

엔진 분석 기능은 Stockfish 18 lite (단일 스레드 WASM) 를 쓰는데,
GPLv3 바이너리라 이 저장소에 포함하지 않았습니다. 직접 내려받아 배치하세요.

```
public/engine/stockfish-18-lite-single.js
public/engine/stockfish-18-lite-single.wasm
```

두 파일이 없어도 앱은 정상 동작합니다. 엔진 체크박스만 비활성 상태가 됩니다.

## 모드

- **탐색**: 오프닝 목록 → 수 트리 클릭 / ← → ↑ ↓ 키로 이동. 보드에서 이론 수를 두면 따라간다.
- **편집**: 보드에서 수를 두면 트리에 추가. 해설 입력, 메인으로 승격, 서브트리 삭제, 오프닝 추가/삭제. 내보내기/가져오기(JSON), 시드 초기화.
- **훈련**: 상대 수는 무작위 변형으로 자동, 내 차례에 이론 수 맞히기. 1차 오답은 출발 칸 힌트, 2차 오답은 정답 표시 후 진행.
- **엔진**: 체크박스로 Stockfish 18 lite(단일 스레드 WASM, `public/engine/`) 분석. 평가는 항상 백 기준.

## 데이터

- 저장: `localStorage['chess-study.library']`. 첫 실행 시 `src/data/seed.ts` 적재.
- 구조: `Library { version: 1, openings: Opening[] }`, `Opening { id, color, category, name, description, root, nodes }`, `MoveNode { id, parent, san, fen, comment, children }`. `children[0]`이 메인 라인.
- 시드 추가: `seed.ts`의 `lines`에 SAN 라인을 공백 구분 문자열로 넣는다. 첫 줄이 메인, 나머지는 공통 접두어에서 분기. 불법 수는 `npm test`에서 잡힌다.

## 의도적 단순화 (ponytail)

전위(transposition) 미지원 · 승격은 항상 퀸 · 드래그 착수만 · 간격 반복 없음 · 삭제 취소 없음(내보내기로 백업).

## 관련 오프닝 연결

오프닝 시작 국면(루트) 패널에 **대응하는 흑 디펜스·갬빗** / **맞서는 백 시스템·오프닝·갬빗** 칩이 표시된다. 시드의 `related` 배열(오프닝 이름)에서 오며 한쪽에만 적혀 있어도 양방향으로 보인다. 편집 모드에서 쉼표 구분으로 직접 수정할 수 있다. 시드 구성은 chess.com "Learn the Openings" 코스의 50개 레슨을 가족별로 묶은 것(백 18, 흑 24).

## Stack

`React 19` `TypeScript` `Vite` `Vitest` `chess.js` `react-chessboard` `oxlint`

## License

MIT — `LICENSE` 참조. `public/engine/` 의 Stockfish 는 별도 GPLv3 저작물이며 이 저장소에 포함되지 않습니다.
