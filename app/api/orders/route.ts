import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { adminService } from '@/lib/supabase-admin'
import { validateOrder } from '@/lib/validations'
import { ApiResponse, OrderFormData } from '@/lib/types'

// GET /api/orders - Get all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const orders = await adminService.getAllOrders()
    
    const response: ApiResponse = {
      success: true,
      data: orders
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching orders:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في جلب الطلبات'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validation = validateOrder(body)
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: 'بيانات غير صحيحة',
        data: validation.error.errors
      }
      return NextResponse.json(response, { status: 400 })
    }

    const orderData: OrderFormData = validation.data

    // Create order in database
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        customer_notes: orderData.customer_notes || null,
        status: 'جديد',
        product_name: 'سيروم كيكه',
        product_price: 350.0
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      const response: ApiResponse = {
        success: false,
        error: 'فشل في حفظ الطلب'
      }
      return NextResponse.json(response, { status: 500 })
    }

    const response: ApiResponse = {
      success: true,
      data: data,
      message: 'تم إنشاء الطلب بنجاح'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'حدث خطأ في الخادم'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}