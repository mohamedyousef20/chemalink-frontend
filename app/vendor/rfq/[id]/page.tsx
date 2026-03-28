'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import {
  Clock,
  MapPin,
  Package,
  Info,
  Calendar,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';

export default function SubmitQuotePage() {
  const router = useRouter();
  const { id } = useParams();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    price: '',
    unit: 'kg',
    deliveryTime: '',
    shippingIncluded: 'false',
    notes: '',
  });

  useEffect(() => {
    if (id) fetchRFQDetails();
  }, [id]);

  const fetchRFQDetails = async () => {
    try {
      const response = await marketplaceService.rfq.getRFQById(id as string);
      if (response.data.success) {
        setRfq(response.data.data.rfq);
        setFormData(prev => ({ ...prev, unit: response.data.data.rfq.unit }));
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      toast.error('فشل في تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.price || !formData.deliveryTime) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        setSubmitting(false);
        return;
      }

      const response = await marketplaceService.rfq.submitQuote(id as string, {
        ...formData,
        price: parseFloat(formData.price),
        shippingIncluded: formData.shippingIncluded === 'true',
      });

      if (response.data.success) {
        toast.success('تم إرسال عرض السعر بنجاح');
        router.push('/vendor/rfq-market');
      }
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      toast.error(error.response?.data?.message || 'فشل في إرسال العرض');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <MirvoryPageLoader />;
  if (!rfq) return <div className="text-center py-12">الطلب غير موجود</div>;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RFQ Details Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-r-4 border-r-primary">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">{rfq.chemicalName}</CardTitle>
              <CardDescription>تفاصيل طلب المشتري</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
          
              <div className="flex justify-between border-b pb-2 font-medium">
                <span className="text-muted-foreground">الكمية المطلوبة:</span>
                <span>{rfq.quantity} {rfq.unit}</span>
              </div>
              {rfq.purity && (
                <div className="flex justify-between border-b pb-2 font-medium">
                  <span className="text-muted-foreground">النقاء المطلوبة:</span>
                  <span>{rfq.purity}%</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2 font-medium">
                <span className="text-muted-foreground">موقع التسليم:</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {rfq.deliveryLocation}</span>
              </div>
              <div className="flex justify-between border-b pb-2 font-medium">
                <span className="text-muted-foreground">وقت التسليم:</span>
                <span>{rfq.deliveryTime}</span>
              </div>
              <div className="flex justify-between border-b pb-2 font-medium">
                <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(rfq.expiryDate).toLocaleDateString('ar-EG')}</span>
              </div>
              
              <div className="pt-2">
                <span className="text-muted-foreground block mb-2">ملاحظات إضافية:</span>
                <div className="bg-gray-50 p-3 rounded text-xs italic">
                  {rfq.description || 'لا توجد ملاحظات إضافية من المشتري'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              تقديم عرض سعر تنافسي يزيد من فرص قبول عرضك. تأكد من دقة المواعيد والمواصفات المذكورة.
            </p>
          </div>
        </div>

        {/* Quote Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>تقديم عرض سعر</CardTitle>
              <CardDescription>أدخل تفاصيل عرضك لهذا الطلب</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر لكل وحدة ({rfq.unit}) *</Label>
                    <div className="relative">
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="pl-12"
                        value={formData.price}
                        onChange={handleChange}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                        EGP
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">مدة التسليم المتوقعة *</Label>
                    <Input
                      id="deliveryTime"
                      name="deliveryTime"
                      required
                      placeholder="مثال: 3-5 أيام عمل"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>هل الشحن مشمول في السعر؟</Label>
                  <Select 
                    value={formData.shippingIncluded}
                    onValueChange={(value) => handleSelectChange('shippingIncluded', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">نعم، السعر يشمل الشحن</SelectItem>
                      <SelectItem value="false">لا، السعر لا يشمل الشحن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات إضافية أو شروط (اختياري)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="مثال: نقاء 99.5%، تعبئة في براميل بلاستيكية..."
                    rows={5}
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
                
                
                <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-primary mb-1">إجمالي قيمة العرض المتوقعة:</p>
                    <p className="text-xs text-muted-foreground">(السعر × الكمية المطلوبة)</p>
                  </div>
                  <div className="text-2xl font-black text-primary">
                    {formData.price ? (parseFloat(formData.price) * rfq.quantity).toLocaleString() : '0'} EGP
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50/50 p-6 rounded-b-lg border-t">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  رجوع
                </Button>
                <Button type="submit" className="px-8 font-bold" disabled={submitting}>
                  {submitting ? 'جاري الإرسال...' : (
                    <>
                      <Send className="h-4 w-4 ml-2" />
                      إرسال العرض الآن
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
