import { db } from './config/supabase.js'
import { notifications } from './components/NotificationManager.js'

const SESSION_KEY = 'kika_admin_session'

class AuthManager {
  constructor() {
    this.isAuthenticated = this.checkSession()
  }

  checkSession() {
    try {
      const session = sessionStorage.getItem(SESSION_KEY)
      if (!session) return false
      
      const { expiry } = JSON.parse(session)
      return Date.now() < expiry
    } catch (error) {
      return false
    }
  }

  async login(password) {
    if (!password) {
      notifications.error('يرجى إدخال كلمة المرور')
      return false
    }

    try {
      const isValid = await db.loginAdmin(password)
      
      if (isValid) {
        const expiry = Date.now() + 8 * 60 * 60 * 1000 // 8 hours session
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, expiry }))
        this.isAuthenticated = true
        notifications.success('✅ تم تسجيل الدخول بنجاح')
        return true
      } else {
        notifications.error('❌ كلمة المرور غير صحيحة')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      notifications.error('حدث خطأ أثناء تسجيل الدخول')
      return false
    }
  }

  logout() {
    sessionStorage.removeItem(SESSION_KEY)
    this.isAuthenticated = false
    notifications.info('تم تسجيل الخروج')
    // The router will handle navigation
  }

  async changePassword(currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      return { success: false, message: 'يرجى ملء جميع الحقول' }
    }
    if (newPassword.length < 6) {
      return { success: false, message: 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل' }
    }

    try {
      const isCurrentPasswordValid = await db.loginAdmin(currentPassword)
      if (!isCurrentPasswordValid) {
        return { success: false, message: 'كلمة المرور الحالية غير صحيحة' }
      }

      await db.updateAdminPassword(newPassword)
      return { success: true, message: 'تم تغيير كلمة المرور بنجاح' }
    } catch (error) {
      console.error('Password change error:', error)
      return { success: false, message: 'حدث خطأ أثناء تغيير كلمة المرور' }
    }
  }
}

export const auth = new AuthManager()
