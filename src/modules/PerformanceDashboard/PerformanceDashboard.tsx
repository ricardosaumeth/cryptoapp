import { useState, useEffect } from "react"
import { performanceMetrics } from "../../services/performanceMetrics"
import { renderTracker } from "../../core/hooks/useRenderTracker"
import { usePerformanceMonitor } from "../../core/hooks/usePerformanceMonitor"

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

  return (
    <div
      style={{
        position: "fixed",
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
        overflow: "auto",
      }}
    >
      <div>
        <strong>Performance Metrics</strong>
      </div>

      <div style={{ marginTop: 8, borderBottom: "1px solid #444", paddingBottom: 8 }}>
        <strong>Core Performance:</strong>
        <div>FPS: {corePerformanceMetrics.fps}</div>
        <div>Memory: {corePerformanceMetrics.memory.toFixed(1)} MB</div>
        <div>
          Health:{" "}
          <span
            style={{
              color:
                corePerformanceMetrics.connectionHealth === "good"
                  ? "#00AD08"
                  : corePerformanceMetrics.connectionHealth === "warning"
                    ? "#FFA41B"
                    : "#FF264D",
            }}
          >
            {corePerformanceMetrics.connectionHealth}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 8, borderBottom: "1px solid #444", paddingBottom: 8 }}>
        <strong>Data Latencies (ms):</strong>
        <div>Trades: {corePerformanceMetrics.dataLatencies.trades.toFixed(1)}ms</div>
        <div>Tickers: {corePerformanceMetrics.dataLatencies.tickers.toFixed(1)}ms</div>
        <div>Book: {corePerformanceMetrics.dataLatencies.orderBook.toFixed(1)}ms</div>
        <div>Candles: {corePerformanceMetrics.dataLatencies.candles.toFixed(1)}ms</div>
      </div>

      <div style={{ marginTop: 8, borderBottom: "1px solid #444", paddingBottom: 8 }}>
        <strong>WebSocket Updates/min:</strong>
        <div>Total: {metrics.updatesPerMin}</div>
        {Object.entries(metrics.channelStats).map(([channel, count]) => (
          <div key={channel}>
            {channel}: {count}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
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
