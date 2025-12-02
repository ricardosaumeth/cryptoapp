import { formatPrice, formatAmount, formatVolume, formatTime } from "../reference-data/utils"

export const priceFormatter = (params: { value: number }) => {
  if (params?.value == null) return "-"
  return formatPrice(params.value)
}

export const amountFormatter = (params: { value: number }) => {
  if (params?.value == null) return "-"
  return formatAmount(params.value)
}

export const volumeFormatter = (params: { value: number }) => {
  if (params?.value == null) return "-"
  return formatVolume(params.value)
}

export const timeFormatter = (params: { value: number }) => {
  if (params?.value == null) return "-"
  return formatTime(params.value)
}
