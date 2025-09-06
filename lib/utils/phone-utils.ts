/**
 * مساعدات لمعالجة أرقام الهواتف بشكل آمن
 */

/**
 * إخفاء جزء من رقم الهاتف للحماية
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone
  
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
    return `${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-3)}`
  }
  
  return phone
}

/**
 * تنسيق رقم الهاتف للعرض
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`
  }
  
  return phone
}

/**
 * التحقق من صحة رقم الهاتف المصري
 */
export function validateEgyptianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  return /^01[0-9]{9}$/.test(cleanPhone)
}

/**
 * تحويل رقم الهاتف لصيغة WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.startsWith('01')) {
    return `2${cleanPhone}`
  }
  
  return cleanPhone
}