import type { JSX } from "react"
import { useSelector } from "react-redux"
import AnimatedContent from "./AnimatedContent"
import { getSelectedCurrencyPair } from "../../selection/selectors"

interface Props {
  children?: JSX.Element | string
}

const AnimatedContentContainer = ({ children }: Props) => {
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)

  return <AnimatedContent currencyPair={selectedCurrencyPair}>{children}</AnimatedContent>
}

export default AnimatedContentContainer
