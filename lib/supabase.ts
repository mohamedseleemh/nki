import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://nulsebapvygnnskageip.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bHNlYmFwdnlnbm5za2FnZWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NzMxMjMsImV4cCI6MjA3MjQ0OTEyM30.ZPDf8__OJwFQP7bz4q1EkVzXye78zHKn8AlDHaJy-JQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// أنواع البيانات
export interface Order {
  id: number
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_notes?: string
  status: "جديد" | "قيد التجهيز" | "تم التوصيل" | "ملغي"
  product_name: string
  product_price: number
  created_at: string
  updated_at: string
}

// دوال مساعدة لإدارة الطلبات
export const orderService = {
  // إنشاء طلب جديد
  async createOrder(orderData: Omit<Order, "id" | "created_at" | "updated_at" | "product_name" | "product_price">) {
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
  async updateOrderStatus(orderId: number, status: Order["status"]) {
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", orderId).select().single()

    if (error) throw error
    return data
  },

  // حذف طلب
  async deleteOrder(orderId: number) {
    const { error } = await supabase.from("orders").delete().eq("id", orderId)

    if (error) throw error
  },
}
