import { createClient } from "@supabase/supabase-js"
import { config } from "./config"
import type { Order, Product, SiteContent } from "./types"

export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

// دوال مساعدة لإدارة الطلبات
export const orderService = {
  // إنشاء طلب جديد
  async createOrder(orderData: {
    customer_name: string
    customer_phone: string
    customer_address: string
    customer_notes?: string
  }) {
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          ...orderData,
          product_name: "سيروم كيكه",
          product_price: 350.0,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // جلب جميع الطلبات
  async getAllOrders() {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data as Order[]
  },

  // تحديث حالة الطلب
  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", orderId).select().single()

    if (error) throw error
    return data
  },

  // حذف طلب
  async deleteOrder(orderId: string) {
    const { error } = await supabase.from("orders").delete().eq("id", orderId)

    if (error) throw error
  },
}

// Product service
export const productService = {
  async getProducts(activeOnly = true) {
    let query = supabase.from("products").select("*")
    
    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) throw error
    return data as Product[]
  },

  async getProduct(id: string) {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()
    if (error) throw error
    return data as Product
  }
}

// Site content service
export const siteContentService = {
  async getContent(key?: string) {
    let query = supabase.from("site_content").select("*")
    
    if (key) {
      query = query.eq("content_key", key)
    }

    const { data, error } = await query
    if (error) throw error
    return key ? (data?.[0] as SiteContent) : (data as SiteContent[])
  }
}