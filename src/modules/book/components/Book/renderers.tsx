import { type ICellRendererParams } from "ag-grid-community"
import Palette from "../../../../theme/style"
import React, { memo } from "react"

const AmountRenderer = memo(({ value, styles }: { value: string; styles: React.CSSProperties }) => (
  <div style={{ position: "relative" }}>
    <div style={{ height: "30px", position: "absolute", zIndex: 0, ...styles }} />
    <div style={{ position: "absolute", zIndex: 1 }}>{value}</div>
  </div>
))

export const bidAmountRenderer = (params: ICellRendererParams) => {
  const { valueFormatted } = params
  const { bidDepth: depth, maxDepth } = params.data
  const width = ((depth || 0) / maxDepth) * 100
  return (
    <AmountRenderer
      value={valueFormatted as string}
      styles={{
        backgroundColor: Palette.BidTransparent,
        width: `${width}%`,
        left: "-12px",
      }}
    />
  )
}

export const askAmountRenderer = (params: ICellRendererParams) => {
  const { valueFormatted } = params
  const { askDepth: depth, maxDepth } = params.data
  const width = ((depth || 0) / maxDepth) * 100
  return (
    <AmountRenderer
      value={valueFormatted as string}
      styles={{
        backgroundColor: Palette.AskTransparent,
        width: `${width}%`,
        right: "-12px",
      }}
    />
  )
}
