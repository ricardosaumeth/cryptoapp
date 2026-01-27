import { useMemo } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import Palette from "../../../theme/style"

interface Props {
  values: number[]
  width?: number
  height?: number
}

const LineChart = ({ values, width = 50, height = 25 }: Props) => {
  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        width,
        height,
        backgroundColor: "transparent",
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0],
        animation: false,
      },
      title: { text: "" },
      xAxis: {
        visible: false,
        lineWidth: 0,
        tickLength: 0,
      },
      yAxis: {
        visible: false,
        gridLineWidth: 0,
      },
      legend: { enabled: false },
      tooltip: { enabled: false },
      credits: { enabled: false },
      accessibility: { enabled: false },
      plotOptions: {
        line: {
          marker: { enabled: false },
          lineWidth: 1,
          color: Palette.LightGray,
          enableMouseTracking: false,
          animation: false,
          shadow: false,
        },
        series: {
          animation: false,
        },
      },
      series: [
        {
          data: values,
          animation: false,
          enableMouseTracking: false,
        },
      ],
    }),
    [values, width, height]
  )

  if (values.length === 0) {
    return <div></div>
  }

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} allowChartUpdate={false} />
}

export default LineChart
