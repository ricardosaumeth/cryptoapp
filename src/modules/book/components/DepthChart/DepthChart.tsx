import { useState, useEffect, memo } from "react"
import * as Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import { useThrottle } from "../../../../core/hooks/useThrottle"
import Stale from "../../../../core/components/Stale"
import Loading from "../../../../core/components/Loading"
import { useRenderTracker } from "../../../../core/hooks/useRenderTracker"
import { Container } from "./DepthChart.styled"
import Palette from "../../../../theme/style"
import "../../../../theme/Highchart"

interface Depth {
  bids: { price: number; depth: number }[]
  asks: { price: number; depth: number }[]
}

export interface Props {
  depth: Depth
  isStale: boolean
}

const DepthChart = memo(
  ({ depth, isStale }: Props) => {
    useRenderTracker("Depth")
    const throttledDepth = useThrottle<Depth>(depth, 500)
    const [isLoading, setIsLoading] = useState(true)
    const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
      chart: {
        type: "area",
        animation: false,
        backgroundColor: Palette.BackgroundColor,
      },
      accessibility: {
        enabled: false,
      },
      title: {
        text: "",
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "bids",
          type: "area",
          data: [],
        },
        {
          name: "asks",
          type: "area",
          data: [],
        },
      ],
      xAxis: {
        labels: {
          autoRotation: [],
          style: {
            color: Palette.White,
            fontFamily: "FiraSans-MediumItalic",
          },
        },
      },
      yAxis: {
        title: {
          text: "",
        },
        labels: {
          enabled: false,
        },
      },
      plotOptions: {
        area: {
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
      },
    })

    useEffect(() => {
      const { bids, asks } = throttledDepth
      setIsLoading(bids.length === 0 && asks.length === 0)

      setChartOptions({
        xAxis: {
          categories: [...bids, ...asks].map((order) => order.price.toString()),
          labels: {
            step: 5,
            formatter: function () {
              return Number.parseFloat(this.value.toString()).toFixed(0)
            },
          },
        },
        series: [
          {
            name: "bids",
            type: "area",
            data: [...bids.map((bid) => bid.depth), ...asks.map(() => null)],
            color: Palette.Bid,
          },
          {
            name: "asks",
            type: "area",
            data: [...bids.map(() => null), ...asks.map((ask) => ask.depth)],
            color: Palette.Ask,
          },
        ],
      })
    }, [throttledDepth])

    return (
      <Container>
        {isStale && <Stale />}
        {isLoading && <Loading />}
        <HighchartsReact highcharts={Highcharts} options={chartOptions} constructorType={"chart"} />
      </Container>
    )
  },
  (prevProps, nextProps) => {
    if (prevProps.isStale !== nextProps.isStale) return false

    const prevDepth = prevProps.depth
    const nextDepth = nextProps.depth

    if (
      prevDepth.bids.length !== nextDepth.bids.length ||
      prevDepth.asks.length !== nextDepth.asks.length
    )
      return false

    // Compare first few bid/ask prices and depths for meaningful changes
    const compareCount = Math.min(5, prevDepth.bids.length, nextDepth.bids.length)
    for (let i = 0; i < compareCount; i++) {
      if (
        prevDepth.bids[i]?.price !== nextDepth.bids[i]?.price ||
        prevDepth.bids[i]?.depth !== nextDepth.bids[i]?.depth
      )
        return false
    }

    const askCompareCount = Math.min(5, prevDepth.asks.length, nextDepth.asks.length)
    for (let i = 0; i < askCompareCount; i++) {
      if (
        prevDepth.asks[i]?.price !== nextDepth.asks[i]?.price ||
        prevDepth.asks[i]?.depth !== nextDepth.asks[i]?.depth
      )
        return false
    }

    return true // Skip re-render
  }
)

export default DepthChart
