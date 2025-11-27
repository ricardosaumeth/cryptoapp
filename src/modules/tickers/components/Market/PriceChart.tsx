import LineChart from "../../../../core/components/LineChart"
import { Container } from "./PriceChart.styled"

interface Props {
  value: number[]
}

const PriceChart = ({ value: prices }: Props) => {
  return (
    <Container>
      <LineChart values={prices} />
    </Container>
  )
}

export default PriceChart
