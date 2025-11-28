import type { JSX } from "react"
import AnimatedCube from "../../../core/components/AnimatedCube"

export interface Props {
  currencyPair?: string
  children?: JSX.Element | string
}

const AnimatedContent = ({ currencyPair, children }: Props) => {
  return <AnimatedCube trigger={currencyPair}>{children}</AnimatedCube>
}

export default AnimatedContent
