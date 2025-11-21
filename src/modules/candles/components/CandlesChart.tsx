import { useEffect, useState } from "react"
import { Container } from "./CandlesChart.styled"
import Highcharts from "highcharts/highstock"
import HighchartsReact from "highcharts-react-official"
import { type Candle } from "../types/Candle"
import darkUnica from "highcharts/themes/dark-unica"

export interface Props {
  candles: Candle[]
}

const CandlesChart = ({ candles }: Props) => {
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
    series: [
      {
        type: "candlestick",
        data: [],
      },
    ],
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (candles && candles.length > 0) {
      const chartData = candles.map(({ timestamp, open, high, low, close }) => [
        timestamp,
        open,
        high,
        low,
        close,
      ])

      setChartOptions({
        rangeSelector: { enabled: true },
        navigator: { enabled: true },
        series: [
          {
            type: "candlestick",
            name: "Price",
            data: chartData,
          },
        ],
      })
    }
  }, [candles])

  useEffect(() => {
    import("highcharts/themes/dark-unica")
    setReady(true)
  }, [])

  return (
    <Container>
      {ready && (
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          constructorType={"stockChart"}
        />
      )}
    </Container>
  )
}

export default CandlesChart
