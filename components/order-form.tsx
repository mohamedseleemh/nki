"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { MessageCircle, Shield, Truck, CreditCard, CheckCircle } from "lucide-react"
import { validateOrder } from "@/lib/validations"
import { config } from "@/lib/config"
import type { OrderFormData, FormErrors } from "@/lib/types"

interface OrderFormProps {
  onSubmit?: (data: OrderFormData) => void
  loading?: boolean
}

export function OrderForm({ onSubmit, loading: externalLoading }: OrderFormProps) {
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    customer_notes: "",
  })
  const [internalLoading, setInternalLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isSubmitting = externalLoading || internalLoading

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setErrors({})

    // Validate form data
    const validation = validateOrder(orderForm)
    if (!validation.success) {
      const formErrors: FormErrors = {}
      validation.error.errors.forEach((error) => {
        const field = error.path.join('.')
        formErrors[field] = error.message
      })
      setErrors(formErrors)
      return
    }

    // If external onSubmit is provided, use it
    if (onSubmit) {
      onSubmit(validation.data)
      return
    }

    // Otherwise, handle submission internally
    setInternalLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'فشل في إرسال الطلب')
      }

      // إنشاء رسالة واتساب
      const whatsappMessage = `مرحباً، تم تسجيل طلبي بنجاح:

🌟 المنتج: سيروم كيكه من سندرين بيوتي
💰 السعر: 350 جنيه (شحن مجاني)

📋 بيانات الطلب:
الاسم: ${orderForm.customer_name}
الهاتف: ${orderForm.customer_phone}
العنوان: ${orderForm.customer_address}
${orderForm.customer_notes ? `ملاحظات: ${orderForm.customer_notes}` : ""}

شكراً لثقتكم في منتجاتنا! 💕`

      const whatsappUrl = `https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, "_blank")

      // إعادة تعيين النموذج
      setOrderForm({ 
        customer_name: "", 
        customer_phone: "", 
        customer_address: "", 
        customer_notes: "" 
      })
      setErrors({})
      alert("تم تسجيل طلبك بنجاح! سنتواصل معك قريباً 💕")
    } catch (error) {
      console.error("Error submitting order:", error)
      setSubmitError(error instanceof Error ? error.message : "حدث خطأ في تسجيل الطلب")
    } finally {
      setInternalLoading(false)
    }
  }

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <section id="order-form" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-4xl font-bold text-center mb-16 gradient-text">اطلبي الآن</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Shield className="w-4 h-4 text-green-600" />
            <span>طلب آمن 100%</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>شحن مجاني</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>دفع عند الاستلام</span>
          </div>
        </div>

        {submitError && <ErrorMessage message={submitError} className="mb-6" />}

        <Card className="shadow-2xl border-0 card-elegant hover-lift">
          <CardContent className="p-8">
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
                <Input
                  required
                  value={orderForm.customer_name}
                  onChange={(e) => {
                    handleInputChange('customer_name', e.target.value)
                  }}
                  placeholder="أدخل اسمك الكامل"
                  className={`text-lg py-6 border-2 transition-colors ${
                    errors.customer_name ? "border-red-500 focus:border-red-500" : "focus:border-primary"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                <Input
                  required
                  type="tel"
                  value={orderForm.customer_phone}
                  onChange={(e) => {
                    handleInputChange('customer_phone', e.target.value)
                  }}
                  placeholder="01xxxxxxxxx"
                  className={`text-lg py-6 border-2 transition-colors ${
                    errors.customer_phone ? "border-red-500 focus:border-red-500" : "focus:border-primary"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.customer_phone && <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">العنوان بالتفصيل *</label>
                <Textarea
                  required
                  value={orderForm.customer_address}
                  onChange={(e) => {
                    handleInputChange('customer_address', e.target.value)
                  }}
                  placeholder="المحافظة، المدينة، الشارع، رقم المبنى..."
                  className={`min-h-24 border-2 transition-colors arabic-text ${
                    errors.customer_address ? "border-red-500 focus:border-red-500" : "focus:border-primary"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.customer_address && <p className="text-red-500 text-sm mt-1">{errors.customer_address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                <Textarea
                  value={orderForm.customer_notes}
                  onChange={(e) => handleInputChange('customer_notes', e.target.value)}
                  placeholder="أي ملاحظات خاصة بالطلب..."
                  className="min-h-20 border-2 focus:border-primary arabic-text"
                  disabled={isSubmitting}
                />
              </div>

              <div className="card-elegant p-6 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center text-lg font-semibold mb-4">
                  <span>المجموع:</span>
                  <span className="text-primary text-2xl">350 جنيه</span>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>شحن مجاني لجميع المحافظات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>الدفع عند الاستلام</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>ضمان الاستبدال خلال 7 أيام</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>توصيل خلال 24-48 ساعة</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-lg py-6 btn-gradient shadow-glow hover-lift"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="ml-2" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    تأكيد الطلب عبر واتساب
                    <MessageCircle className="w-5 h-5 mr-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
