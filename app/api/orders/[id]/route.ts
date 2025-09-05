import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/lib/supabase-admin'
import { ApiResponse } from '@/lib/types'

// PUT /api/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status } = await request.json()

    if (!status) {
      const response: ApiResponse = {
        success: false,
        error: 'حالة الطلب مطلوبة'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const validStatuses = ['جديد', 'قيد التجهيز', 'تم التوصيل', 'ملغي']
    if (!validStatuses.includes(status)) {
      const response: ApiResponse = {
        success: false,
        error: 'حالة الطلب غير صحيحة'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const updatedOrder = await adminService.updateOrderStatus(id, status)

    const response: ApiResponse = {
      success: true,
      data: updatedOrder,
      message: 'تم تحديث حالة الطلب بنجاح'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating order:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في تحديث الطلب'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await adminService.deleteOrder(id)

    const response: ApiResponse = {
      success: true,
      message: 'تم حذف الطلب بنجاح'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting order:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في حذف الطلب'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}