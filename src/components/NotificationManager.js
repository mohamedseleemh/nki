export class NotificationManager {
  constructor() {
    this.notifications = []
    this.container = this.createContainer()
  }

  createContainer() {
    let container = document.getElementById('notification-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'notification-container'
      container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm'
      document.body.appendChild(container)
    }
    return container
  }

  show(message, type = 'success', duration = 4000) {
    const notification = this.createNotification(message, type)
    this.container.appendChild(notification.element)
    this.notifications.push(notification)

    // عرض الإشعار
    requestAnimationFrame(() => {
      notification.element.style.transform = 'translateX(0)'
      notification.element.style.opacity = '1'
    })

    // إخفاء تلقائي
    if (duration > 0) {
      notification.timeout = setTimeout(() => {
        this.hide(notification)
      }, duration)
    }

    return notification
  }

  createNotification(message, type) {
    const element = document.createElement('div')
    element.className = this.getNotificationClasses(type)
    element.innerHTML = this.getNotificationHTML(message, type)

    // إضافة زر الإغلاق
    const closeButton = element.querySelector('.close-btn')
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        const notification = this.notifications.find(n => n.element === element)
        if (notification) this.hide(notification)
      })
    }

    return {
      element,
      type,
      message,
      timeout: null
    }
  }

  hide(notification) {
    if (notification.timeout) {
      clearTimeout(notification.timeout)
    }

    notification.element.style.transform = 'translateX(100%)'
    notification.element.style.opacity = '0'

    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element)
      }
      this.notifications = this.notifications.filter(n => n !== notification)
    }, 300)
  }

  getNotificationClasses(type) {
    const baseClasses = 'flex items-center p-4 rounded-xl shadow-lg transform translate-x-full opacity-0 transition-all duration-300 min-w-80'
    
    const typeClasses = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    }

    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`
  }

  getNotificationHTML(message, type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }

    return `
      <div class="flex items-center flex-1">
        <span class="text-lg ml-3">${icons[type] || icons.info}</span>
        <p class="flex-1 font-medium">${message}</p>
        <button class="close-btn mr-2 hover:bg-white/20 p-1 rounded transition-colors" title="إغلاق">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `
  }

  success(message, duration) {
    return this.show(message, 'success', duration)
  }

  error(message, duration) {
    return this.show(message, 'error', duration)
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration)
  }

  info(message, duration) {
    return this.show(message, 'info', duration)
  }

  clear() {
    this.notifications.forEach(notification => this.hide(notification))
  }
}

// إنشاء مثيل عام
export const notifications = new NotificationManager()
