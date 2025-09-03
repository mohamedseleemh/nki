"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Users, Settings, Eye, Edit, Trash2, Plus } from "lucide-react"

export default function AdminDashboard() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      name: "فاطمة أحمد",
      phone: "01234567890",
      address: "القاهرة، مدينة نصر، شارع مصطفى النحاس",
      status: "جديد",
      date: "2024-01-15",
      notes: "يرجى الاتصال قبل التوصيل",
    },
    {
      id: 2,
      name: "مريم محمد",
      phone: "01987654321",
      address: "الجيزة، المهندسين، شارع جامعة الدول العربية",
      status: "قيد التجهيز",
      date: "2024-01-14",
      notes: "",
    },
  ])

  const [productInfo, setProductInfo] = useState({
    name: "سيروم كيكه",
    price: "350",
    description: "سيروم متطور للعناية بالبشرة ينظم إفراز الزيوت ويقلل حجم المسام مع فيتامين سي المضاد للأكسدة",
  })

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const deleteOrder = (orderId: number) => {
    setOrders(orders.filter((order) => order.id !== orderId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جديد":
        return "bg-blue-100 text-blue-800"
      case "قيد التجهيز":
        return "bg-yellow-100 text-yellow-800"
      case "تم التوصيل":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة إدارة سندرين بيوتي</h1>
              <p className="text-sm text-muted-foreground">إدارة الطلبات والمنتجات</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            <Eye className="w-4 h-4 ml-2" />
            عرض الموقع
          </Button>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Settings className="w-4 h-4" />
              إدارة المنتج
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <Users className="w-4 h-4" />
              الإحصائيات
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
              <Badge variant="secondary">{orders.length} طلب</Badge>
            </div>

            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{order.name}</h3>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="text-muted-foreground">📱 {order.phone}</p>
                        <p className="text-muted-foreground">📍 {order.address}</p>
                        {order.notes && <p className="text-sm bg-muted p-2 rounded">💬 {order.notes}</p>}
                        <p className="text-xs text-muted-foreground">📅 {order.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={() => deleteOrder(order.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="جديد">جديد</SelectItem>
                          <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
                          <SelectItem value="تم التوصيل">تم التوصيل</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={() => window.open(`https://wa.me/2${order.phone}`, "_blank")}>
                        تواصل عبر واتساب
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <h2 className="text-2xl font-bold">إدارة معلومات المنتج</h2>

            <Card>
              <CardHeader>
                <CardTitle>تعديل معلومات المنتج</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المنتج</label>
                  <Input
                    value={productInfo.name}
                    onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">السعر (جنيه)</label>
                  <Input
                    value={productInfo.price}
                    onChange={(e) => setProductInfo({ ...productInfo, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">وصف المنتج</label>
                  <Textarea
                    value={productInfo.description}
                    onChange={(e) => setProductInfo({ ...productInfo, description: e.target.value })}
                    className="min-h-32"
                  />
                </div>
                <Button className="w-full">
                  <Edit className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إدارة صور المنتج</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">اسحب الصور هنا أو اضغط للاختيار</p>
                  <Button variant="outline">اختيار صور</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-2xl font-bold">الإحصائيات</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{orders.length}</div>
                  <p className="text-muted-foreground">إجمالي الطلبات</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {orders.filter((o) => o.status === "جديد").length}
                  </div>
                  <p className="text-muted-foreground">طلبات جديدة</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {orders.filter((o) => o.status === "تم التوصيل").length}
                  </div>
                  <p className="text-muted-foreground">طلبات مكتملة</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ملخص المبيعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي المبيعات:</span>
                    <span className="font-bold">{orders.length * 350} جنيه</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الطلبات المكتملة:</span>
                    <span className="font-bold">
                      {orders.filter((o) => o.status === "تم التوصيل").length * 350} جنيه
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الطلبات المعلقة:</span>
                    <span className="font-bold">
                      {orders.filter((o) => o.status !== "تم التوصيل").length * 350} جنيه
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
