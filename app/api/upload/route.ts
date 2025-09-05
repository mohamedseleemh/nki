import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { validateUpload } from '@/lib/validations'
import { ApiResponse } from '@/lib/types'

// POST /api/upload - Upload image file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      const response: ApiResponse = {
        success: false,
        error: 'لم يتم اختيار ملف'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate file
    const validation = validateUpload({ file })
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: 'ملف غير صالح',
        data: validation.error.errors
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${filename}`

    const response: ApiResponse = {
      success: true,
      data: {
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type
      },
      message: 'تم رفع الملف بنجاح'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error uploading file:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'فشل في رفع الملف'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}