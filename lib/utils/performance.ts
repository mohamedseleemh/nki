/**
 * مساعدات تحسين الأداء
 */

/**
 * Debounce function لتقليل استدعاءات البحث
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function لتحديد معدل التنفيذ
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * مساعد للتخزين المؤقت البسيط
 */
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private ttl: number

  constructor(ttlMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.ttl = ttlMs
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * مساعد لقياس أداء الدوال
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now()
      console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`)
    })
  } else {
    const end = performance.now()
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`)
    return result
  }
}

/**
 * مساعد لتحسين الصور
 */
export function optimizeImageUrl(url: string, width?: number, quality?: number): string {
  if (!url) return url
  
  // إذا كانت الصورة من Unsplash، يمكن إضافة معاملات التحسين
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (quality) params.set('q', quality.toString())
    
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${params.toString()}`
  }
  
  return url
}