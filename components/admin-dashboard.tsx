"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useOrders } from "@/lib/hooks/use-orders"
import { maskPhoneNumber, formatPhoneForWhatsApp } from "@/lib/utils/phone-utils"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RefreshCw, Package, Clock, CheckCircle, XCircle, Search, Download, Phone, MessageCircle } from "lucide-react"
import type { Order } from "@/lib/types"

interface AdminDashboardProps {
  onBack: () => void
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { orders, loading, error, refetch, updateOrderStatus, deleteOrder } = useOrders()
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // تصفية الطلبات باستخدام useMemo لتحسين الأداء
  useEffect(() => {
    setFilteredOrders(filteredOrdersData)
  }, [orders, searchTerm, statusFilter])

  const filteredOrdersData = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm) ||
        order.customer_address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  // تحسين معالجة تحديث حالة الطلب
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setActionLoading(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error("Error updating order:", error)
      alert("حدث خطأ في تحديث الطلب")
    } finally {
      setActionLoading(null)
    }
  }

  // تحسين معالجة حذف الطلب
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("هل تريد حذف هذا الطلب نهائياً؟")) return

    setActionLoading(orderId)
    try {
      await deleteOrder(orderId)
    } catch (error) {
      console.error("Error deleting order:", error)
      alert("حدث خطأ في حذف الطلب")
    } finally {
      setActionLoading(null)
    }
  }

  // حساب الإحصائيات باستخدام useMemo
  const stats = useMemo(() => ({
    total: orders.length,
    new: orders.filter((o) => o.status === "جديد").length,
    processing: orders.filter((o) => o.status === "قيد التجهيز").length,
    delivered: orders.filter((o) => o.status === "تم التوصيل").length,
    cancelled: orders.filter((o) => o.status === "ملغي").length,
    todayOrders: orders.filter((o) => {
      const today = new Date().toDateString()
      const orderDate = new Date(o.created_at).toDateString()
      return today === orderDate
    }).length,
    totalRevenue: orders.filter((o) => o.status === "تم التوصيل").length * 350,
  }), [orders])

  // تحسين تصدير البيانات
  const exportOrders = () => {
    try {
      const csvContent = [
        ["رقم الطلب", "الاسم", "الهاتف", "العنوان", "الحالة", "التاريخ", "الملاحظات"],
        ...filteredOrders.map((order) => [
          order.id.slice(0, 8),
          order.customer_name,
          order.customer_phone,
          order.customer_address.replace(/,/g, ';'), // استبدال الفواصل لتجنب مشاكل CSV
          order.status,
          new Date(order.created_at).toLocaleDateString("ar-EG"),
          (order.customer_notes || "").replace(/,/g, ';'),
        ]),
      ]
        .map((row) => row.map(cell => `"${cell}"`).join(",")) // تغليف الخلايا بعلامات اقتباس
        .join("\n")

      const blob = new Blob(['\ufeff' + csvContent], { type: "text/csv;charset=utf-8;" }) // إضافة BOM للدعم العربي
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      
      // تنظيف الذاكرة
      setTimeout(() => URL.revokeObjectURL(link.href), 100)
    } catch (error) {
      console.error("Error exporting orders:", error)
      alert("حدث خطأ في تصدير البيانات")
    }
  }

  // عرض حالة التحميل
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">لوحة الإدارة - سندرين بيوتي</h1>
            <p className="text-white/80">إدارة طلبات منتج كيكه</p>
          </div>
          <Button onClick={onBack} variant="outline" className="text-primary bg-white hover:bg-gray-50 hover-lift">
            العودة للموقع
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b p-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex gap-4">
            {[
              { id: "dashboard", label: "الصفحة الرئيسية", icon: Package },
              { id: "orders", label: "إدارة الطلبات", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-2 hover-lift"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إحصائيات سريعة</h2>
              <Button
                onClick={refetch}
                variant="outline"
                className="gap-2 bg-transparent hover-lift"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                تحديث
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
              {[
                { label: "إجمالي الطلبات", value: stats.total, color: "bg-blue-500", icon: Package },
                { label: "طلبات اليوم", value: stats.todayOrders, color: "bg-indigo-500", icon: Clock },
                { label: "طلبات جديدة", value: stats.new, color: "bg-green-500", icon: Package },
                { label: "قيد التجهيز", value: stats.processing, color: "bg-yellow-500", icon: Clock },
                { label: "تم التوصيل", value: stats.delivered, color: "bg-purple-500", icon: CheckCircle },
                { label: "ملغية", value: stats.cancelled, color: "bg-red-500", icon: XCircle },
                {
                  label: "إجمالي الإيرادات",
                  value: `${stats.totalRevenue.toLocaleString()} ج`,
                  color: "bg-emerald-500",
                  icon: Package,
                },
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow hover-lift">
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-2xl font-bold mb-2">{stat.value}</div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold">إدارة الطلبات ({filteredOrders.length})</h2>

              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="بحث بالاسم، الهاتف، أو العنوان..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 w-full md:w-64"
                    disabled={loading}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-lg p-2 bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="جديد">جديد</option>
                  <option value="قيد التجهيز">قيد التجهيز</option>
                  <option value="تم التوصيل">تم التوصيل</option>
                  <option value="ملغي">ملغي</option>
                </select>

                <Button onClick={exportOrders} variant="outline" className="gap-2 hover-lift bg-transparent">
                  <Download className="w-4 h-4" />
                  تصدير
                </Button>

                <Button
                  onClick={refetch}
                  variant="outline"
                  className="gap-2 bg-transparent hover-lift"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  تحديث
                </Button>
              </div>
            </div>

            {error && <ErrorMessage message={error} className="mb-6" />}

            <Card className="shadow-lg hover-lift">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-4 text-right font-semibold">رقم الطلب</th>
                        <th className="p-4 text-right font-semibold">الاسم</th>
                        <th className="p-4 text-right font-semibold">الهاتف</th>
                        <th className="p-4 text-right font-semibold">العنوان</th>
                        <th className="p-4 text-right font-semibold">الحالة</th>
                        <th className="p-4 text-right font-semibold">التاريخ</th>
                        <th className="p-4 text-right font-semibold">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-mono">#{order.id.slice(0, 8)}</td>
                          <td className="p-4 font-medium">{order.customer_name}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{maskPhoneNumber(order.customer_phone)}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`tel:${order.customer_phone}`, "_self")}
                                className="p-1 h-6 w-6"
                                disabled={actionLoading === order.id}
                              >
                                <Phone className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="truncate" title={order.customer_address}>
                              {order.customer_address}
                            </div>
                            {order.customer_notes && (
                              <div className="text-xs text-muted-foreground mt-1" title={order.customer_notes}>
                                ملاحظة: {order.customer_notes}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order["status"])}
                              className="border rounded-lg p-2 bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                              disabled={actionLoading === order.id}
                            >
                              <option value="جديد">جديد</option>
                              <option value="قيد التجهيز">قيد التجهيز</option>
                              <option value="تم التوصيل">تم التوصيل</option>
                              <option value="ملغي">ملغي</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  window.open(`https://wa.me/${formatPhoneForWhatsApp(order.customer_phone)}`, "_blank")
                                }
                                variant="outline"
                                size="sm"
                                className="gap-1 text-green-600 hover:bg-green-50"
                                disabled={actionLoading === order.id}
                              >
                                {actionLoading === order.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <MessageCircle className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                onClick={() => handleDeleteOrder(order.id)}
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                                disabled={actionLoading === order.id}
                              >
                                {actionLoading === order.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            {searchTerm || statusFilter !== "all"
                              ? "لا توجد طلبات تطابق البحث"
                              : "لا توجد طلبات حتى الآن"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}