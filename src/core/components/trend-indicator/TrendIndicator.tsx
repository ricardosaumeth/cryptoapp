import { Icon } from "./TrendIndicator.styled"

export interface Props {
  isPositive: boolean
}

const TrendIndicator = ({ isPositive }: Props) => {
  const icon = isPositive ? "arrow_upward" : "arrow_downward"
  return <Icon className="material-icons">{icon}</Icon>
}

export default TrendIndicator
