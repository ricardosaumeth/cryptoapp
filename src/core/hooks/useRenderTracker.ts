import { useRef, useEffect } from "react"

interface RenderStats {
  component: string
  renderCount: number
  lastRender: number
}

class RenderTracker {
  private stats = new Map<string, RenderStats>()

  trackRender(componentName: string) {
    const existing = this.stats.get(componentName)
    if (existing) {
      existing.renderCount++
      existing.lastRender = Date.now()
    } else {
      this.stats.set(componentName, {
        component: componentName,
        renderCount: 1,
        lastRender: Date.now(),
      })
    }
  }

  getStats() {
    return Array.from(this.stats.values())
  }

  getRendersPerMinute(componentName: string) {
    const stat = this.stats.get(componentName)
    if (!stat) return 0

    const elapsed = (Date.now() - (stat.lastRender - stat.renderCount * 1000)) / 1000 / 60
    return Math.round(stat.renderCount / elapsed)
  }

  reset() {
    this.stats.clear()
  }
}

export const renderTracker = new RenderTracker()

export const useRenderTracker = (componentName: string) => {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current++
    renderTracker.trackRender(componentName)
  })

  return renderCount.current
}
