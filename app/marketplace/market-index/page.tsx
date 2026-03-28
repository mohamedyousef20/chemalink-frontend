"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Loader2, 
  AlertCircle,
  PlusCircle
} from "lucide-react";
import { marketplaceService } from "@/lib/api";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function MarketIndexPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArabic, setIsArabic] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    quantity: "",
    city: ""
  });

  useEffect(() => {
    setIsArabic(document.documentElement.lang === 'ar');
    fetchMarketPrices();
  }, []);

  const fetchMarketPrices = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.market.getPrices();
      if (response.data.success) {
        setPrices(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching market prices:", error);
      toast.error(isArabic ? "فشل في تحميل بيانات السوق" : "Failed to load market data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.price || !formData.quantity || !formData.city) {
      toast.error(isArabic ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await marketplaceService.market.addOffer({
        productName: formData.productName,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        city: formData.city
      });

      if (response.data.success) {
        toast.success(isArabic ? "تم إضافة العرض بنجاح" : "Offer added successfully");
        setIsDialogOpen(false);
        setFormData({ productName: "", price: "", quantity: "", city: "" });
        fetchMarketPrices();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isArabic ? "فشل في إضافة العرض" : "Failed to add offer"));
    } finally {
      setSubmitting(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendText = (trend: string) => {
    if (isArabic) {
      switch (trend) {
        case 'up': return "صعود";
        case 'down': return "هبوط";
        default: return "مستقر";
      }
    }
    return trend.charAt(0).toUpperCase() + trend.slice(1);
  };

  if (loading && prices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{isArabic ? "جاري تحميل البورصة..." : "Loading market index..."}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {isArabic ? "بورصة أسعار المواد الكيميائية" : "Chemical Market Index"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? "مؤشر أسعار السوق بناءً على عروض الموردين خلال 24 ساعة" : "Real-time market price index based on supplier offers (Last 24h)"}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              {isArabic ? "إضافة عرض سعر" : "Add Price Offer"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir={isArabic ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle>{isArabic ? "إضافة عرض سعر جديد" : "Add New Price Offer"}</DialogTitle>
              <DialogDescription>
                {isArabic ? "ساهم في تحديث مؤشر السوق عبر إضافة عرضك الحالي" : "Contribute to the market index by adding your current offer"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitOffer} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{isArabic ? "المادة الكيميائية" : "Product"}</Label>
                <Select 
                  value={formData.productName} 
                  onValueChange={(val) => setFormData({...formData, productName: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? "اختر المادة" : "Select product"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sulfonic Acid">Sulfonic Acid</SelectItem>
                    <SelectItem value="Caustic Soda">Caustic Soda</SelectItem>
                    <SelectItem value="LABSA">LABSA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "السعر (EGP)" : "Price (EGP)"}</Label>
                  <Input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "الكمية" : "Quantity"}</Label>
                  <Input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "المدينة" : "City"}</Label>
                <Input 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder={isArabic ? "مثال: العاشر من رمضان" : "e.g. 10th of Ramadan"}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isArabic ? "حفظ العرض" : "Save Offer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "مؤشر الأسعار الحالي" : "Current Price Index"}</CardTitle>
            <CardDescription>
              {isArabic ? "الأسعار المحدثة يومياً بناءً على تداولات السوق" : "Daily updated prices based on market activity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prices.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p>{isArabic ? "لا توجد بيانات متاحة حالياً" : "No market data available at the moment"}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المادة" : "Product"}</TableHead>
                    <TableHead className="text-center">{isArabic ? "أقل سعر" : "Min Price"}</TableHead>
                    <TableHead className="text-center">{isArabic ? "أعلى سعر" : "Max Price"}</TableHead>
                    <TableHead className="text-center font-bold">{isArabic ? "متوسط السعر" : "Avg Price"}</TableHead>
                    <TableHead className="text-center">{isArabic ? "الاتجاه" : "Trend"}</TableHead>
                    <TableHead className="text-right">{isArabic ? "آخر تحديث" : "Last Updated"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-center">{item.minPrice.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-center">{item.maxPrice.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-center font-bold text-primary">{item.avgPrice.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getTrendIcon(item.trend)}
                          <span className="text-xs">{getTrendText(item.trend)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">{isArabic ? "أكثر مادة طلباً" : "Most Requested"}</p>
                  <p className="text-2xl font-bold text-blue-900">Sulfonic Acid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 border-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">{isArabic ? "دقة البيانات" : "Data Accuracy"}</p>
                  <p className="text-2xl font-bold text-green-900">98%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">{isArabic ? "أكبر انخفاض" : "Biggest Drop"}</p>
                  <p className="text-2xl font-bold text-purple-900">LABSA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
