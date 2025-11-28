import { createSelector } from "reselect"
import { type RootState } from "../redux/store"

const getPing = (state: RootState) => state.ping

export const getLatency = createSelector(getPing, (ping) => ping.latency || 0)
