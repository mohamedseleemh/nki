import { z } from 'zod'

// Order validation schema
export const orderSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(100, 'الاسم طويل جداً')
    .regex(/^[\u0600-\u06FF\s\w]+$/, 'الاسم يحتوي على أحرف غير صالحة'),
  
  customer_phone: z
    .string()
    .regex(/^01[0-9]{9}$/, 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01 ويحتوي على 11 رقم)')
    .transform(phone => phone.replace(/\s/g, '')),
  
  customer_address: z
    .string()
    .min(10, 'العنوان يجب أن يكون مفصلاً أكثر')
    .max(500, 'العنوان طويل جداً'),
  
  customer_notes: z
    .string()
    .max(300, 'الملاحظات طويلة جداً')
    .optional()
})

// Product validation schema
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'اسم المنتج يجب أن يكون على الأقل حرفين')
    .max(100, 'اسم المنتج طويل جداً'),
  
  description: z
    .string()
    .max(1000, 'الوصف طويل جداً')
    .optional(),
  
  price: z
    .number()
    .min(0.01, 'السعر يجب أن يكون أكبر من صفر')
    .max(999999, 'السعر مرتفع جداً'),
  
  image_url: z
    .string()
    .url('رابط الصورة غير صحيح')
    .optional(),
  
  usage_instructions: z
    .string()
    .max(1000, 'تعليمات الاستخدام طويلة جداً')
    .optional(),
  
  is_active: z.boolean().default(true)
})

// Site content validation schema
export const siteContentSchema = z.object({
  content_key: z
    .string()
    .min(1, 'مفتاح المحتوى مطلوب')
    .max(100, 'مفتاح المحتوى طويل جداً'),
  
  content_value: z
    .string()
    .min(1, 'قيمة المحتوى مطلوبة'),
  
  content_type: z
    .enum(['text', 'boolean', 'json', 'html'])
    .default('text')
})

// Admin login validation schema
export const adminLoginSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صحيح'),
  
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف')
})

// File upload validation
export const uploadSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, 'يجب اختيار ملف')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'حجم الملف يجب أن يكون أقل من 5 ميجابايت')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'نوع الملف غير مدعوم (يجب أن يكون JPEG, PNG, أو WebP)'
    )
})

// Validation helper functions
export function validateOrder(data: unknown) {
  return orderSchema.safeParse(data)
}

export function validateProduct(data: unknown) {
  return productSchema.safeParse(data)
}

export function validateSiteContent(data: unknown) {
  return siteContentSchema.safeParse(data)
}

export function validateAdminLogin(data: unknown) {
  return adminLoginSchema.safeParse(data)
}

export function validateUpload(data: unknown) {
  return uploadSchema.safeParse(data)
}

// Error formatting helper
export function formatValidationErrors(errors: z.ZodError) {
  return errors.errors.reduce((acc, error) => {
    const field = error.path.join('.')
    acc[field] = error.message
    return acc
  }, {} as Record<string, string>)
}