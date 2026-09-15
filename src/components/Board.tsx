import type { CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Color } from '../model/types'

interface Props {
  fen: string
  orientation: Color
  onMove?: (from: string, to: string) => boolean
  squareStyles?: Record<string, CSSProperties>
}

export function Board({ fen, orientation, onMove, squareStyles }: Props) {
  return (
    <Chessboard
      options={{
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
