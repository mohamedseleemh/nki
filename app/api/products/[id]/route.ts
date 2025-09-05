import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/lib/supabase-admin'
import { validateProduct } from '@/lib/validations'
import { ApiResponse } from '@/lib/types'

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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
    const updatedProduct = await adminService.updateProduct(id, productData)

    const response: ApiResponse = {
      success: true,
      data: updatedProduct,
      message: 'تم تحديث المنتج بنجاح'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating product:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في تحديث المنتج'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await adminService.deleteProduct(id)

    const response: ApiResponse = {
      success: true,
      message: 'تم حذف المنتج بنجاح'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting product:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في حذف المنتج'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}