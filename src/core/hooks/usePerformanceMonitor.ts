import { useState, useEffect } from "react"
import { performanceTracker } from "../../services/performanceTracker"
import { ChannelTypeEnum } from "../../types/avro-types"

enum ConnectionHealth {
  GOOD = "good",
  WARNING = "warning",
  POOR = "poor",
}
type ConnectionHealthTypes = `${ConnectionHealth}`

interface DataLatencies {
  trades: number
  tickers: number
  orderBook: number
  candles: number
}

interface PerformanceMetrics {
  fps: number
  memory: number
  dataLatencies: DataLatencies
  connectionHealth: ConnectionHealthTypes
}

export const usePerformanceMonitor = (): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    dataLatencies: {
      trades: 0,
      tickers: 0,
      orderBook: 0,
      candles: 0,
    },
    connectionHealth: ConnectionHealth.GOOD,
  })

  useEffect(() => {
    // Subscribe to latency updates from WebSocket handlers
    performanceTracker.subscribe(ChannelTypeEnum.TRADES, (latency) => {
      setMetrics((prev) => {
        const newMetrics = {
          ...prev,
          dataLatencies: { ...prev.dataLatencies, trades: latency },
        }
        return { ...newMetrics, connectionHealth: calculateConnectionHealth(newMetrics) }
      })
    })

    performanceTracker.subscribe(ChannelTypeEnum.TICKER, (latency) => {
      setMetrics((prev) => {
        const newMetrics = {
          ...prev,
          dataLatencies: { ...prev.dataLatencies, tickers: latency },
        }
        return { ...newMetrics, connectionHealth: calculateConnectionHealth(newMetrics) }
      })
    })

    performanceTracker.subscribe(ChannelTypeEnum.BOOK, (latency) => {
      setMetrics((prev) => {
        const newMetrics = {
          ...prev,
          dataLatencies: { ...prev.dataLatencies, orderBook: latency },
        }
        return { ...newMetrics, connectionHealth: calculateConnectionHealth(newMetrics) }
      })
    })

    performanceTracker.subscribe(ChannelTypeEnum.CANDLES, (latency) => {
      setMetrics((prev) => {
        const newMetrics = {
          ...prev,
          dataLatencies: { ...prev.dataLatencies, candles: latency },
        }
        return { ...newMetrics, connectionHealth: calculateConnectionHealth(newMetrics) }
      })
    })

    // FPS monitoring
    let frameCount = 0
    let lastTime = performance.now()

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        const currentFPS = frameCount // Capture value before reset

        setMetrics((prev) => {
          const newMetrics = { ...prev, fps: currentFPS }
          return { ...newMetrics, connectionHealth: calculateConnectionHealth(newMetrics) }
        })
        frameCount = 0
        lastTime = currentTime
      }

      requestAnimationFrame(measureFPS)
    }

    // Memory monitoring
    const measureMemory = () => {
      if ("memory" in performance && performance.memory) {
        const memoryInfo = performance.memory as any
        const used = memoryInfo.usedJSHeapSize / 1024 / 1024
        setMetrics((prev) => {
          const newMetrics = { ...prev, memory: used }
          return { ...newMetrics, connectionHealth: calculateConnectionHealth(newMetrics) }
        })
      }
    }

    // Calculate connection health based on performance metrics
    const calculateConnectionHealth = (metrics: PerformanceMetrics): ConnectionHealthTypes => {
      const avgLatency =
        Object.values(metrics.dataLatencies).reduce((sum, latency) => sum + latency, 0) / 4

      // Poor: High latency OR very low FPS OR high memory
      if (avgLatency > 10 || metrics.fps < 2 || metrics.memory > 500) {
        return ConnectionHealth.POOR
      }

      // Warning: Medium latency OR low FPS OR medium memory
      if (avgLatency > 5 || metrics.fps < 10 || metrics.memory > 200) {
        return ConnectionHealth.WARNING
      }

      // Good: Low latency AND good FPS AND reasonable memory
      return ConnectionHealth.GOOD
    }

    measureFPS()
    const memoryInterval = setInterval(measureMemory, 5000)

    // Cleanup subscriptions on unmount
    return () => {
      clearInterval(memoryInterval)
      performanceTracker.unsubscribe(ChannelTypeEnum.TRADES)
      performanceTracker.unsubscribe(ChannelTypeEnum.TICKER)
      performanceTracker.unsubscribe(ChannelTypeEnum.BOOK)
      performanceTracker.unsubscribe(ChannelTypeEnum.CANDLES)
    }
  }, [])

  return metrics
}
