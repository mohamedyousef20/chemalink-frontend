'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
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
  Search,
  Clock,
  MapPin,
  Filter,
  CheckCircle2,
  Package,
  Plus
} from 'lucide-react';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';

export default function RFQMarketplacePage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async (params = {}) => {
    setLoading(true);
    try {
      const response = await marketplaceService.rfq.getRFQMarketplace(params);
      if (response.data.success) {
        setRfqs(response.data.data.rfqs || []);
      }
    } catch (error) {
      console.error('Error fetching RFQ marketplace:', error);
      toast.error('فشل في تحميل سوق طلبات عروض الأسعار');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRFQs({ chemicalName: searchTerm });
  };

  if (loading && rfqs.length === 0) return <MirvoryPageLoader />;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">سوق طلبات عروض الأسعار (RFQ Marketplace)</h1>
          <p className="text-muted-foreground text-sm">استكشف طلبات المشترين وقدم عروض أسعار تنافسية</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مادة كيميائية..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">بحث</Button>
        </form>
      </div>

      {rfqs.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <History className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">لا توجد طلبات نشطة حالياً</h3>
            <p className="text-muted-foreground mb-6">سيظهر هنا أي طلبات عرض سعر جديدة من المشترين</p>
            <Button variant="outline" onClick={() => fetchRFQs()}>تحديث القائمة</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfqs.map((rfq) => (
            <Card key={rfq._id} className="flex flex-col h-full hover:shadow-lg transition-all border-r-4 border-r-primary/40">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
                    RFQ-{rfq._id.slice(-6)}
                  </Badge>
                  <div className="flex items-center text-[10px] text-muted-foreground gap-1">
                    <Clock className="h-3 w-3" />
                    <span>ينتهي: {new Date(rfq.expiryDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-primary truncate">
                  {rfq.chemicalName}
                </CardTitle>
                <CardDescription className="text-xs font-medium">
                  CAS: {rfq.CASNumber}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-[10px] text-muted-foreground mb-1 font-bold">الكمية المطلوبة</p>
                    <p className="text-sm font-black">{rfq.quantity} {rfq.unit}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-[10px] text-muted-foreground mb-1 font-bold">النقاء</p>
                    <p className="text-sm font-black">{rfq.purity ? `${rfq.purity}%` : 'غير محدد'}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">التسليم إلى:</span>
                    <span className="font-semibold">{rfq.deliveryLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">التعبئة:</span>
                    <span className="font-semibold">{rfq.packaging || 'حسب عرض المورد'}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4 bg-gray-50/50">
                <Button 
                  className="w-full font-bold" 
                  onClick={() => router.push(`/vendor/rfq/${rfq._id}`)}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  تقديم عرض سعر
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
