class PerformanceMetrics {
  private updateCounts = new Map<string, number>()
  private startTime = Date.now()

  trackUpdate(channel: string) {
    const current = this.updateCounts.get(channel) || 0
    this.updateCounts.set(channel, current + 1)
  }

  getUpdatesPerMinute() {
    const elapsed = (Date.now() - this.startTime) / 1000 / 60 // minutes
    const total = Array.from(this.updateCounts.values()).reduce((sum, count) => sum + count, 0)
    return Math.round(total / elapsed)
  }

  getChannelStats() {
    const elapsed = (Date.now() - this.startTime) / 1000 / 60
    const stats: Record<string, number> = {}

    this.updateCounts.forEach((count, channel) => {
      stats[channel] = Math.round(count / elapsed)
    })

    return stats
  }

  reset() {
    this.updateCounts.clear()
    this.startTime = Date.now()
  }
}

export const performanceMetrics = new PerformanceMetrics()
