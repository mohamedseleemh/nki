import { useState, useEffect, useCallback } from 'react'
import { orderService } from '@/lib/supabase'
import type { Order } from '@/lib/types'

interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>
  deleteOrder: (orderId: string) => Promise<void>
}

/**
 * Custom hook لإدارة الطلبات مع تحسين الأداء والتخزين المؤقت
 */
export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تحميل الطلبات'
      setError(errorMessage)
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status)
      
      // تحديث محلي للحالة لتحسين الأداء
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status, updated_at: new Date().toISOString() }
            : order
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث الطلب'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId)
      
      // إزالة محلية من الحالة
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف الطلب'
      setError(errorMessage)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    deleteOrder
  }
}