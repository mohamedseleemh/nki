import { faker } from '@faker-js/faker'

// تكوين المُولد للعربية
faker.locale = 'ar'

// مساعدات التحقق من البيانات
export const validators = {
  name(name) {
    if (!name || typeof name !== 'string') return 'يرجى إدخال الاسم'
    if (name.trim().length < 2) return 'يجب أن يكون الاسم حرفين على الأقل'
    if (name.trim().length > 100) return 'الاسم طويل جداً'
    return null
  },

  phone(phone) {
    if (!phone || typeof phone !== 'string') return 'يرجى إدخال رقم الهاتف'
    const cleanPhone = phone.replace(/\s|-/g, '')
    const phonePattern = /^01[0-9]{9}$/
    if (!phonePattern.test(cleanPhone)) return 'يرجى إدخال رقم هاتف صحيح (01xxxxxxxxx)'
    return null
  },

  address(address) {
    if (!address || typeof address !== 'string') return 'يرجى إدخال العنوان'
    if (address.trim().length < 10) return 'يرجى إدخال عنوان تفصيلي (10 أحرف على الأقل)'
    if (address.trim().length > 500) return 'العنوان طويل جداً'
    return null
  },

  email(email) {
    if (!email) return null // البريد اختياري
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) return 'يرجى إدخال بريد إلكتروني صحيح'
    return null
  }
}

// مساعدات التنسيق
export const formatters = {
  currency(amount, currency = 'EGP') {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  },

  date(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Intl.DateTimeFormat('ar-EG', { ...defaultOptions, ...options }).format(new Date(date))
  },

  phone(phone) {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 11) {
      return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`
    }
    return phone
  },

  truncate(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }
}

// مساعدات الأدوات
export const utils = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  copyToClipboard(text) {
    return navigator.clipboard?.writeText(text) || Promise.reject('Clipboard not supported')
  },

  downloadCSV(data, filename) {
    const csv = this.arrayToCSV(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  arrayToCSV(array) {
    if (!array.length) return ''
    
    const headers = Object.keys(array[0])
    const csvContent = [
      headers.join(','),
      ...array.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }
}

// مساعدات الرسوم المتحركة
export const animations = {
  fadeIn(element, duration = 300) {
    element.style.opacity = '0'
    element.style.transition = `opacity ${duration}ms ease-in-out`
    
    requestAnimationFrame(() => {
      element.style.opacity = '1'
    })
    
    return new Promise(resolve => setTimeout(resolve, duration))
  },

  slideUp(element, duration = 300) {
    element.style.transform = 'translateY(20px)'
    element.style.opacity = '0'
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateY(0)'
      element.style.opacity = '1'
    })
    
    return new Promise(resolve => setTimeout(resolve, duration))
  },

  pulse(element, duration = 150) {
    element.style.transform = 'scale(0.95)'
    element.style.transition = `transform ${duration}ms ease-out`
    
    setTimeout(() => {
      element.style.transform = 'scale(1)'
    }, duration)
    
    return new Promise(resolve => setTimeout(resolve, duration * 2))
  }
}

// مولد البيانات التجريبية
export const mockData = {
  generateOrder() {
    const statuses = ['جديد', 'قيد التجهيز', 'تم التوصيل', 'ملغي']
    return {
      id: utils.generateId(),
      customer_name: faker.person.fullName(),
      customer_phone: `01${faker.string.numeric(9)}`,
      customer_address: faker.location.streetAddress(true),
      order_notes: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(statuses),
      total_amount: 350,
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      updated_at: faker.date.recent({ days: 5 }).toISOString()
    }
  },

  generateOrders(count = 10) {
    return Array.from({ length: count }, () => this.generateOrder())
  }
}

// مساعدات التخزين المحلي
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  },

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }
}
