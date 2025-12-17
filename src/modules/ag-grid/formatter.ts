import { formatPrice, formatAmount, formatVolume, formatTime } from "../reference-data/utils"

export const priceFormatter = (params: { value: number }) => {
  if (!params || params.value == null || isNaN(params.value)) return "0.00"
  return formatPrice(params.value)
}

export const amountFormatter = (params: { value: number }) => {
  if (!params || params.value == null || isNaN(params.value)) return "0.00"
  return formatAmount(params.value)
}

export const volumeFormatter = (params: { value: number }) => {
  if (!params || params.value == null || isNaN(params.value)) return "0.00"
  return formatVolume(params.value)
}

export const timeFormatter = (params: { value: number }) => {
  if (!params || params.value == null || isNaN(params.value)) return "0.00"
  return formatTime(params.value)
}
