import { formatPrice, formatAmount, formatVolume, formatTime } from "../reference-data/utils"

export const priceFormatter = (params: { value: number }) => formatPrice(params.value)

export const amountFormatter = (params: { value: number }) => formatAmount(params.value)

export const volumeFormatter = (params: { value: number }) => formatVolume(params.value)

export const timeFormatter = (params: { value: number }) => formatTime(params.value)
