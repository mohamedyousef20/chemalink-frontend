"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, Package, Eye, User, Target, DollarSign, Calendar, MapPin, Info, Phone } from "lucide-react";
import { marketplaceService } from "@/lib/api";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface GroupBuyCampaign {
  _id: string;
  chemicalName: string;
  CASNumber: string;
  targetQuantity: number;
  currentQuantity: number;
  pricePerUnit: number;
  deadline: string;
  status: 'Pending' | 'Open' | 'Success' | 'Failed' | 'Rejected';
  supplier: {
    publicId: string;
    email: string;
    displayName?: string; // مضاف
    phoneNumber?: string; // مضاف
    vendorProfile?: {
      companyName: string;
      address?: string;
    };
  };
  unit: string;
  deliveryLocation?: string;
  description?: string; // مضاف
}

interface GroupBuysTabProps {
  campaigns: GroupBuyCampaign[];
  loading: boolean;
  isArabic: boolean;
  refreshCampaigns: () => void;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ParticipantRequest {
  _id: string;
  groupBuy: {
    _id: string;
    chemicalName: string;
    CASNumber: string;
    unit: string;
    pricePerUnit: number;
    targetQuantity: number;
    currentQuantity: number;
  };
  buyer: {
    publicId: string;
    email: string;
    phoneNumber?: string;
  };
  quantity: number;
  totalPrice: number;
  adminApproval: {
    status: 'Pending' | 'Approved' | 'Rejected';
  };
  createdAt: string;
}

export function GroupBuysTab({ campaigns, loading, isArabic, refreshCampaigns }: GroupBuysTabProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [participantRequests, setParticipantRequests] = useState<ParticipantRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("campaigns");

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const response = await marketplaceService.groupBuy.getAdminParticipants({ status: 'Pending' });
      console.log(response, '454545')
      console.log(response.data.success, '454545')
      if (response.data.success) {
        setParticipantRequests(response.data.data.participants);
      }
    } catch (error) {
      console.error("Error fetching participant requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      await marketplaceService.groupBuy.approveCampaign(id, action);
      toast.success(isArabic ? `تم ${action === 'approve' ? 'قبول' : 'رفض'} الحملة بنجاح` : `Campaign ${action}ed successfully`);
      refreshCampaigns();
    } catch (error) {
      toast.error(isArabic ? "فشل تنفيذ الإجراء" : "Failed to perform action");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveJoin = async (participantId: string, action: 'approve' | 'reject') => {
    setProcessingId(participantId);
    try {
      await marketplaceService.groupBuy.approveJoinRequest(participantId, action);
      toast.success(isArabic ? `تم ${action === 'approve' ? 'الموافقة على' : 'رفض'} طلب الانضمام` : `Join request ${action}ed successfully`);
      fetchRequests();
      refreshCampaigns();
    } catch (error) {
      toast.error(isArabic ? "فشل تنفيذ الإجراء" : "Failed to perform action");
    } finally {
      setProcessingId(null);
    }
  };

  const getRemainingDays = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Open: { color: "bg-blue-100 text-blue-800 border-blue-200", label: isArabic ? "مفتوح" : "Open" },
      Pending: { color: "bg-amber-100 text-amber-800 border-amber-200 animate-pulse", label: isArabic ? "مراجعة إدارية" : "Admin Review" },
      Success: { color: "bg-green-100 text-green-800 border-green-200", label: isArabic ? "مكتمل" : "Successful" },
      Rejected: { color: "bg-red-100 text-red-800 border-red-200", label: isArabic ? "مرفوض" : "Rejected" },
      Failed: { color: "bg-gray-100 text-gray-800 border-gray-200", label: isArabic ? "فشلت" : "Failed" },
      Approved: { color: "bg-green-100 text-green-800 border-green-200", label: isArabic ? "مقبول" : "Approved" },
    };
    const current = variants[status] || { color: "bg-gray-100", label: status };
    return <Badge className={`${current.color} border shadow-sm px-2 py-0.5`}>{current.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Clock className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">{isArabic ? "جاري جلب بيانات الحملات..." : "Fetching campaigns data..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary"><Package className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي الحملات" : "Total Campaigns"}</p>
              <h3 className="text-2xl font-bold">{campaigns.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600"><Clock className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">{isArabic ? "بانتظار الموافقة" : "Pending Approval"}</p>
              <h3 className="text-2xl font-bold">{campaigns.filter(c => c.status === 'Pending').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><User className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">{isArabic ? "طلبات الانضمام" : "Join Requests"}</p>
              <h3 className="text-2xl font-bold">{participantRequests.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" value={activeSubTab} onValueChange={(v) => {
        setActiveSubTab(v);
        if (v === 'requests') fetchRequests();
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="campaigns">{isArabic ? "إدارة الحملات" : "Manage Campaigns"}</TabsTrigger>
          <TabsTrigger value="requests">{isArabic ? "طلبات الانضمام" : "Join Requests"}</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          {campaigns.length === 0 ? (
            <Card className="border-dashed py-12 text-center bg-muted/5">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <CardTitle className="text-muted-foreground">{isArabic ? "لا توجد طلبات شراء جماعي" : "No Group Buys available"}</CardTitle>
            </Card>
          ) : (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>{isArabic ? "المنتج والمورد" : "Product & Supplier"}</TableHead>
                    <TableHead>{isArabic ? "تقارير الكمية" : "Quantity Report"}</TableHead>
                    <TableHead>{isArabic ? "التسعير والوقت" : "Price & Timing"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-right">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const progress = Math.min(100, Math.round((campaign.currentQuantity / campaign.targetQuantity) * 100));
                    const daysLeft = getRemainingDays(campaign.deadline);

                    return (
                      <TableRow key={campaign._id} className="group hover:bg-muted/20">
                        {/* Column 1: Product & Supplier */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-bold text-base leading-none">{campaign.chemicalName}</div>

                            <div className="pt-2 flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-primary/20">
                                <User className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="text-xs">
                                <p className="font-medium">{campaign.supplier.vendorProfile?.companyName || campaign.supplier.displayName || "Unknown Supplier"}</p>
                                <div className="flex gap-2 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" /> {campaign.supplier.phoneNumber || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Column 2: Progress */}
                        <TableCell className="min-w-[180px]">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>{campaign.currentQuantity.toLocaleString()} / {campaign.targetQuantity.toLocaleString()} {campaign.unit}</span>
                              <span className={progress >= 100 ? "text-green-600" : "text-primary"}>{progress}%</span>
                            </div>
                            <Progress value={progress} className={`h-1.5 ${progress >= 80 ? 'bg-green-100' : ''}`} />
                          </div>
                        </TableCell>

                        {/* Column 3: Price & Time */}
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1 font-bold text-green-700">
                              <DollarSign className="h-3.5 w-3.5" />
                              {campaign.pricePerUnit.toLocaleString()}
                              <span className="text-[10px] text-muted-foreground font-normal">/{campaign.unit}</span>
                            </div>
                            <div className={`flex items-center gap-1 text-[11px] ${daysLeft < 3 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                              <Calendar className="h-3.5 w-3.5" />
                              {daysLeft} {isArabic ? "أيام متبقية" : "days left"}
                            </div>
                          </div>
                        </TableCell>

                        {/* Column 4: Status */}
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>

                        {/* Column 5: Actions */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {campaign.status === 'Pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleAction(campaign._id, 'approve')}
                                  disabled={processingId === campaign._id}
                                >
                                  <Check className="h-4 w-4 mr-1" /> {isArabic ? "تفعيل" : "Activate"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-red-600 hover:bg-red-50"
                                  onClick={() => handleAction(campaign._id, 'reject')}
                                  disabled={processingId === campaign._id}
                                >
                                  <X className="h-4 w-4 mr-1" /> {isArabic ? "رفض" : "Reject"}
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="secondary" className="h-8 px-2" asChild>
                              <Link href={`/marketplace/group-buy/${campaign._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {requestsLoading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Clock className="h-10 w-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium">{isArabic ? "جاري جلب طلبات الانضمام..." : "Fetching join requests..."}</p>
            </div>
          ) : participantRequests.length === 0 ? (
            <Card className="border-dashed py-12 text-center bg-muted/5">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <CardTitle className="text-muted-foreground">{isArabic ? "لا توجد طلبات انضمام حالياً" : "No pending join requests"}</CardTitle>
            </Card>
          ) : (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>{isArabic ? "المشتري" : "Buyer"}</TableHead>
                    <TableHead>{isArabic ? "الحملة" : "Campaign"}</TableHead>
                    <TableHead>{isArabic ? "الكمية" : "Qty"}</TableHead>
                    <TableHead>{isArabic ? "التفاصيل المالية" : "Financials"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-right">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participantRequests.map((req) => (
                    <TableRow key={req._id} className="group hover:bg-muted/20">
                      {/* المشتري */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm truncate max-w-[120px]">{req.buyer.publicId}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5" /> {req.buyer.phoneNumber || "N/A"}
                          </div>
                          <Badge variant="outline" className="text-[9px] py-0 bg-blue-50">
                            {req.paymentMethod === 'cash' ? (isArabic ? 'كاش' : 'Cash') : req.paymentMethod}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* الحملة */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm">{req.groupBuy.chemicalName}</div>
                          <div className="text-[10px] text-muted-foreground">CAS: {req.groupBuy.CASNumber}</div>
                        </div>
                      </TableCell>

                      {/* الكمية */}
                      <TableCell>
                        <div className="font-medium text-sm">{req.quantity} {req.groupBuy.unit}</div>
                      </TableCell>

                      {/* التفاصيل المالية والرسوم */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-bold text-green-700 text-sm">{req.totalPrice.toLocaleString()} EGP</div>
                          <div className="flex flex-col text-[9px] text-muted-foreground border-t pt-1">
                            <span>{isArabic ? "عمولة المنصة:" : "Fee:"} {req.platformFee} EGP</span>
                            <span>{isArabic ? "للمورد:" : "Payout:"} {req.supplierPayout} EGP</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* حالة الالتزام والقبول */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {req.financialCommitment && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px] w-fit">
                              {isArabic ? "تعهد مالي مؤكد" : "Committed"}
                            </Badge>
                          )}
                          {getStatusBadge(req.adminApproval.status)}
                        </div>
                      </TableCell>

                      {/* الإجراءات */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 bg-green-600 hover:bg-green-700 px-2"
                            onClick={() => handleApproveJoin(req._id, 'approve')}
                            disabled={processingId === req._id}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> {isArabic ? "موافقة" : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-2"
                            onClick={() => handleApproveJoin(req._id, 'reject')}
                            disabled={processingId === req._id}
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> {isArabic ? "رفض" : "Reject"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}