import { type ICellRendererParams } from "ag-grid-community"
import Palette from "../../../../theme/style"
import React, { memo, useMemo } from "react"

// Pre-defined base styles
const containerStyle = { position: "relative" as const }
const backgroundBaseStyle = { height: "30px", position: "absolute" as const, zIndex: 0 }
const valueStyle = { position: "absolute" as const, zIndex: 1 }

const AmountRenderer = memo(({ value, styles }: { value: string; styles: React.CSSProperties }) => (
  <div style={containerStyle}>
    <div style={{ ...backgroundBaseStyle, ...styles }} />
    <div style={valueStyle}>{value}</div>
  </div>
))

export const bidAmountRenderer = (params: ICellRendererParams) => {
  const { valueFormatted } = params
  const { bidDepth: depth, maxDepth } = params.data
  const width = ((depth || 0) / maxDepth) * 100
  
  const bidStyles = useMemo(() => ({
    backgroundColor: Palette.BidTransparent,
    width: `${width}%`,
    left: "-12px",
  }), [width])
  
  return (
    <AmountRenderer
      value={valueFormatted as string}
      styles={bidStyles}
    />
  )
}

export const askAmountRenderer = (params: ICellRendererParams) => {
  const { valueFormatted } = params
  const { askDepth: depth, maxDepth } = params.data
  const width = ((depth || 0) / maxDepth) * 100
  
  const askStyles = useMemo(() => ({
    backgroundColor: Palette.AskTransparent,
    width: `${width}%`,
    right: "-12px",
  }), [width])
  
  return (
    <AmountRenderer
      value={valueFormatted as string}
      styles={askStyles}
    />
  )
}
