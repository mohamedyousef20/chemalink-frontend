'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { marketplaceService } from '@/lib/api';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export default function RequestRFQPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chemicalName: '',
    purity: '',
    quantity: '',
    unit: 'kg',
    packaging: '',
    deliveryLocation: '',
    deliveryTime: '',
    expiryDate: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.chemicalName || !formData.quantity || !formData.unit || !formData.deliveryLocation || !formData.deliveryTime || !formData.expiryDate) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      const response = await marketplaceService.rfq.createRFQ({
        ...formData,
        purity: formData.purity ? parseFloat(formData.purity) : undefined,
        quantity: parseFloat(formData.quantity),
      });

      if (response.data.success) {
        toast.success('تم إرسال طلب عرض السعر بنجاح');
        // router.push('/profile?tab=rfqs');
      }
    } catch (error: any) {
      console.error('Error creating RFQ:', error);
      toast.error(error.response?.data?.message || 'فشل في إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">طلب عرض سعر مادة كيميائية (RFQ)</CardTitle>
            <CardDescription>
              أدخل تفاصيل المادة الكيميائية المطلوبة لتلقي عروض أسعار من الموردين المعتمدين.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chemicalName">اسم المادة الكيميائية *</Label>
                  <Input
                    id="chemicalName"
                    name="chemicalName"
                    placeholder="مثال: ايثانول"
                    required
                    value={formData.chemicalName}
                    onChange={handleChange}
                  />
                </div>
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purity">النقاء المطلوبة (%)</Label>
                  <Input
                    id="purity"
                    name="purity"
                    type="number"
                    step="0.01"
                    placeholder="99.9"
                    value={formData.purity}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">الكمية المطلوبة *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    required
                    placeholder="100"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">الوحدة *</Label>
                  <Select
                    defaultValue="kg"
                    onValueChange={(value) => handleSelectChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الوحدة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">كيلوجرام (kg)</SelectItem>
                      <SelectItem value="ton">طن (ton)</SelectItem>
                      <SelectItem value="l">لتر (L)</SelectItem>
                      <SelectItem value="g">جرام (g)</SelectItem>
                      <SelectItem value="ml">مليلتر (ml)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packaging">نوع التعبئة</Label>
                <Input
                  id="packaging"
                  name="packaging"
                  placeholder="مثال: Drums, IBC, Bottles"
                  value={formData.packaging}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryLocation">موقع التسليم *</Label>
                <Input
                  id="deliveryLocation"
                  name="deliveryLocation"
                  placeholder="المدينة / المنطقة"
                  required
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">وقت التسليم المطلوب *</Label>
                  <Input
                    id="deliveryTime"
                    name="deliveryTime"
                    placeholder="مثال: خلال 7 أيام"
                    required
                    value={formData.deliveryTime}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">تاريخ انتهاء الطلب *</Label>
                  <div className="relative">
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={handleChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">التاريخ الذي سيتوقف فيه استقبال العروض لهذا الطلب</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">ملاحظات إضافية</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="أي تفاصيل أخرى تريد إضافتها..."
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'جاري الإرسال...' : 'إرسال طلب عرض السعر'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
