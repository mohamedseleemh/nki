/**
 * ثوابت التطبيق المركزية
 */

// حالات الطلبات
export const ORDER_STATUSES = {
  NEW: 'جديد',
  PROCESSING: 'قيد التجهيز', 
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي'
} as const

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]

// إعدادات المنتج
export const PRODUCT_CONFIG = {
  NAME: 'سيروم كيكه',
  PRICE: 350,
  CURRENCY: 'جنيه',
  FREE_SHIPPING: true
} as const

// إعدادات التطبيق
export const APP_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_PHONE_DISPLAY_LENGTH: 11,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  ERROR_LOG_LIMIT: 10
} as const

// رسائل الأخطاء المعيارية
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  VALIDATION_ERROR: 'بيانات غير صحيحة',
  SERVER_ERROR: 'خطأ في الخادم',
  UNAUTHORIZED: 'غير مصرح لك بهذا الإجراء',
  NOT_FOUND: 'العنصر المطلوب غير موجود',
  GENERIC_ERROR: 'حدث خطأ غير متوقع'
} as const

// أنماط التحقق
export const VALIDATION_PATTERNS = {
  EGYPTIAN_PHONE: /^01[0-9]{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ARABIC_NAME: /^[\u0600-\u06FF\s\w]+$/
} as const