"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiServices } from "@/lib/api"
import { Loader2, ArrowLeft, Package, Truck, CreditCard, User, Phone, MapPin, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const { orderService } = apiServices

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const res = await orderService.getSellerOrderById(id as string)
      setOrder(res.data.data)
    } catch (error) {
      console.error("Failed to fetch order details", error)
      toast.error(language === "ar" ? "فشل جلب تفاصيل الطلب" : "Failed to fetch order details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchOrderDetails()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-muted-foreground">{language === "ar" ? "الطلب غير موجود" : "Order not found"}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === "ar" ? "العودة للطلبات" : "Back to Orders"}
        </Button>
      </div>
    )
  }

  // مواءمة البيانات مع الـ Schema الجديد
  const {
    financials = {},
    payment = {},
    status = {},
    buyer = {},
    cancellation = {},
    items = [],
    isPrepared,
    source,
    createdAt,
    _id
  } = order

  const getStatusColor = (deliveryStatus: string) => {
    switch (deliveryStatus) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "shipped": return "bg-blue-100 text-blue-800"
      case "delivered": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {language === "ar" ? "تفاصيل الطلب" : "Order Details"}
              </h1>
              <Badge variant="outline" className="capitalize">{source}</Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">#{_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPrepared && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {language === "ar" ? "جاهز للشحن" : "Ready for Shipping"}
            </Badge>
          )}
          <Badge className={getStatusColor(status.delivery)}>
            {status.delivery?.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                {language === "ar" ? "المنتجات المطلوبة" : "Order Items"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {items.map((item: any, index: number) => (
                  <div key={index} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt="product"
                            width={64}
                            height={64}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {item.product?.title || (language === "ar" ? "منتج مباشر" : "Direct Product")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.price} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">
                      {item.price * item.quantity} {language === "ar" ? "ج.م" : "EGP"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Buyer & Shipping Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                {language === "ar" ? "بيانات المشتري والتوصيل" : "Buyer & Delivery"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-full"><User className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{language === "ar" ? "الاسم" : "Customer Name"}</p>
                    <p className="text-sm font-medium">{buyer.firstName} {buyer.lastName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-full"><Phone className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{language === "ar" ? "رقم الهاتف" : "Phone"}</p>
                    <p className="text-sm font-medium" dir="ltr">{buyer.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-full"><MapPin className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{language === "ar" ? "عنوان التوصيل" : "Delivery Address"}</p>
                    <p className="text-sm font-medium">{order.deliveryAddress || (language === "ar" ? "غير محدد" : "Not specified")}</p>
                  </div>
                </div>
                {status.secretCode && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full"><Clock className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground">{language === "ar" ? "كود الاستلام" : "Receipt Code"}</p>
                      <p className="text-sm font-mono font-bold text-primary">{status.secretCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Financials & Timeline */}
        <div className="space-y-6">
          {/* Financials Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                {language === "ar" ? "التفاصيل المالية" : "Financials"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-b pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{language === "ar" ? "المجموع" : "Subtotal"}</span>
                  <span className="text-primary">{financials.subtotal || order.subtotal} {language === "ar" ? "ج.م" : "EGP"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{language === "ar" ? "الشحن" : "Shipping"}</span>
                  <span className="text-primary">{financials.shippingFee || order.shippingFee} {language === "ar" ? "ج.م" : "EGP"}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                  <span className="text-primary">{financials.total || order.total} {language === "ar" ? "ج.م" : "EGP"}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{language === "ar" ? "طريقة الدفع" : "Payment"}</span>
                  <Badge variant="outline" className="uppercase text-[10px]">{payment.method}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{language === "ar" ? "حالة الدفع" : "Status"}</span>
                  <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'} className="text-[10px]">
                    {payment.status}
                  </Badge>
                </div>
                {/* خاص للبائع: عرض صافي الربح المتوقع */}
                {/* <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-primary-foreground/70">{language === "ar" ? "صافي ربحك" : "Your Payout"}</span>
                    <span className="font-bold text-primary">{financials.supplierPayout} {language === "ar" ? "ج.م" : "EGP"}</span>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {language === "ar" ? "الجدول الزمني" : "Timeline"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pl-6 border-l-2 border-muted space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                  <p className="text-xs font-bold">{language === "ar" ? "تم إنشاء الطلب" : "Order Created"}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                </div>

                {isPrepared && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-green-500 border-4 border-background" />
                    <p className="text-xs font-bold">{language === "ar" ? "تم التجهيز" : "Prepared"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {status.delivery === 'pending' ? (language === "ar" ? "في انتظار الشحن" : "Awaiting Shipping") : ""}
                    </p>
                  </div>
                )}

                {status.deliveredAt && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-background" />
                    <p className="text-xs font-bold">{language === "ar" ? "تم التوصيل" : "Delivered"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(status.deliveredAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}