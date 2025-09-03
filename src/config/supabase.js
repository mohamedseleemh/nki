import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database helper functions
export const db = {
  // Auth
  async loginAdmin(password) {
    const { data, error } = await supabase.rpc('verify_admin_password', { password_attempt: password })
    if (error) throw error
    return data
  },

  async updateAdminPassword(newPassword) {
    const { error } = await supabase
      .from('site_content')
      .update({ content_value: newPassword, updated_at: new Date().toISOString() })
      .eq('content_key', 'admin_password')
    if (error) throw error
    return true
  },

  // Orders
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getOrders(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteOrder(orderId) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
    
    if (error) throw error
    return true
  },

  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
    
    if (error) throw error
    return data
  },

  async updateProduct(productId, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Site Content
  async getSiteContent() {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
    
    if (error) throw error
    
    return data.reduce((acc, item) => {
      acc[item.content_key] = item.content_value
      return acc
    }, {})
  },

  async updateSiteContent(updates) {
    const updatePromises = Object.entries(updates).map(([key, value]) =>
      supabase
        .from('site_content')
        .update({ content_value: value, updated_at: new Date().toISOString() })
        .eq('content_key', key)
    )
    
    const results = await Promise.all(updatePromises)
    const someError = results.find(res => res.error)
    if (someError) throw someError.error
    
    return true
  },

  // Analytics
  async getOrderStats() {
    const { data, error } = await supabase
      .rpc('get_order_stats')

    if (error) throw error
    return data[0]
  },

  // Storage
  async uploadFile(file, bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) throw error
    
    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return urlData.publicUrl
  }
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToOrders(callback) {
    return supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        callback
      )
      .subscribe()
  },

  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}
