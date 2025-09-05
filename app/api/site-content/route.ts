import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/lib/supabase-admin'
import { validateSiteContent } from '@/lib/validations'
import { ApiResponse } from '@/lib/types'

// GET /api/site-content - Get site content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentKey = searchParams.get('key')

    const data = await adminService.getSiteContent(contentKey || undefined)

    const response: ApiResponse = {
      success: true,
      data: data
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching site content:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في جلب محتوى الموقع'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/site-content - Update site content (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validation = validateSiteContent(body)
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: 'بيانات غير صحيحة',
        data: validation.error.errors
      }
      return NextResponse.json(response, { status: 400 })
    }

    const { content_key, content_value, content_type } = validation.data

    const updatedContent = await adminService.updateSiteContent(
      content_key,
      content_value,
      content_type
    )

    const response: ApiResponse = {
      success: true,
      data: updatedContent,
      message: 'تم تحديث المحتوى بنجاح'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating site content:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في تحديث المحتوى'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}