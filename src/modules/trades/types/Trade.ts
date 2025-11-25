export interface Trade {
  id: number
  timestamp: number
  amount: number
  price: number
}

export type RawTrade = [number, number, number, number]
