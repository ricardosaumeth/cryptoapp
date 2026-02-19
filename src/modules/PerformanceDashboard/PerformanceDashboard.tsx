import { useState, useEffect, useMemo } from "react"
import { performanceMetrics } from "../../services/performanceMetrics"
import { renderTracker } from "../../core/hooks/useRenderTracker"
import { usePerformanceMonitor } from "../../core/hooks/usePerformanceMonitor"

// Pre-defined style objects to avoid recreation on every render
const containerStyle = {
  position: "fixed" as const,
  top: 10,
  right: 10,
  background: "#1f2936",
  color: "white",
  padding: 10,
  fontSize: 12,
  borderRadius: 4,
  zIndex: 9999,
  minWidth: "150px",
  maxHeight: "400px",
  overflow: "auto" as const,
}

const sectionStyle = {
  marginTop: 8,
  borderBottom: "1px solid #444",
  paddingBottom: 8,
}

const lastSectionStyle = {
  marginTop: 8,
}

const healthColors = {
  good: "#00AD08",
  warning: "#FFA41B",
  poor: "#FF264D",
}

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    updatesPerMin: 0,
    channelStats: {} as Record<string, number>,
    renderStats: [] as any[],
  })

  const corePerformanceMetrics = usePerformanceMonitor()

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        updatesPerMin: performanceMetrics.getUpdatesPerMinute(),
        channelStats: performanceMetrics.getChannelStats(),
        renderStats: renderTracker.getStats(),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const healthColor = useMemo(() => {
    const health = corePerformanceMetrics.connectionHealth
    return healthColors[health as keyof typeof healthColors] || healthColors.poor
  }, [corePerformanceMetrics.connectionHealth])

  return (
    <div style={containerStyle}>
      <div>
        <strong>Performance Metrics</strong>
      </div>

      <div style={sectionStyle}>
        <strong>Core Performance:</strong>
        <div>FPS: {corePerformanceMetrics.fps}</div>
        <div>Memory: {corePerformanceMetrics.memory.toFixed(1)} MB</div>
        <div>
          Health:{" "}
          <span style={{ color: healthColor }}>
            {corePerformanceMetrics.connectionHealth}
          </span>
        </div>
      </div>

      <div style={sectionStyle}>
        <strong>Data Latencies (ms):</strong>
        <div>Trades: {corePerformanceMetrics.dataLatencies.trades.toFixed(1)}ms</div>
        <div>Tickers: {corePerformanceMetrics.dataLatencies.tickers.toFixed(1)}ms</div>
        <div>Book: {corePerformanceMetrics.dataLatencies.orderBook.toFixed(1)}ms</div>
        <div>Candles: {corePerformanceMetrics.dataLatencies.candles.toFixed(1)}ms</div>
      </div>

      <div style={sectionStyle}>
        <strong>WebSocket Updates/min:</strong>
        <div>Total: {metrics.updatesPerMin}</div>
        {Object.entries(metrics.channelStats).map(([channel, count]) => (
          <div key={channel}>
            {channel}: {count}
          </div>
        ))}
      </div>

      <div style={lastSectionStyle}>
        <strong>Component Renders:</strong>
        {metrics.renderStats.slice(0, 5).map((stat) => (
          <div key={stat.component}>
            {stat.component}: {stat.renderCount}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PerformanceDashboard
