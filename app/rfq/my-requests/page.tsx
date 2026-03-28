'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  History,
  Eye,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Tag,
  Truck,
  MessageSquare
} from 'lucide-react';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';

export default function MyRFQsPage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const response = await marketplaceService.rfq.getBuyerRFQs();
      if (response.data.success) {
        setRfqs(response.data.data.rfqs || []);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      toast.error('فشل في تحميل طلبات عروض الأسعار');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-blue-500">نشط</Badge>;
      case 'Accepted':
        return <Badge className="bg-green-500">تم القبول</Badge>;
      case 'Closed':
        return <Badge variant="secondary">مغلق</Badge>;
      case 'Expired':
        return <Badge variant="destructive">منتهي</Badge>;
      case 'ConvertedToOrder':
        return <Badge className="bg-purple-500">تحول لطلب شراء</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <MirvoryPageLoader />;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">طلباتي لعروض الأسعار (RFQ)</h1>
          <p className="text-muted-foreground mt-2">أدر صفقاتك وتابع عروض الموردين في مكان واحد</p>
        </div>
        <Button onClick={() => router.push('/rfq/request')} size="lg" className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-5 w-5 ml-2" />
          طلب عرض سعر جديد
        </Button>
      </div>

      {rfqs.length === 0 ? (
        <Card className="text-center py-20 bg-muted/20 border-2 border-dashed">
          <CardContent>
            <div className="bg-white p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <History className="h-10 w-10 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-xl font-bold mb-3">لا توجد طلبات نشطة</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">ابدأ الآن بإرسال أول طلب عرض سعر للمواد الكيميائية التي تحتاجها للحصول على أفضل الأسعار من الموردين</p>
            <Button onClick={() => router.push('/rfq/request')} size="lg">إرسال أول طلب RFQ</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {rfqs.map((rfq) => (
            <div key={rfq._id} className="space-y-6">
              {/* RFQ Header Card */}
              <Card className="border-r-4 border-r-primary overflow-hidden shadow-sm">
                <CardHeader className="bg-gray-50/50 pb-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl font-black text-gray-900">{rfq.chemicalName}</CardTitle>
                        {getStatusBadge(rfq.status)}
                      </div>
                      <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700">CAS: {rfq.CASNumber}</span>
                        {rfq.formula && <span className="text-gray-500">الصيغة: {rfq.formula}</span>}
                        {rfq.purity && <span className="text-primary">النقاء: {rfq.purity}%</span>}
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => router.push(`/rfq/${rfq._id}`)} className="font-bold">
                      <Eye className="h-4 w-4 ml-2" />
                      إدارة الطلب بالكامل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Tag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold">الكمية</p>
                        <p className="font-black text-sm">{rfq.quantity} {rfq.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold">التسليم</p>
                        <p className="font-black text-sm truncate max-w-[120px]">{rfq.deliveryLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold">الجدول الزمني</p>
                        <p className="font-black text-sm">{rfq.deliveryTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold">العروض المتاحة</p>
                        <p className="font-black text-sm">{rfq.quoteCount || 0} عرضاً</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quotes Grid for this RFQ */}
              <div className="pr-4 border-r-2 border-dashed border-gray-200 mr-2 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-gray-500 mb-4">
                  <Truck className="h-4 w-4" />
                  عروض الموردين (مرتبة من الأقل سعراً)
                </h4>
                
                {rfq.quotes && rfq.quotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...rfq.quotes]
                      .sort((a, b) => a.price - b.price)
                      .map((quote) => (
                        <Card key={quote._id} className={`relative overflow-hidden border-2 ${quote.status === 'Accepted' ? 'border-green-500 shadow-md' : 'hover:border-primary/40 transition-colors'}`}>
                          {quote.status === 'Accepted' && (
                            <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] px-2 py-1 font-bold z-10">
                              تم اختياره
                            </div>
                          )}
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center mb-1">
                              <Badge variant="outline" className="text-[9px] font-bold">
                                {quote.supplier?.publicId || 'مورد'}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-amber-600">★ {quote.supplier?.vendorProfile?.rating || '0'}</span>
                              </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-primary">{quote.price}</span>
                              <span className="text-xs text-muted-foreground font-bold">ج.م / {quote.unit}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 text-xs space-y-2">
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-muted-foreground">التسليم خلال:</span>
                              <span className="font-bold">{quote.deliveryTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground text-[10px]">الشحن:</span>
                              <Badge variant={quote.shippingIncluded ? "secondary" : "outline"} className="text-[9px]">
                                {quote.shippingIncluded ? 'شامل الشحن' : 'غير شامل'}
                              </Badge>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button 
                              variant={quote.status === 'Accepted' ? "secondary" : "default"} 
                              className="w-full h-8 text-xs font-bold"
                              onClick={() => router.push(`/rfq/${rfq._id}`)}
                            >
                              {quote.status === 'Accepted' ? 'عرض تفاصيل الطلب' : 'مراجعة وقبول العرض'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dotted">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">لا توجد عروض مقدمة من الموردين لهذا الطلب حتى الآن</p>
                  </div>
                )}
              </div>
              <div className="h-4"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
