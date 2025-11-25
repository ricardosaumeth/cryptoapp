import { useSelector } from "react-redux"
import DepthChart from "./DepthChart"
import { getDepth } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import type { RootState } from "../../../redux/store"
import { createSelector } from "@reduxjs/toolkit"
import { useMemo } from "react"

const DepthContainer = () => {
  const currencyPair = useSelector(getSelectedCurrencyPair)

  const emptyDepth = useMemo(() => ({ bids: [], asks: [] }), [])

  const selectDepth = createSelector(
    [(state: RootState) => state, (_: RootState, pair: string | undefined) => pair],
    (state, pair) => (pair ? getDepth(state)(pair) : emptyDepth)
  )

  const depth = useSelector((state: RootState) => selectDepth(state, currencyPair))

  return <DepthChart depth={depth} />
}

export default DepthContainer
