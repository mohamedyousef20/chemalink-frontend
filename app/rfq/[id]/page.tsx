'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { marketplaceService } from '@/lib/api';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Package,
  Info,
  Calendar,
  User,
  Star,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';

export default function RFQDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (id) fetchRFQDetails();
  }, [id]);

  const fetchRFQDetails = async () => {
    try {
      const response = await marketplaceService.rfq.getRFQById(id as string);
      console.log(response,'ddsdjdfsksdl')
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching RFQ details:', error);
      toast.error('فشل في تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm('هل أنت متأكد من قبول هذا العرض؟ سيتم تحويل الطلب إلى طلب شراء رسمي.')) return;
    
    try {
      const response = await marketplaceService.rfq.acceptQuote(id as string, quoteId);
      if (response.data.success) {
        toast.success('تم قبول العرض بنجاح');
        router.push(`/orders/${response.data.data.order._id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في قبول العرض');
    }
  };

  const getSortedQuotes = () => {
    if (!data?.quotes) return [];
    return [...data.quotes].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'price') comparison = a.price - b.price;
      if (sortBy === 'delivery') comparison = parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
      if (sortBy === 'rating') comparison = (b.supplierRatingAtQuote || 0) - (a.supplierRatingAtQuote || 0);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  if (loading) return <MirvoryPageLoader />;
  if (!data) return <div className="text-center py-12">طلب غير موجود</div>;

  const { rfq, quotes } = data;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RFQ Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">{rfq.chemicalName}</CardTitle>
              <CardDescription>تفاصيل طلب عرض السعر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
            
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">الكمية:</span>
                <span className="font-medium">{rfq.quantity} {rfq.unit}</span>
              </div>
              {rfq.purity && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">النقاء:</span>
                  <span className="font-medium">{rfq.purity}%</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">الموقع:</span>
                <span className="font-medium">{rfq.deliveryLocation}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                <span className="font-medium">{new Date(rfq.expiryDate).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="space-y-2 pt-2">
                <span className="text-muted-foreground">ملاحظات:</span>
                <p className="p-3 bg-gray-50 rounded italic">{rfq.description || 'لا توجد ملاحظات إضافية'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quotes List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">العروض المستلمة ({quotes.length})</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ترتيب حسب:</span>
              <Select defaultValue="price" onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">الأقل سعراً</SelectItem>
                  <SelectItem value="delivery">الأسرع توصيلاً</SelectItem>
                  <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {quotes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">بانتظار عروض الموردين</h3>
                <p className="text-muted-foreground">سيتم إخطارك فور وصول عروض جديدة لهذا الطلب.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
                {/* استبدل قسم الخريطة (Map) بهذا الكود المحدث */}
                {getSortedQuotes().map((quoteObj: any) => {
                  // لضمان الوصول للبيانات سواء كانت Mongoose Document أو Plain Object
                  const quote = quoteObj._doc || quoteObj;
                  const supplier = quote.supplier || {};

                  return (
                    <Card key={quote._id} className={quote.status === 'Accepted' ? 'border-2 border-green-500 shadow-md' : 'hover:shadow-md transition-shadow'}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-lg text-gray-900">
                                    {supplier.publicId || 'مورد غير معروف'}
                                  </h4>
                                  {supplier.isTrustedSeller && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px]">
                                      مورد موثوق
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                  <Star className={`h-3 w-3 ${quote.supplierRatingAtQuote > 0 ? 'fill-current' : ''}`} />
                                  <span className="text-xs font-semibold text-gray-600">
                                    {quote.supplierRatingAtQuote > 0 ? quote.supplierRatingAtQuote.toFixed(1) : 'لا يوجد تقييم'}
                                  </span>
                                </div>
                              </div>
                              {quote.status === 'Accepted' && (
                                <Badge className="bg-green-600 mr-auto">العرض المختار</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mt-4">
                              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-gray-700">توصيل: {quote.deliveryTime} أيام</span>
                              </div>
                              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                                <Package className="h-4 w-4 text-green-500" />
                                <span className="font-medium text-gray-700">
                                  {quote.shippingIncluded ? 'الشحن مجاني' : 'الشحن غير مشمول'}
                                </span>
                              </div>
                              {quote.rankingScore > 0 && (
                                <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-md">
                                  <Star className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium text-purple-700 text-xs">درجة الترتيب: {quote.rankingScore.toFixed(2)}</span>
                                </div>
                              )}
                            </div>

                            {quote.notes && (
                              <div className="mt-3 text-sm text-gray-600 bg-amber-50/50 p-3 rounded border-r-4 border-amber-200">
                                <p className="italic">" {quote.notes} "</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-center md:items-end justify-center gap-4 border-t md:border-t-0 md:border-r border-gray-100 pr-0 md:pr-8 pt-4 md:pt-0 min-w-[180px]">
                            <div className="text-center md:text-left">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-blue-600">{quote.price}</span>
                                <span className="text-sm font-bold text-blue-700">{rfq.currency || 'EGP'}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">لكل {quote.unit || rfq.unit}</p>
                              <div className="mt-1 text-xs font-bold text-gray-500">
                                الإجمالي: {(quote.price * rfq.quantity).toLocaleString()} {rfq.currency || 'EGP'}
                              </div>
                            </div>

                            {rfq.status === 'Active' && quote.status !== 'Accepted' && (
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700 shadow-sm transition-all active:scale-95"
                                onClick={() => handleAcceptQuote(quote._id)}
                              >
                                <CheckCircle2 className="h-4 w-4 ml-2" />
                                قبول هذا العرض
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Minimal Select implementation since we need it here
function Select({ children, defaultValue, onValueChange }: any) {
  return <div className="relative inline-block">{children}</div>;
}
function SelectTrigger({ children, className }: any) {
  return <Button variant="outline" size="sm" className={className}>{children} <ArrowUpDown className="h-3 w-3 mr-2 opacity-50" /></Button>;
}
function SelectValue() { return <span>السعر</span>; }
function SelectContent({ children }: any) { return null; } // In a real app we'd use the UI component
function SelectItem() { return null; }
