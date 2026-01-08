import { useState, useEffect } from "react"
import { Container } from "./Diagnostics.styled"

// ✅ Fixed UI Responsiveness Monitor
// Measures actual UI thread blocking by tracking requestAnimationFrame delays
// More accurate than setTimeout which gets throttled by browser

const Diagnostics = () => {
  const [uiLatency, setUiLatency] = useState<number | undefined>()

  useEffect(() => {
    let lastFrameTime = performance.now()
    let frameCount = 0
    let totalLatency = 0

    const measureUIResponsiveness = () => {
      const currentTime = performance.now()
      const frameDelta = currentTime - lastFrameTime
      
      // Expected frame time at 60fps is ~16.67ms
      // Anything significantly higher indicates UI blocking
      if (frameDelta > 20) { // Allow some variance
        frameCount++
        totalLatency += frameDelta
        
        // Update average every 10 frames
        if (frameCount >= 10) {
          setUiLatency(totalLatency / frameCount)
          frameCount = 0
          totalLatency = 0
        }
      }
      
      lastFrameTime = currentTime
      requestAnimationFrame(measureUIResponsiveness)
    }

    measureUIResponsiveness()
  }, [])

  return (
    <Container>
      <span>UI Thread: </span>
      <span style={{ color: uiLatency && uiLatency > 50 ? '#ff6b6b' : '#4CAF50' }}>
        {uiLatency ? `${uiLatency.toFixed(1)}ms` : "Responsive"}
      </span>
      {uiLatency && uiLatency > 100 && (
        <span style={{ color: '#ff6b6b', fontSize: '10px', marginLeft: '4px' }}>
          ⚠️ Blocking
        </span>
      )}
    </Container>
  )
}

export default Diagnostics