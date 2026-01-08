class PerformanceTracker {
  private listeners: Map<string, (latency: number) => void> = new Map()

  subscribe(dataType: string, callback: (latency: number) => void) {
    this.listeners.set(dataType, callback)
  }

  updateLatency(dataType: string, latency: number) {
    const callback = this.listeners.get(dataType)
    if (callback) {
      callback(latency)
    }
  }

  unsubscribe(dataType: string) {
    this.listeners.delete(dataType)
  }
}

// Global instance
export const performanceTracker = new PerformanceTracker()
