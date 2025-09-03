"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { orderService, type Order } from "@/lib/supabase"
import { RefreshCw, Package, Clock, CheckCircle, XCircle, Search, Download, Phone, MessageCircle } from "lucide-react"

interface AdminDashboardProps {
  onBack: () => void
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_phone.includes(searchTerm) ||
          order.customer_address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error("Error loading orders:", error)
      alert("حدث خطأ في تحميل الطلبات")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: Order["status"]) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      loadOrders()
      alert("تم تحديث حالة الطلب بنجاح")
    } catch (error) {
      console.error("Error updating order:", error)
      alert("حدث خطأ في تحديث الطلب")
    }
  }

  const deleteOrder = async (orderId: number) => {
    if (!confirm("هل تريد حذف هذا الطلب نهائياً؟")) return

    try {
      await orderService.deleteOrder(orderId)
      loadOrders()
      alert("تم حذف الطلب بنجاح")
    } catch (error) {
      console.error("Error deleting order:", error)
      alert("حدث خطأ في حذف الطلب")
    }
  }

  const stats = {
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
  }

  const exportOrders = () => {
    const csvContent = [
      ["رقم الطلب", "الاسم", "الهاتف", "العنوان", "الحالة", "التاريخ", "الملاحظات"],
      ...filteredOrders.map((order) => [
        order.id,
        order.customer_name,
        order.customer_phone,
        order.customer_address,
        order.status,
        new Date(order.created_at).toLocaleDateString("ar-EG"),
        order.customer_notes || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      جديد: { variant: "default" as const, icon: Package, color: "bg-blue-500" },
      "قيد التجهيز": { variant: "secondary" as const, icon: Clock, color: "bg-yellow-500" },
      "تم التوصيل": { variant: "default" as const, icon: CheckCircle, color: "bg-green-500" },
      ملغي: { variant: "destructive" as const, icon: XCircle, color: "bg-red-500" },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
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
                onClick={loadOrders}
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
                  onClick={loadOrders}
                  variant="outline"
                  className="gap-2 bg-transparent hover-lift"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  تحديث
                </Button>
              </div>
            </div>

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
                          <td className="p-4 font-mono">#{order.id}</td>
                          <td className="p-4 font-medium">{order.customer_name}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{order.customer_phone}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`tel:${order.customer_phone}`, "_self")}
                                className="p-1 h-6 w-6"
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
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                              className="border rounded-lg p-2 bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm"
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
                                  window.open(`https://wa.me/2${order.customer_phone.replace(/^0/, "")}`, "_blank")
                                }
                                variant="outline"
                                size="sm"
                                className="gap-1 text-green-600 hover:bg-green-50"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => deleteOrder(order.id)}
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                              >
                                <XCircle className="w-3 h-3" />
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
