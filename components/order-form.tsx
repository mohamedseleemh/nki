"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Shield, Truck, CreditCard, CheckCircle } from "lucide-react"
import { orderService } from "@/lib/supabase"

interface OrderFormData {
  name: string
  phone: string
  address: string
  notes: string
}

export function OrderForm() {
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<OrderFormData>>({})

  const validateForm = () => {
    const newErrors: Partial<OrderFormData> = {}

    if (!orderForm.name.trim()) {
      newErrors.name = "الاسم مطلوب"
    }

    if (!orderForm.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب"
    } else if (!/^01[0-9]{9}$/.test(orderForm.phone.replace(/\s/g, ""))) {
      newErrors.phone = "رقم الهاتف غير صحيح"
    }

    if (!orderForm.address.trim()) {
      newErrors.address = "العنوان مطلوب"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // حفظ الطلب في قاعدة البيانات
      await orderService.createOrder({
        customer_name: orderForm.name,
        customer_phone: orderForm.phone,
        customer_address: orderForm.address,
        customer_notes: orderForm.notes,
        status: "جديد",
      })

      // إنشاء رسالة واتساب
      const whatsappMessage = `مرحباً، تم تسجيل طلبي بنجاح:

🌟 المنتج: سيروم كيكه من سندرين بيوتي
💰 السعر: 350 جنيه (شحن مجاني)

📋 بيانات الطلب:
الاسم: ${orderForm.name}
الهاتف: ${orderForm.phone}
العنوان: ${orderForm.address}
${orderForm.notes ? `ملاحظات: ${orderForm.notes}` : ""}

شكراً لثقتكم في منتجاتنا! 💕`

      const whatsappUrl = `https://wa.me/201556133633?text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, "_blank")

      // إعادة تعيين النموذج
      setOrderForm({ name: "", phone: "", address: "", notes: "" })
      setErrors({})
      alert("تم تسجيل طلبك بنجاح! سنتواصل معك قريباً 💕")
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("حدث خطأ في تسجيل الطلب. يرجى المحاولة مرة أخرى")
    } finally {
      setIsSubmitting(false)
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

        <Card className="shadow-2xl border-0 card-elegant hover-lift">
          <CardContent className="p-8">
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
                <Input
                  required
                  value={orderForm.name}
                  onChange={(e) => {
                    setOrderForm({ ...orderForm, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: undefined })
                  }}
                  placeholder="أدخل اسمك الكامل"
                  className={`text-lg py-6 border-2 transition-colors ${errors.name ? "border-red-500 focus:border-red-500" : "focus:border-primary"}`}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                <Input
                  required
                  type="tel"
                  value={orderForm.phone}
                  onChange={(e) => {
                    setOrderForm({ ...orderForm, phone: e.target.value })
                    if (errors.phone) setErrors({ ...errors, phone: undefined })
                  }}
                  placeholder="01xxxxxxxxx"
                  className={`text-lg py-6 border-2 transition-colors ${errors.phone ? "border-red-500 focus:border-red-500" : "focus:border-primary"}`}
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">العنوان بالتفصيل *</label>
                <Textarea
                  required
                  value={orderForm.address}
                  onChange={(e) => {
                    setOrderForm({ ...orderForm, address: e.target.value })
                    if (errors.address) setErrors({ ...errors, address: undefined })
                  }}
                  placeholder="المحافظة، المدينة، الشارع، رقم المبنى..."
                  className={`min-h-24 border-2 transition-colors arabic-text ${errors.address ? "border-red-500 focus:border-red-500" : "focus:border-primary"}`}
                  disabled={isSubmitting}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                <Textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
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
                {isSubmitting ? "جاري التسجيل..." : "تأكيد الطلب عبر واتساب"}
                <MessageCircle className="w-5 h-5 mr-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
