import { useState, useEffect } from "react"
import { Container } from "./Diagnostics.styled"

// ⚡ What this component does
// It’s a diagnostic tool that measures how responsive the browser’s event loop is.
// - Every 2 seconds, it schedules a timeout.
// - The difference between when it was scheduled and when it actually runs tells you how much the UI thread was blocked.
// - If your app is busy (e.g. heavy rendering, blocking JS), the delay will spike.
// So it’s essentially a UI latency monitor for your dashboard.

const DIAGNOSTICS_INTERVAL_MS = 2000

const Diagnostics = () => {
  const [delay, setDelay] = useState<number | undefined>()

  useEffect(() => {
    let timeoutId: number | undefined = undefined

    const intervalId = setInterval(() => {
      const time = Date.now()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        setDelay(Date.now() - time)
      })
    }, DIAGNOSTICS_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <Container>
      <span>UI Latency: </span>
      <span>{delay || "---"}ms</span>
    </Container>
  )
}

export default Diagnostics
