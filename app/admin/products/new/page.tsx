'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import ImageUploader from "@/components/ImageUploader"
import { categoryService, productService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { Beaker, AlertTriangle, Box, DollarSign, ImageIcon, CheckCircle2, Scale } from "lucide-react"

export default function AddProductForm({ onClose }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState("basic")

  const [product, setProduct] = useState({
    title: "",
    description: "",
    chemicalName: "",
    purity: 99,
    price: "",
    hazardClass: "non-hazardous",
    category: "",
    quantity: 1,
    images: [],
    productType: "commercial", // جديد: معملي أم تجاري
    unit: "kg",               // جديد: وحدة القياس
    isFeatured: false,
    status: "pending"
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories()
        setCategories(res.data)
      } catch {
        toast.error("فشل في تحميل الفئات")
      }
    }
    fetchCategories()
  }, [])

  const calculatePayout = (price) => {
    const p = parseFloat(price) || 0;
    let commissionRate = p >= 2000 ? 1 :2;
    let sellerPercentage = 100 - commissionRate;
    const payout = (p * sellerPercentage) / 100;

    return {
      payout: payout.toFixed(2),
      percentage: sellerPercentage,
      commission: commissionRate
    };
  };

  const { payout, percentage } = calculatePayout(product.price)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product.category || product.images.length === 0 || !product.chemicalName) {
      toast.error("يرجى إكمال البيانات الأساسية والصور")
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...product,
        seller: user._id,
        price: parseFloat(product.price),
        purity: parseFloat(product.purity),
        quantity: parseFloat(product.quantity), // الموديل يقبل Number
        sellerPercentage: percentage,
        status: "pending"
      }

      await productService.createProduct(payload)
      toast.success("تم إرسال المادة الكيميائية للمراجعة بنجاح")
      onClose()
    } catch (err) {
      toast.error("خطأ في الخادم: تعذر إضافة المنتج")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Beaker className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">إدراج مادة كيميائية جديدة</CardTitle>
            <CardDescription>أدخل التفاصيل الدقيقة لضمان سرعة الموافقة على المنتج</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="basic" className="gap-2"><Box className="w-4 h-4" /> البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="chemical" className="gap-2"><AlertTriangle className="w-4 h-4" /> الخصائص والخطورة</TabsTrigger>
              <TabsTrigger value="pricing" className="gap-2"><DollarSign className="w-4 h-4" /> السعر والمخزون</TabsTrigger>
            </TabsList>

            {/* القسم الأول: البيانات الأساسية */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع المنتج</Label>
                  <Select value={product.productType} onValueChange={(v) => setProduct({ ...product, productType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">تجاري (Commercial)</SelectItem>
                      <SelectItem value="lab">معملي (Laboratory)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الفئة التصنيفية</Label>
                  <Select value={product.category} onValueChange={(v) => setProduct({ ...product, category: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الاسم التجاري للمنتج</Label>
                <Input name="title" placeholder="مثلاً: هيدروكسيد الصوديوم عالي الجودة" value={product.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>وصف المنتج والاستخدامات</Label>
                <Textarea name="description" placeholder="اذكر مواصفات المادة، التعبئة، وتطبيقاتها..." className="h-32" value={product.description} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> صور المنتج
                </Label>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {product.images.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border-2 border-muted">
                      <img src={img} className="w-full h-24 object-cover" alt="product" />
                      <button type="button" onClick={() => setProduct(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                </div>
                <ImageUploader onUpload={(url) => setProduct(prev => ({ ...prev, images: [...prev.images, url] }))} />
              </div>
              <Button type="button" className="w-full" onClick={() => setActiveTab("chemical")}>التالي: التفاصيل الكيميائية</Button>
            </TabsContent>

            {/* القسم الثاني: التفاصيل الكيميائية */}
            <TabsContent value="chemical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم الكيميائي (IUPAC)</Label>
                  <Input name="chemicalName" placeholder="مثلاً: Sodium Hydroxide" value={product.chemicalName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>درجة النقاوة (%)</Label>
                  <Input name="purity" type="number" step="0.01" value={product.purity} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>تصنيف الخطورة (Hazard Class)</Label>
                  <Select value={product.hazardClass} onValueChange={(v) => setProduct({ ...product, hazardClass: v })}>
                    <SelectTrigger className={product.hazardClass !== 'non-hazardous' ? "border-orange-500 text-orange-600" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-hazardous">غير خطرة (Non-hazardous)</SelectItem>
                      <SelectItem value="flammable">قابلة للاشتعال (Flammable)</SelectItem>
                      <SelectItem value="corrosive">آكلة (Corrosive)</SelectItem>
                      <SelectItem value="toxic">سامة (Toxic)</SelectItem>
                      <SelectItem value="oxidizer">مؤكسدة (Oxidizer)</SelectItem>
                      <SelectItem value="explosive">متفجرة (Explosive)</SelectItem>
                      <SelectItem value="radioactive">إشعاعية (Radioactive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveTab("basic")}>السابق</Button>
                <Button type="button" className="flex-[2]" onClick={() => setActiveTab("pricing")}>التالي: التسعير</Button>
              </div>
            </TabsContent>

            {/* القسم الثالث: التسعير والمخزون */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>وحدة القياس</Label>
                  <Select value={product.unit} onValueChange={(v) => setProduct({ ...product, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">كيلوجرام (kg)</SelectItem>
                      <SelectItem value="ton">طن (ton)</SelectItem>
                      <SelectItem value="g">جرام (g)</SelectItem>
                      <SelectItem value="mg">مليجرام (mg)</SelectItem>
                      <SelectItem value="l">لتر (l)</SelectItem>
                      <SelectItem value="ml">مليليتر (ml)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>السعر لكل {product.unit}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">EGP</span>
                    <Input name="price" type="number" className="pl-10" placeholder="0.00" value={product.price} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الكمية المتاحة ({product.unit})</Label>
                  <Input name="quantity" type="number" step="0.1" value={product.quantity} onChange={handleChange} required />
                </div>
              </div>

              {/* بطاقة تحليل الربح */}
              <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-4 h-4" /> ملخص مبيعات الوحدة الواحدة
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">السعر المعروض للمشتري:</span>
                    <span>{product.price || 0} ج.م / {product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عمولة المنصة ({100 - percentage}%):</span>
                    <span className="text-destructive">-{(parseFloat(product.price || 0) - payout).toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <span>صافي ما ستستلمه:</span>
                    <span className="text-green-600">{payout} ج.م</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveTab("chemical")}>السابق</Button>
                <Button type="submit" className="flex-[2]" disabled={loading}>
                  {loading ? "جاري المعالجة..." : "إرسال المادة للمراجعة"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  )
}