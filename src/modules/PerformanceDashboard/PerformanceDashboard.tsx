import { usePerformanceMonitor } from "../../core/hooks/usePerformanceMonitor"

const PerformanceDashboard = () => {
  const { fps, memory, connectionHealth, dataLatencies } = usePerformanceMonitor()

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        minWidth: "200px",
      }}
    >
      <div>FPS: {fps}</div>
      <div>Memory: {memory.toFixed(1)}MB</div>
      <div>Connection: {connectionHealth}</div>

      {/* Separate latency for each data type */}
      <div style={{ marginTop: "8px", borderTop: "1px solid #444", paddingTop: "8px" }}>
        <div style={{ fontSize: "10px", opacity: 0.8 }}>Data Processing Latency:</div>
        <div>Trades: {dataLatencies.trades.toFixed(1)}ms</div>
        <div>Tickers: {dataLatencies.tickers.toFixed(1)}ms</div>
        <div>OrderBook: {dataLatencies.orderBook.toFixed(1)}ms</div>
        <div>Candles: {dataLatencies.candles.toFixed(1)}ms</div>
      </div>

      {/* Highlight slow handlers */}
      {Object.entries(dataLatencies).map(
        ([type, latency]) =>
          latency > 20 && (
            <div key={type} style={{ color: "#ff6b6b", fontSize: "10px" }}>
              ⚠️ {type} slow: {latency.toFixed(1)}ms
            </div>
          )
      )}
    </div>
  )
}

export default PerformanceDashboard
