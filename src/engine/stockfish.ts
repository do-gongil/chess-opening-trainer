// Stockfish 18 lite (단일 스레드 WASM) Worker 래퍼. 파일은 public/engine/ 에 있고 js가 같은 폴더의 wasm을 찾는다.
// ponytail: multipv·시간 제한 없음. 필요하면 setoption MultiPV 추가.

export interface Eval {
  fen: string // 이 평가가 속한 국면
  depth: number
  cp?: number // 착수 측 기준 센티폰
  mate?: number // 착수 측 기준 메이트까지 수
  pv: string[] // UCI 좌표 표기 (e2e4)
}

export interface Engine {
  analyze(fen: string): void
  dispose(): void
}

const INFO = /^info .*\bdepth (\d+)\b.*\bscore (cp|mate) (-?\d+)\b.*\bpv (.+)$/

export function createEngine(onEval: (e: Eval) => void, depth = 18): Engine {
  const worker = new Worker(`${import.meta.env.BASE_URL}engine/stockfish-18-lite-single.js`)
  let ready = false
  let searching = false
  let pending: string | null = null
  let current = ''

  const start = (fen: string) => {
    current = fen
    searching = true
    worker.postMessage(`position fen ${fen}`)
    worker.postMessage(`go depth ${depth}`)
  }
  const drain = () => {
    if (!pending) return
    const fen = pending
    pending = null
    start(fen)
  }

  worker.onmessage = (e: MessageEvent) => {
    const line = String(e.data)
    if (line === 'uciok') worker.postMessage('isready')
    else if (line === 'readyok') {
      ready = true
      drain()
    } else if (line.startsWith('bestmove')) {
      searching = false
      drain()
    } else {
      const m = INFO.exec(line)
      if (!m || /\b(lower|upper)bound\b/.test(line)) return
      const score = Number(m[3])
      // stop 이후 bestmove 전까지 오는 info는 current(이전 fen)에 붙으므로 훅에서 fen 비교로 걸러진다.
      onEval({ fen: current, depth: Number(m[1]), ...(m[2] === 'cp' ? { cp: score } : { mate: score }), pv: m[4].split(' ') })
    }
  }
  worker.postMessage('uci')

  return {
    analyze(fen) {
      if (!ready || searching) {
        pending = fen
        if (searching) worker.postMessage('stop')
      } else start(fen)
    },
    dispose: () => worker.terminate(),
  }
}
