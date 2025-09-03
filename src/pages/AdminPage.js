import { db, subscriptions } from '../config/supabase.js'
import { formatters, utils, mockData } from '../utils/helpers.js'
import { notifications } from '../components/NotificationManager.js'
import { LoadingSpinner } from '../components/LoadingSpinner.js'
import { AnalyticsChart } from '../components/AnalyticsChart.js'
import { auth } from '../auth.js'
import { router } from '../router.js'
import { ORDER_STATUSES, DEFAULT_PRODUCT } from '../config/constants.js'

export class AdminPage {
  constructor() {
    this.orders = []
    this.products = []
    this.siteContent = {}
    this.currentSection = 'analytics'
    this.ordersSubscription = null
    this.stats = {}
    this.adminContainer = document.getElementById('admin-page-container')
    this.init()
  }

  async init() {
    const loader = LoadingSpinner.show('body', { overlay: true, text: 'جاري تحميل لوحة الإدارة...' })
    try {
      await this.loadData()
      this.setupEventListeners()
      this.setupRealtimeSubscriptions()
      this.updateUI()
      this.showSection(this.currentSection)
    } catch (error) {
      console.error('Error initializing admin page:', error)
      notifications.error('حدث خطأ في تحميل لوحة الإدارة')
      auth.logout()
      router.navigate('/')
    } finally {
      loader.hide()
    }
  }

  async loadData() {
    const [orders, products, siteContent, stats] = await Promise.all([
      db.getOrders(),
      db.getProducts(),
      db.getSiteContent(),
      db.getOrderStats()
    ])
    this.orders = orders
    this.products = products.length > 0 ? products : [DEFAULT_PRODUCT]
    this.siteContent = siteContent
    this.stats = stats
  }

  setupEventListeners() {
    if (!this.adminContainer) return

    // Delegated event listener for clicks
    this.adminContainer.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]')
      if (!target) return

      const action = target.dataset.action
      const orderId = target.dataset.orderId

      switch (action) {
        case 'show-section':
          this.showSection(target.dataset.section)
          break
        case 'export-orders':
          this.exportOrders()
          break
        case 'generate-mock':
          this.generateMockOrders()
          break
        case 'logout':
          auth.logout()
          router.navigate('/')
          break
        case 'delete-order':
          if (orderId) this.deleteOrder(orderId)
          break
        case 'open-whatsapp':
          // The link handles this, but we could add tracking here if needed
          break
      }
    })

    // Delegated event listener for changes (e.g., select dropdowns)
    this.adminContainer.addEventListener('change', (e) => {
      const target = e.target.closest('[data-action="update-status"]')
      if (target) {
        const orderId = target.dataset.orderId
        const newStatus = target.value
        if (orderId) this.updateOrderStatus(orderId, newStatus, target)
      }
    })

    // Form submissions
    const contentForm = document.getElementById('contentForm')
    if (contentForm) contentForm.addEventListener('submit', (e) => { e.preventDefault(); this.saveContentChanges() })

    const imageForm = document.getElementById('imageForm')
    if (imageForm) imageForm.addEventListener('submit', (e) => { e.preventDefault(); this.updateProductImage() })

    const passwordForm = document.getElementById('passwordForm')
    if (passwordForm) passwordForm.addEventListener('submit', (e) => { e.preventDefault(); this.changePassword() })
  }

  setupRealtimeSubscriptions() {
    this.ordersSubscription = subscriptions.subscribeToOrders(async (payload) => {
      console.log('Real-time update:', payload)
      notifications.info('🔄 يتم تحديث البيانات...', 2000)
      await this.refreshData()
    })
  }

  async refreshData() {
    const [orders, stats] = await Promise.all([db.getOrders(), db.getOrderStats()])
    this.orders = orders
    this.stats = stats
    this.updateUI()
  }

  showSection(sectionName) {
    if (!sectionName) return
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'))
    document.querySelectorAll('.nav-button').forEach(b => {
      b.classList.remove('active', 'bg-primary-500', 'text-white')
      b.classList.add('bg-secondary-200', 'text-secondary-700')
    })
    document.getElementById(`${sectionName}Section`)?.classList.remove('hidden')
    const activeButton = document.querySelector(`[data-section="${sectionName}"]`)
    if (activeButton) {
      activeButton.classList.add('active', 'bg-primary-500', 'text-white')
      activeButton.classList.remove('bg-secondary-200', 'text-secondary-700')
    }
    this.currentSection = sectionName
    if (sectionName === this.currentSection) this.updateSectionUI(sectionName)
  }

  updateUI() {
    this.updateStatsDisplay()
    this.updateSectionUI(this.currentSection)
  }

  updateSectionUI(sectionName) {
    switch (sectionName) {
      case 'analytics': this.updateAnalytics(); break
      case 'orders': this.updateOrdersDisplay(); break
      case 'content': this.loadContentForEditing(); break
      case 'images': this.loadImageManagement(); break
    }
  }

  updateStatsDisplay() {
    const statsContainer = document.getElementById('adminStats')
    if (!statsContainer) return
    statsContainer.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <div class="text-2xl font-bold text-primary-600">${this.stats.total_orders || 0}</div>
          <div class="text-sm text-secondary-600">إجمالي الطلبات</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <div class="text-2xl font-bold text-green-600">${formatters.currency(this.stats.total_revenue || 0)}</div>
          <div class="text-sm text-secondary-600">إجمالي الإيرادات</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <div class="text-2xl font-bold text-blue-600">${this.stats.new_orders || 0}</div>
          <div class="text-sm text-secondary-600">طلبات جديدة</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <div class="text-2xl font-bold text-yellow-600">${this.stats.processing_orders || 0}</div>
          <div class="text-sm text-secondary-600">قيد التجهيز</div>
        </div>
      </div>`
  }

  updateAnalytics() {
    const container = document.getElementById('analyticsContent')
    if (!container) return
    container.innerHTML = `
      <div id="revenueChartContainer"></div>
      <div id="statusChartContainer"></div>
    `
    new AnalyticsChart('#revenueChartContainer', {
      title: 'الإيرادات اليومية (آخر 7 أيام)',
      data: this.stats.daily_revenue || [],
      color: 'green'
    })
    new AnalyticsChart('#statusChartContainer', {
      title: 'توزيع حالات الطلبات',
      data: this.stats.status_distribution || [],
      color: 'accent'
    })
  }
  
  updateOrdersDisplay() {
    const tableBody = document.getElementById('ordersTableBody')
    const noOrdersDiv = document.getElementById('noOrders')
    const ordersTable = document.getElementById('ordersTable')

    if (!this.orders || this.orders.length === 0) {
      if (ordersTable) ordersTable.style.display = 'none'
      if (noOrdersDiv) noOrdersDiv.style.display = 'block'
      return
    }

    if (ordersTable) ordersTable.style.display = 'table'
    if (noOrdersDiv) noOrdersDiv.style.display = 'none'

    if (!tableBody) return

    tableBody.innerHTML = this.orders.map((order, index) => `
      <tr class="border-b hover:bg-primary-50 transition-colors duration-200" 
          style="animation: fadeIn 0.3s ease-in-out ${index * 0.05}s both">
        <td class="p-4">
          <div class="text-sm font-medium">${formatters.date(order.created_at, { month: 'short', day: 'numeric' })}</div>
          <div class="text-xs text-secondary-500">${formatters.date(order.created_at, { hour: '2-digit', minute: '2-digit' })}</div>
        </td>
        <td class="p-4 font-semibold text-primary-700">${order.customer_name}</td>
        <td class="p-4">
          <a href="tel:${order.customer_phone}" class="text-primary-600 hover:text-primary-800 transition-colors flex items-center">
            <i class="fas fa-phone text-xs ml-1"></i> ${formatters.phone(order.customer_phone)}
          </a>
        </td>
        <td class="p-4 max-w-xs truncate" title="${order.customer_address}">${order.customer_address}</td>
        <td class="p-4 max-w-xs truncate" title="${order.order_notes || 'لا توجد'}">${order.order_notes || 'لا توجد'}</td>
        <td class="p-4 font-medium text-primary-700">${formatters.currency(order.total_amount)}</td>
        <td class="p-4">${this.getStatusSelectHTML(order)}</td>
        <td class="p-4"><div class="flex gap-2">${this.getActionButtonsHTML(order)}</div></td>
      </tr>
    `).join('')
  }
  
  getStatusSelectHTML(order) {
    return `<select data-action="update-status" data-order-id="${order.id}" class="px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm font-medium">
        ${ORDER_STATUSES.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>`
  }

  getActionButtonsHTML(order) {
    const phone = order.customer_phone.replace(/\D/g, '')
    const whatsapp = phone.startsWith('0') ? `20${phone.substring(1)}` : phone
    const message = encodeURIComponent(`مرحباً ${order.customer_name}، بخصوص طلبك لمنتج كيكه...`)
    return `
      <a href="https://wa.me/${whatsapp}?text=${message}" target="_blank" data-action="open-whatsapp" class="bg-green-500 hover:bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-lg transition-colors" title="واتساب"><i class="fab fa-whatsapp"></i></a>
      <button data-action="delete-order" data-order-id="${order.id}" class="bg-red-500 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-lg transition-colors" title="حذف"><i class="fas fa-trash"></i></button>
    `
  }

  async updateOrderStatus(orderId, newStatus, selectElement) {
    selectElement.disabled = true
    selectElement.classList.add('opacity-50', 'cursor-not-allowed')
    try {
      await db.updateOrderStatus(orderId, newStatus)
      notifications.success('✅ تم تحديث حالة الطلب')
      await this.refreshData()
    } catch (error) {
      notifications.error('حدث خطأ في تحديث الحالة')
      selectElement.disabled = false
      selectElement.classList.remove('opacity-50', 'cursor-not-allowed')
    }
  }

  async deleteOrder(orderId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await db.deleteOrder(orderId)
      notifications.success('🗑️ تم حذف الطلب')
      await this.refreshData()
    } catch (error) {
      notifications.error('حدث خطأ في حذف الطلب')
    }
  }

  loadContentForEditing() {
    const form = document.getElementById('contentForm')
    if (!form) return
    const product = this.products[0]
    form.innerHTML = `
      <div class="grid md:grid-cols-2 gap-6">
        <div><label class="form-label">اسم العلامة التجارية:</label><input type="text" name="brand_name" class="form-input" value="${this.siteContent.brand_name || ''}"></div>
        <div><label class="form-label">سطر العلامة التجارية:</label><input type="text" name="brand_tagline" class="form-input" value="${this.siteContent.brand_tagline || ''}"></div>
        <div><label class="form-label">اسم المنتج:</label><input type="text" name="name" class="form-input" value="${product.name || ''}"></div>
        <div><label class="form-label">سعر المنتج:</label><input type="number" name="price" class="form-input" value="${product.price || ''}"></div>
      </div>
      <div><label class="form-label">الوصف الفرعي للمنتج:</label><textarea name="description" class="form-input">${product.description || ''}</textarea></div>
      <div><label class="form-label">طريقة الاستخدام:</label><textarea name="usage_instructions" class="form-input">${product.usage_instructions || ''}</textarea></div>
      <button type="submit" class="btn-primary"><i class="fas fa-save ml-2"></i> حفظ التغييرات</button>
    `
  }

  async saveContentChanges() {
    const contentForm = new FormData(document.getElementById('contentForm'))
    
    const siteUpdates = {
      brand_name: contentForm.get('brand_name'),
      brand_tagline: contentForm.get('brand_tagline'),
    }
    const productUpdates = {
      name: contentForm.get('name'),
      price: Number(contentForm.get('price')),
      description: contentForm.get('description'),
      usage_instructions: contentForm.get('usage_instructions'),
    }

    const loader = LoadingSpinner.show('#contentSection', { text: 'جاري الحفظ...' })
    try {
      await Promise.all([
        db.updateSiteContent(siteUpdates),
        db.updateProduct(this.products[0].id, productUpdates)
      ])
      notifications.success('💾 تم حفظ التغييرات')
    } catch (error) {
      notifications.error('حدث خطأ في حفظ التغييرات')
    } finally {
      loader.hide()
      await this.loadData()
    }
  }

  loadImageManagement() {
    const form = document.getElementById('imageForm')
    if (!form) return
    form.innerHTML = `
      <div><label class="form-label">اختر ملف صورة:</label><input type="file" id="productImageFile" class="form-input" accept="image/*"></div>
      <p class="text-sm text-secondary-500 my-2 text-center">أو</p>
      <div><label class="form-label">أدخل رابط صورة:</label><input type="url" id="productImageUrl" class="form-input" placeholder="https://example.com/image.jpg"></div>
      <button type="submit" class="btn-primary mt-4"><i class="fas fa-upload ml-2"></i> تحديث الصورة</button>
    `
    this.updateImagePreview(this.products[0].image_url)
  }

  async updateProductImage() {
    const urlInput = document.getElementById('productImageUrl')
    const fileInput = document.getElementById('productImageFile')
    
    const url = urlInput.value.trim()
    const file = fileInput.files[0]

    if (!url && !file) return notifications.error('يرجى اختيار صورة أو إدخال رابط')

    const loader = LoadingSpinner.show('#imagesSection', { text: 'جاري تحديث الصورة...' })
    try {
      let imageUrl = url
      if (file) {
        const filePath = `product-images/${this.products[0].id}-${Date.now()}`
        imageUrl = await db.uploadFile(file, 'products', filePath)
      }
      
      await db.updateProduct(this.products[0].id, { image_url: imageUrl })
      notifications.success('📸 تم تحديث الصورة بنجاح')
      this.products[0].image_url = imageUrl
      this.updateImagePreview(imageUrl)
      urlInput.value = ''
      fileInput.value = ''
    } catch (error) {
      console.error('Image upload error:', error)
      notifications.error('حدث خطأ في تحديث الصورة')
    } finally {
      loader.hide()
    }
  }
  
  updateImagePreview(src) {
    const preview = document.getElementById('imagePreview')
    if (!preview) return
    preview.innerHTML = src 
      ? `<img src="${src}" alt="معاينة" class="w-48 h-48 object-cover rounded-2xl shadow-lg mx-auto">`
      : `<div class="w-48 h-48 bg-secondary-100 rounded-2xl flex items-center justify-center text-secondary-400">لا توجد صورة</div>`
  }

  async changePassword() {
    const form = document.getElementById('passwordForm')
    const currentPassword = form.currentPassword.value
    const newPassword = form.newPassword.value
    const loader = LoadingSpinner.show('#securitySection', { text: 'جاري التغيير...' })
    try {
      const result = await auth.changePassword(currentPassword, newPassword)
      if (result.success) {
        notifications.success(result.message)
        form.reset()
      } else {
        notifications.error(result.message)
      }
    } catch (error) {
      notifications.error('حدث خطأ غير متوقع')
    } finally {
      loader.hide()
    }
  }

  async generateMockOrders() {
    if (!confirm('هل تريد إضافة 10 طلبات وهمية؟')) return
    const loader = LoadingSpinner.show('body', { overlay: true, text: 'جاري إضافة البيانات...' })
    try {
      const mockOrders = mockData.generateOrders(10).map(o => ({...o, total_amount: this.products[0].price}))
      await Promise.all(mockOrders.map(order => db.createOrder(order)))
      notifications.success('✨ تم إضافة البيانات التجريبية')
      await this.refreshData()
    } catch (error) {
      notifications.error('حدث خطأ في إضافة البيانات')
    } finally {
      loader.hide()
    }
  }
  
  async exportOrders() {
    if (!this.orders.length) return notifications.warning('لا توجد طلبات للتصدير')
    const data = this.orders.map(o => ({
      'الاسم': o.customer_name, 'الهاتف': o.customer_phone, 'العنوان': o.customer_address,
      'الملاحظات': o.order_notes, 'المبلغ': o.total_amount, 'الحالة': o.status,
      'التاريخ': formatters.date(o.created_at)
    }))
    utils.downloadCSV(data, `orders-${new Date().toISOString().split('T')[0]}.csv`)
    notifications.success('📥 تم تصدير البيانات')
  }

  destroy() {
    if (this.ordersSubscription) {
      subscriptions.unsubscribe(this.ordersSubscription)
      this.ordersSubscription = null
    }
  }
}
