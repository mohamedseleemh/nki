export class LoadingSpinner {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    this.options = {
      size: 'medium',
      color: 'primary',
      text: 'جاري التحميل...',
      overlay: false,
      ...options
    }
    this.element = null
    this.overlayElement = null
  }

  show() {
    if (this.element) return

    // إنشاء العنصر الأساسي
    this.element = document.createElement('div')
    this.element.className = this.getSpinnerClasses()
    this.element.innerHTML = this.getSpinnerHTML()

    // إنشاء الطبقة العلوية إذا لزم الأمر
    if (this.options.overlay) {
      this.overlayElement = document.createElement('div')
      this.overlayElement.className = 'fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50'
      this.overlayElement.appendChild(this.element)
      document.body.appendChild(this.overlayElement)
    } else {
      this.container.appendChild(this.element)
    }

    // إضافة التأثير
    requestAnimationFrame(() => {
      this.element.style.opacity = '1'
    })
  }

  hide() {
    if (!this.element) return

    this.element.style.opacity = '0'
    
    setTimeout(() => {
      if (this.overlayElement) {
        document.body.removeChild(this.overlayElement)
        this.overlayElement = null
      } else if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element)
      }
      this.element = null
    }, 300)
  }

  getSpinnerClasses() {
    const sizeClasses = {
      small: 'w-6 h-6',
      medium: 'w-12 h-12',
      large: 'w-16 h-16'
    }

    const colorClasses = {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      white: 'text-white'
    }

    return `
      flex flex-col items-center justify-center p-4 transition-opacity duration-300 opacity-0
      ${this.options.overlay ? '' : 'absolute inset-0 bg-white/90 backdrop-blur-sm'}
    `.trim()
  }

  getSpinnerHTML() {
    const sizeClasses = {
      small: 'w-6 h-6',
      medium: 'w-12 h-12',
      large: 'w-16 h-16'
    }

    const colorClasses = {
      primary: 'border-primary-500',
      secondary: 'border-secondary-500',
      white: 'border-white'
    }

    return `
      <div class="${sizeClasses[this.options.size]} ${colorClasses[this.options.color]} border-4 border-t-transparent rounded-full animate-spin"></div>
      ${this.options.text ? `<p class="mt-4 text-sm font-medium text-secondary-600">${this.options.text}</p>` : ''}
    `
  }

  static show(container, options) {
    const spinner = new LoadingSpinner(container, options)
    spinner.show()
    return spinner
  }
}

// دالة مساعدة للاستخدام السريع
export function showLoader(container, options) {
  return LoadingSpinner.show(container, options)
}
