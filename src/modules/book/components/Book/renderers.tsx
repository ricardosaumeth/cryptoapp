import { type ICellRendererParams } from "ag-grid-community"
import Palette from "../../../../theme/style"
import React from "react"

const amountRenderer = (value: string, styles: React.CSSProperties) => {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: "30px", position: "absolute", zIndex: 0, ...styles }} />
      <div style={{ position: "absolute", zIndex: 1 }}>{value}</div>
    </div>
  )
}

export const bidAmountRenderer = (params: ICellRendererParams) => {
  const { valueFormatted } = params
  const { bidDepth: depth, maxDepth } = params.data
  const width = ((depth || 0) / maxDepth) * 100
  return amountRenderer(valueFormatted as string, {
    backgroundColor: Palette.BidTransparent,
    width: `${width}%`,
    left: "-12px",
  })
}

export const askAmountRenderer = (params: ICellRendererParams) => {
  const { valueFormatted } = params
  const { askDepth: depth, maxDepth } = params.data
  const width = ((depth || 0) / maxDepth) * 100
  return amountRenderer(valueFormatted as string, {
    backgroundColor: Palette.AskTransparent,
    width: `${width}%`,
    right: "-12px",
  })
}
