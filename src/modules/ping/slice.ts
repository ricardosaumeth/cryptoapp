import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { connection } from "../redux/store"

interface PingState {
  latency: number | null
  pingTimestamps: number
}

const initialState: PingState = {
  latency: null,
  pingTimestamps: 0,
}

export const PING_INTERVAL_IN_MS = 5000

let pingInterval: NodeJS.Timeout | null = null
let currentCid = 0

// Why setInterval is needed
// - WebSocket connections need to stay alive: Many servers expect periodic
// “ping” messages from the client to confirm the connection is still open.
// If no ping is received, the server may assume the client is dead and close the connection.
// - Measure latency: By sending a ping at a fixed interval and recording the timestamp,
//  you can later measure the round‑trip time when the server replies with a “pong”.
// - Consistent scheduling: setInterval ensures that pings are sent every
// PING_INTERVAL_IN_MS milliseconds, without you having to manually trigger them.

export const startPing = createAsyncThunk("ping/startPing", async (_, { dispatch }) => {
  if (pingInterval) return null

  const initialTimestamp = Date.now()

  pingInterval = setInterval(() => {
    const pingTimestamp = Date.now()
    currentCid++

    connection.send(
      JSON.stringify({
        event: "ping",
        cid: currentCid,
      })
    )

    dispatch(
      pingSlice.actions.setPingTimestamp({
        cid: currentCid,
        timestamp: pingTimestamp,
      })
    )
  }, PING_INTERVAL_IN_MS)

  return initialTimestamp
})

export const stopPing = createAsyncThunk("ping/stopPing", async () => {
  if (pingInterval) {
    clearInterval(pingInterval)
    pingInterval = null
  }
  return null
})

export const pingSlice = createSlice({
  name: "ping",
  initialState: {
    ...initialState,
  },
  reducers: {
    setPingTimestamp: (state, action) => {
      const { timestamp } = action.payload
      state.pingTimestamps = timestamp
    },
    handlePong: (state) => {
      state.latency = Date.now() - state.pingTimestamps
    },
  },
})

export const { handlePong } = pingSlice.actions
export default pingSlice.reducer
