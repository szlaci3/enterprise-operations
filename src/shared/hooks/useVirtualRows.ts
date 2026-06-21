import { useMemo, useState } from 'react'

interface VirtualRowsOptions {
  count: number
  overscan?: number
  rowHeight: number
  viewportHeight: number
}

export function useVirtualRows({
  count,
  overscan = 4,
  rowHeight,
  viewportHeight,
}: VirtualRowsOptions) {
  const [scrollTop, setScrollTop] = useState(0)

  return useMemo(() => {
    const visibleCount = Math.ceil(viewportHeight / rowHeight)
    const startIndex = Math.min(
      Math.max(0, count - visibleCount),
      Math.max(0, Math.floor(scrollTop / rowHeight) - overscan),
    )
    const endIndex = Math.min(
      count,
      startIndex + visibleCount + overscan * 2,
    )
    return {
      endIndex,
      paddingBottom: Math.max(0, (count - endIndex) * rowHeight),
      paddingTop: startIndex * rowHeight,
      setScrollTop,
      startIndex,
    }
  }, [count, overscan, rowHeight, scrollTop, viewportHeight])
}
