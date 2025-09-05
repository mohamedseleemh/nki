import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Admin client with service role key for server-side operations
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey || config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Admin-only operations
export const adminService = {
  // Get all orders with admin privileges
  async getAllOrders() {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete order
  async deleteOrder(orderId: string) {
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw error
  },

  // Product management
  async createProduct(productData: any) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProduct(productId: string, productData: any) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteProduct(productId: string) {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error
  },

  // Site content management
  async updateSiteContent(contentKey: string, contentValue: string, contentType = 'text') {
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .upsert({
        content_key: contentKey,
        content_value: contentValue,
        content_type: contentType,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getSiteContent(contentKey?: string) {
    let query = supabaseAdmin.from('site_content').select('*')
    
    if (contentKey) {
      query = query.eq('content_key', contentKey)
    }

    const { data, error } = await query

    if (error) throw error
    return contentKey ? data?.[0] : data
  }
}