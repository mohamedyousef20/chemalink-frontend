'use client';

import { useState, useEffect } from 'react';
import { marketplaceService } from '@/lib/api';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
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
  Search, 
  Trash2, 
  Eye, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';
import Link from 'next/link';

export default function AdminRFQsPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async (params = {}) => {
    setLoading(true);
    try {
      // Re-using marketplace fetch for admin with potential extended filters if backend supports it
      const response = await marketplaceService.rfq.getRFQMarketplace({ ...params, status: 'Active' });
      if (response.data.success) {
        setRfqs(response.data.data.rfqs || []);
      }
    } catch (error) {
      console.error('Error fetching RFQs for admin:', error);
      toast.error('فشل في تحميل طلبات عروض الأسعار');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRFQ = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذه العملية.')) return;
    
    try {
      // If there's no specific admin delete, we might need to add one or use close
      await marketplaceService.rfq.closeRFQ(id);
      toast.success('تم إغلاق/حذف الطلب بنجاح');
      fetchRFQs();
    } catch (error) {
      toast.error('فشل في حذف الطلب');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge className="bg-green-500">نشط</Badge>;
      case 'Accepted': return <Badge className="bg-blue-500">مقبول</Badge>;
      case 'Closed': return <Badge variant="secondary">مغلق</Badge>;
      case 'Expired': return <Badge variant="destructive">منتهي</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading && rfqs.length === 0) return <MirvoryPageLoader />;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة طلبات عروض الأسعار (RFQs)</h1>
          <p className="text-muted-foreground text-sm">مراقبة وإدارة جميع طلبات عروض الأسعار في المنصة</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <Input 
            placeholder="البحث عن مادة..." 
            className="w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => fetchRFQs({ chemicalName: searchTerm })}>بحث</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المادة الكيميائية</TableHead>
                <TableHead className="text-right">المشتري</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">العروض</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات لعرضها
                  </TableCell>
                </TableRow>
              ) : (
                rfqs.map((rfq) => (
                  <TableRow key={rfq._id}>
                    <TableCell className="font-medium">
                      <div>
                        {rfq.chemicalName}
                        <p className="text-[10px] text-muted-foreground">CAS: {rfq.CASNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{rfq.buyer?.publicId || 'مستخدم'}</TableCell>
                    <TableCell>{rfq.quantity} {rfq.unit}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p>{new Date(rfq.createdAt).toLocaleDateString('ar-EG')}</p>
                        <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                          <Clock className="h-3 w-3" />
                          ينتهي: {new Date(rfq.expiryDate).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rfq.quoteCount}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Link href={`/rfq/${rfq._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteRFQ(rfq._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
