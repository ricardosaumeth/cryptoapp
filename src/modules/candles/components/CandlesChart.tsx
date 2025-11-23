import { useEffect, useState } from "react"
import { Container } from "./CandlesChart.styled"
import Highcharts from "highcharts/highstock"
import HighchartsReact from "highcharts-react-official"
import { type Candle } from "../types/Candle"
import { formatCurrencyPair } from "../../reference-data/utils"
import Palette from "../../../theme/style"
import "../../../theme/Highchart"

export interface Props {
  candles: Candle[]
  currencyPair: string
}

const CandlesChart = ({ candles, currencyPair }: Props) => {
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
    series: [
      {
        type: "candlestick",
        data: [],
      },
    ],
  })

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
        series: [
          {
            type: "candlestick",
            name: formatCurrencyPair(currencyPair),
            data: chartData,
          },
        ],
        plotOptions: {
          candlestick: {
            color: Palette.Ask,
            upColor: Palette.Bid,
          },
        },
      })
    }
  }, [candles, currencyPair])

  return (
    <Container>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        constructorType={"stockChart"}
      />
    </Container>
  )
}

export default CandlesChart
