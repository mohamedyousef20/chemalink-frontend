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
  Clock,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RfqsTab() {
  const { language } = useLanguage();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async (params = {}) => {
    setLoading(true);
    try {
      // Re-using marketplace fetch for admin with potential extended filters
      const response = await marketplaceService.rfq.getRFQMarketplace({ ...params });
    console.log(response,'reqes')
      if (response.data.success) {
        setRfqs(response.data.data.rfqs || []);
      }
    } catch (error) {
      console.error('Error fetching RFQs for admin:', error);
      toast.error(language === 'ar' ? 'فشل في تحميل طلبات عروض الأسعار' : 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRFQ = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من إغلاق هذا الطلب؟' : 'Are you sure you want to close this RFQ?')) return;
    
    try {
      await marketplaceService.rfq.closeRFQ(id);
      toast.success(language === 'ar' ? 'تم إغلاق الطلب بنجاح' : 'RFQ closed successfully');
      fetchRFQs();
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل في إغلاق الطلب' : 'Failed to close RFQ');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge className="bg-green-500">{language === 'ar' ? 'نشط' : 'Active'}</Badge>;
      case 'Accepted': return <Badge className="bg-blue-500">{language === 'ar' ? 'مقبول' : 'Accepted'}</Badge>;
      case 'Closed': return <Badge variant="secondary">{language === 'ar' ? 'مغلق' : 'Closed'}</Badge>;
      case 'Expired': return <Badge variant="destructive">{language === 'ar' ? 'منتهي' : 'Expired'}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading && rfqs.length === 0) return <div className="py-10"><MirvoryPageLoader /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">{language === 'ar' ? 'إدارة طلبات عروض الأسعار' : 'RFQ Management'}</h2>
          <p className="text-muted-foreground text-sm">
            {language === 'ar' ? 'مراقبة وإدارة جميع طلبات عروض الأسعار في المنصة' : 'Monitor and manage all RFQ requests on the platform'}
          </p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={language === 'ar' ? 'البحث عن مادة...' : 'Search chemical...'} 
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => fetchRFQs({ chemicalName: searchTerm })}>
            {language === 'ar' ? 'بحث' : 'Search'}
          </Button>
          <Button variant="outline" size="icon" onClick={() => fetchRFQs()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{language === 'ar' ? 'المادة الكيميائية' : 'Chemical'}</TableHead>
                  <TableHead className="text-right">{language === 'ar' ? 'المشتري' : 'Buyer'}</TableHead>
                  <TableHead className="text-right">{language === 'ar' ? 'الكمية' : 'Quantity'}</TableHead>
                  <TableHead className="text-right">{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead className="text-right">{language === 'ar' ? 'العروض' : 'Quotes'}</TableHead>
                  <TableHead className="text-right">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد طلبات لعرضها' : 'No RFQs to display'}
                    </TableCell>
                  </TableRow>
                ) : (
                  rfqs.map((rfq) => (
                    <TableRow key={rfq._id}>
                      <TableCell className="font-medium text-right">
                        <div>
                          {rfq.chemicalName}
                          <p className="text-[10px] text-muted-foreground">CAS: {rfq.CASNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{rfq.buyer?.publicId || '—'}</TableCell>
                      <TableCell className="text-right">{rfq.quantity} {rfq.unit}</TableCell>
                      <TableCell className="text-right">
                        <div className="text-xs">
                          <p>{new Date(rfq.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                          <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                            <Clock className="h-3 w-3" />
                            {new Date(rfq.expiryDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{rfq.quoteCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{getStatusBadge(rfq.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                              <DropdownMenuLabel>{language === 'ar' ? 'إجراءات' : 'Actions'}</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/rfq/${rfq._id}`} className="flex items-center gap-2 cursor-pointer">
                                  <Eye className="h-4 w-4" />
                                  {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                                </Link>
                              </DropdownMenuItem>
                              {rfq.status === 'Active' && (
                                <DropdownMenuItem 
                                  onClick={() => handleCloseRFQ(rfq._id)}
                                  className="text-red-600 focus:text-red-600 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {language === 'ar' ? 'إغلاق الطلب' : 'Close RFQ'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
