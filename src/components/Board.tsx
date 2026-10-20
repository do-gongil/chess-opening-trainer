import { useId, type CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Color } from '../model/types'

interface Props {
  fen: string
  orientation: Color
  onMove?: (from: string, to: string) => boolean
  squareStyles?: Record<string, CSSProperties>
}

export function Board({ fen, orientation, onMove, squareStyles }: Props) {
  // 기본 id('chessboard')를 공유하면 react-chessboard가 첫 보드의 칸 폭으로 애니메이션 거리를 계산하므로, 보드마다 셀렉터에 안전한 고유 id를 준다.
  const id = `board${useId().replace(/\W/g, '')}`
  return (
    <Chessboard
      options={{
        id,
        position: fen,
        boardOrientation: orientation,
        allowDragging: !!onMove,
        onPieceDrop: ({ sourceSquare, targetSquare }) => !!targetSquare && !!onMove && onMove(sourceSquare, targetSquare),
        squareStyles,
        animationDurationInMs: 150,
      }}
    />
  )
}
