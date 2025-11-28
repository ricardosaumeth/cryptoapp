import { useSelector } from "react-redux"
import { getLatency } from "../../../ping/selectors"
import Latency from "./Latency"

const LatencyContainer = () => {
  const latency = useSelector(getLatency)
  return <Latency latency={latency} />
}

export default LatencyContainer
