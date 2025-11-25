export interface Candle {
  timestamp: number
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export type CandleTuple = [number, number, number, number, number, number]
