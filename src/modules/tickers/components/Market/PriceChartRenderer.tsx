import React from "react"
import LineChart from "../../../../core/components/LineChart"
import { Container } from "./PriceChartRenderer.styled"

interface Props {
  value: number[]
}

const PriceChart = React.memo(
  ({ value: prices }: Props) => {
    // Don't render chart if no data or too few data points
    if (!prices || prices.length < 2) {
      return <Container />
    }

    return (
      <Container>
        <LineChart values={prices} />
      </Container>
    )
  },
  (prevProps, nextProps) => {
    if (!prevProps.value && !nextProps.value) return true
    if (!prevProps.value || !nextProps.value) return false
    if (prevProps.value.length !== nextProps.value.length) return false

    // Only compare last few values for performance
    const compareLength = Math.min(5, prevProps.value.length)
    for (let i = 0; i < compareLength; i++) {
      const prevIndex = prevProps.value.length - 1 - i
      const nextIndex = nextProps.value.length - 1 - i
      if (prevProps.value[prevIndex] !== nextProps.value[nextIndex]) {
        return false
      }
    }

    return true
  }
)

PriceChart.displayName = "PriceChart"

export default PriceChart
