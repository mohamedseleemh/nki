import { db } from '../config/supabase.js'
import { validators, formatters } from '../utils/helpers.js'
import { notifications } from '../components/NotificationManager.js'
import { LoadingSpinner } from '../components/LoadingSpinner.js'
import { DEFAULT_PRODUCT, DEFAULT_SITE_CONTENT } from '../config/constants.js'

export class LandingPage {
  constructor() {
    this.currentProduct = null
    this.siteContent = {}
    this.orderForm = null
    this.isLoading = false
    this.init()
  }

  async init() {
    try {
      await this.loadSiteContent()
      await this.loadProductData()
      this.setupEventListeners()
      this.initAnimations()
      this.updateUI()
    } catch (error) {
      console.error('Error initializing landing page:', error)
      notifications.error('حدث خطأ في تحميل البيانات')
    }
  }

  async loadSiteContent() {
    try {
      this.siteContent = await db.getSiteContent()
    } catch (error) {
      console.error('Error loading site content:', error)
      // استخدام البيانات الافتراضية في حالة الخطأ
      this.siteContent = DEFAULT_SITE_CONTENT
    }
  }

  async loadProductData() {
    try {
      const products = await db.getProducts()
      this.currentProduct = products.length > 0 ? products[0] : DEFAULT_PRODUCT
    } catch (error) {
      console.error('Error loading product data:', error)
      this.currentProduct = DEFAULT_PRODUCT
    }
  }

  setupEventListeners() {
    // نموذج الطلب
    this.orderForm = document.getElementById('orderForm')
    if (this.orderForm) {
      this.orderForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleOrderSubmit()
      })

      // التحقق الفوري من البيانات
      const inputs = this.orderForm.querySelectorAll('input, textarea')
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input))
        input.addEventListener('input', () => this.clearFieldError(input))
      })
    }

    // أزرار الطلب
    const orderButtons = document.querySelectorAll('[data-action="order"]')
    orderButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.scrollToOrderSection()
      })
    })

    // التمرير السلس للروابط
    this.initSmoothScrolling()
  }

  initAnimations() {
    // تأثيرات التمرير
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1'
          entry.target.style.transform = 'translateY(0)'
        }
      })
    }, observerOptions)

    // مراقبة العناصر
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px)'
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
      observer.observe(el)
    })

    // تأثيرات الأزرار
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px) scale(1.02)'
      })
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0) scale(1)'
      })
    })
  }

  initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    })
  }

  updateUI() {
    this.updateBrandInfo()
    this.updateProductInfo()
    this.updateProductBenefits()
    this.updateWhatsAppLink()
  }

  updateBrandInfo() {
    const brandNameEl = document.getElementById('brandName')
    const brandTaglineEl = document.querySelector('.brand-tagline')
    
    if (brandNameEl) {
      brandNameEl.textContent = this.siteContent.brand_name || 'سندرين بيوتي'
    }
    
    if (brandTaglineEl) {
      brandTaglineEl.textContent = this.siteContent.brand_tagline || 'العناية الطبيعية لجمالك'
    }
  }

  updateProductInfo() {
    if (!this.currentProduct) return

    // اسم المنتج
    const productNameEl = document.getElementById('productName')
    if (productNameEl) {
      productNameEl.textContent = this.currentProduct.name
    }

    // وصف المنتج
    const productSubtitleEl = document.getElementById('productSubtitle')
    if (productSubtitleEl) {
      productSubtitleEl.textContent = this.currentProduct.description
    }

    // السعر
    const productPriceEl = document.getElementById('productPrice')
    if (productPriceEl) {
      productPriceEl.textContent = `${this.currentProduct.price} جنيه`
    }

    // طريقة الاستخدام
    const usageInstructionsEl = document.getElementById('usageInstructions')
    if (usageInstructionsEl) {
      usageInstructionsEl.textContent = this.currentProduct.usage_instructions
    }

    // صورة المنتج
    this.updateProductImage()
  }

  updateProductBenefits() {
    if (!this.currentProduct?.benefits) return

    const benefitsContainer = document.getElementById('productBenefits')
    if (!benefitsContainer) return

    const iconMap = {
      droplet: 'fas fa-tint',
      shield: 'fas fa-shield-alt',
      leaf: 'fas fa-leaf',
      sparkles: 'fas fa-magic',
      heart: 'fas fa-heart',
      sun: 'fas fa-sun'
    }

    const colorMap = {
      droplet: 'text-blue-500',
      shield: 'text-green-500',
      leaf: 'text-emerald-500',
      sparkles: 'text-purple-500',
      heart: 'text-pink-500',
      sun: 'text-yellow-500'
    }

    benefitsContainer.innerHTML = this.currentProduct.benefits.map((benefit, index) => `
      <div class="bg-white rounded-2xl p-6 card-shadow hover-lift animate-on-scroll" 
           style="animation-delay: ${index * 0.1}s">
        <div class="${colorMap[benefit.icon] || 'text-primary-500'} text-3xl mb-4">
          <i class="${iconMap[benefit.icon] || 'fas fa-star'}"></i>
        </div>
        <h3 class="font-bold text-lg mb-3 text-primary-700">${benefit.title}</h3>
        <p class="text-secondary-600 leading-relaxed">${benefit.description}</p>
      </div>
    `).join('')
  }

  updateProductImage() {
    const productImageEl = document.getElementById('productImage')
    if (!productImageEl) return

    if (this.currentProduct.image_url) {
      productImageEl.innerHTML = `
        <div class="relative group">
          <img src="${this.currentProduct.image_url}" 
               alt="${this.currentProduct.name}" 
               class="w-80 h-80 md:w-96 md:h-96 object-cover rounded-3xl shadow-2xl transition-transform duration-300 group-hover:scale-105 animate-on-scroll">
          <div class="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent rounded-3xl"></div>
        </div>
      `
    } else {
      // عرض الصورة الافتراضية
      productImageEl.innerHTML = `
        <div class="relative animate-on-scroll">
          <div class="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl shadow-2xl flex items-center justify-center hover-lift">
            <div class="text-center text-primary-600">
              <i class="fas fa-magic text-6xl mb-4 animate-bounce-subtle"></i>
              <div class="text-2xl font-bold mb-2">${this.currentProduct.name}</div>
              <div class="text-lg opacity-80">سيروم فيتامين سي</div>
              <div class="text-sm mt-4 opacity-60">من ${this.siteContent.brand_name || 'سندرين بيوتي'}</div>
            </div>
          </div>
          <!-- Decorative elements -->
          <div class="absolute -top-4 -right-4 w-20 h-20 bg-accent-200 rounded-full opacity-50 animate-bounce-subtle"></div>
          <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-200 rounded-full opacity-50 animate-bounce-subtle" style="animation-delay: 1s"></div>
        </div>
      `
    }
  }

  updateWhatsAppLink() {
    const whatsappLinks = document.querySelectorAll('[href^="https://wa.me/"]')
    const phoneNumber = this.siteContent.whatsapp_number || '01556133633'
    const formattedNumber = phoneNumber.startsWith('0') 
      ? `20${phoneNumber.substring(1)}` 
      : phoneNumber

    whatsappLinks.forEach(link => {
      link.href = `https://wa.me/${formattedNumber}`
      // تحديث النص إذا كان يحتوي على رقم الهاتف
      if (link.textContent.includes('01')) {
        link.textContent = link.textContent.replace(/01\d{9}/, phoneNumber)
      }
    })
  }

  validateField(field) {
    const value = field.value.trim()
    const fieldName = field.name || field.id
    let error = null

    switch (fieldName) {
      case 'customerName':
        error = validators.name(value)
        break
      case 'customerPhone':
        error = validators.phone(value)
        break
      case 'customerAddress':
        error = validators.address(value)
        break
      case 'customerEmail':
        error = validators.email(value)
        break
    }

    this.showFieldError(field, error)
    return !error
  }

  showFieldError(field, error) {
    // إزالة الخطأ السابق
    this.clearFieldError(field)

    if (error) {
      field.classList.add('border-red-500', 'bg-red-50')
      
      const errorElement = document.createElement('div')
      errorElement.className = 'text-red-500 text-sm mt-1 field-error'
      errorElement.textContent = error
      
      field.parentNode.appendChild(errorElement)
    }
  }

  clearFieldError(field) {
    field.classList.remove('border-red-500', 'bg-red-50')
    const errorElement = field.parentNode.querySelector('.field-error')
    if (errorElement) {
      errorElement.remove()
    }
  }

  async handleOrderSubmit() {
    if (this.isLoading) return

    const formData = new FormData(this.orderForm)
    const orderData = {
      customer_name: formData.get('customerName')?.trim(),
      customer_phone: formData.get('customerPhone')?.trim(),
      customer_address: formData.get('customerAddress')?.trim(),
      order_notes: formData.get('orderNotes')?.trim() || '',
      total_amount: this.currentProduct.price
    }

    // التحقق من البيانات
    const isValid = this.validateOrderData(orderData)
    if (!isValid) return

    this.isLoading = true
    const submitButton = this.orderForm.querySelector('button[type="submit"]')
    const originalText = submitButton.innerHTML
    
    // عرض حالة التحميل
    submitButton.disabled = true
    submitButton.innerHTML = `
      <div class="flex items-center justify-center">
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
        جاري الإرسال...
      </div>
    `

    try {
      await db.createOrder(orderData)
      
      // مسح النموذج
      this.orderForm.reset()
      
      // عرض رسالة النجاح
      notifications.success('🎉 تم إرسال طلبك بنجاح! سنتواصل معك قريباً عبر الواتساب')
      
      // توجيه إلى الواتساب (اختياري)
      setTimeout(() => {
        this.redirectToWhatsApp(orderData)
      }, 2000)

    } catch (error) {
      console.error('Error creating order:', error)
      notifications.error('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى')
    } finally {
      this.isLoading = false
      submitButton.disabled = false
      submitButton.innerHTML = originalText
    }
  }

  validateOrderData(orderData) {
    const fields = [
      { value: orderData.customer_name, name: 'customerName' },
      { value: orderData.customer_phone, name: 'customerPhone' },
      { value: orderData.customer_address, name: 'customerAddress' }
    ]

    let isValid = true

    fields.forEach(field => {
      const fieldElement = document.getElementById(field.name)
      if (fieldElement && !this.validateField(fieldElement)) {
        isValid = false
      }
    })

    if (!isValid) {
      notifications.error('يرجى تصحيح الأخطاء في النموذج')
    }

    return isValid
  }

  redirectToWhatsApp(orderData) {
    const phoneNumber = this.siteContent.whatsapp_number || '01556133633'
    const formattedNumber = phoneNumber.startsWith('0') 
      ? `20${phoneNumber.substring(1)}` 
      : phoneNumber

    const message = `مرحباً، أود طلب منتج "${this.currentProduct.name}" من ${this.siteContent.brand_name || 'سندرين بيوتي'}

📋 بيانات الطلب:
الاسم: ${orderData.customer_name}
الهاتف: ${orderData.customer_phone}
العنوان: ${orderData.customer_address}
${orderData.order_notes ? `الملاحظات: ${orderData.order_notes}` : ''}

💰 السعر: ${this.currentProduct.price} جنيه
🚚 الشحن: مجاني

شكراً لكم!`

    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  scrollToOrderSection() {
    const orderSection = document.getElementById('order')
    if (orderSection) {
      orderSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
}
