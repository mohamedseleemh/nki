// Database Types
export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_notes?: string
  status: OrderStatus
  product_name: string
  product_price: number
  created_at: string
  updated_at: string
}

export type OrderStatus = "جديد" | "قيد التجهيز" | "تم التوصيل" | "ملغي"

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  benefits?: ProductBenefit[]
  usage_instructions?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductBenefit {
  title: string
  description: string
  icon: string
}

export interface SiteContent {
  id: string
  content_key: string
  content_value: string
  content_type: 'text' | 'boolean' | 'json' | 'html'
  updated_at: string
}

// Form Types
export interface OrderFormData {
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_notes?: string
}

export interface ProductFormData {
  name: string
  description?: string
  price: number
  image_url?: string
  benefits?: ProductBenefit[]
  usage_instructions?: string
  is_active: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface OrderStats {
  total: number
  new: number
  processing: number
  delivered: number
  cancelled: number
  todayOrders: number
  totalRevenue: number
}

// Component Props Types
export interface AdminDashboardProps {
  onBack: () => void
}

export interface OrderFormProps {
  onSubmit?: (data: OrderFormData) => void
  loading?: boolean
}

// Validation Error Types
export interface ValidationError {
  field: string
  message: string
}

export interface FormErrors {
  [key: string]: string
}

// Upload Types
export interface UploadResult {
  url: string
  public_id?: string
  secure_url?: string
}

// Configuration Types
export interface AppConfig {
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey?: string
  }
  whatsapp: {
    number: string
  }
  app: {
    url: string
    name: string
  }
}