import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { adminService } from '@/lib/supabase-admin'
import { validateProduct } from '@/lib/validations'
import { ApiResponse } from '@/lib/types'

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    let query = supabase.from('products').select('*')
    
    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    const response: ApiResponse = {
      success: true,
      data: data
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في جلب المنتجات'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validation = validateProduct(body)
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: 'بيانات غير صحيحة',
        data: validation.error.errors
      }
      return NextResponse.json(response, { status: 400 })
    }

    const productData = validation.data

    const newProduct = await adminService.createProduct(productData)

    const response: ApiResponse = {
      success: true,
      data: newProduct,
      message: 'تم إنشاء المنتج بنجاح'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في إنشاء المنتج'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}