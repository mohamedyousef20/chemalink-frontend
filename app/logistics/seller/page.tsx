"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MapPin, Package, Clock, CheckCircle2, Loader2, DollarSign, Navigation, Globe, AlertTriangle, MessageSquare, MessageCircle } from "lucide-react";
import { logisticsService } from "@/lib/logisticsService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LogisticsChat from "@/components/logistics/LogisticsChat";
import { useAuthStore } from "@/store/useAuthStore";

export default function SellerDashboard() {
  const { user: currentUser } = useAuthStore();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  // ... existing states ...
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [chatDeliveryId, setChatDeliveryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isArabic, setIsArabic] = useState(false);

  // Dispute state
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [isDisputing, setIsDisputing] = useState(false);

  const [formData, setFormData] = useState({
    productName: "",
    weight: "",
    pickup: {
      address: "",
      location: { lat: 30.0444, lng: 31.2357 }
    },
    dropoff: {
      address: "",
      location: { lat: 30.0131, lng: 31.2089 }
    },
    price: ""
  });

  useEffect(() => {
    setIsArabic(document.documentElement.lang === 'ar');
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.deliveries.getSellerDeliveries();
      setDeliveries(res.data.data);
    } catch (error) {
      toast.error(isArabic ? "فشل في تحميل الشحنات" : "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await logisticsService.deliveries.createRequest({
        ...formData,
        weight: Number(formData.weight),
        price: formData.price ? Number(formData.price) : undefined
      });
      toast.success(isArabic ? "تم إنشاء طلب التوصيل!" : "Delivery request created!");
      setIsDialogOpen(false);
      setFormData({
        productName: "",
        weight: "",
        pickup: { address: "", location: { lat: 30.0444, lng: 31.2357 } },
        dropoff: { address: "", location: { lat: 30.0131, lng: 31.2089 } },
        price: ""
      });
      fetchDeliveries();
    } catch (error) {
      toast.error(isArabic ? "فشل في إنشاء الطلب" : "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectDriver = async (deliveryId: string, offerId: string) => {
    try {
      await logisticsService.deliveries.selectDriver(deliveryId, offerId);
      toast.success(isArabic ? "تم تعيين السائق!" : "Driver assigned!");
      fetchDeliveries();
    } catch (error) {
      toast.error(isArabic ? "فشل في تعيين السائق" : "Failed to assign driver");
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryId) return;

    try {
      setIsDisputing(true);
      await logisticsService.deliveries.raiseDispute(selectedDeliveryId, {
        reason: disputeReason,
        description: disputeDescription
      });
      toast.success(isArabic ? "تم تقديم النزاع للمراجعة" : "Dispute submitted for review");
      setIsDisputeDialogOpen(false);
      setDisputeReason("");
      setDisputeDescription("");
      fetchDeliveries();
    } catch (error) {
      toast.error(isArabic ? "فشل في تقديم النزاع" : "Failed to submit dispute");
    } finally {
      setIsDisputing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10" /></div>;

  return (
    <div className="container mx-auto p-4 space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Navigation className="h-8 w-8 text-primary" /> {isArabic ? "لوجستيات البائع" : "Seller Logistics"}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> {isArabic ? "شحنة جديدة" : "New Shipment"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir={isArabic ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle>{isArabic ? "إنشاء طلب شحن" : "Create Shipment Request"}</DialogTitle>
              <DialogDescription>{isArabic ? "أدخل تفاصيل الشحنة والمواقع." : "Enter shipment details and locations."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "اسم المنتج" : "Product Name"}</Label>
                  <Input 
                    value={formData.productName} 
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "الوزن (كجم)" : "Weight (kg)"}</Label>
                  <Input 
                    type="number"
                    value={formData.weight} 
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "عنوان الاستلام" : "Pickup Address"}</Label>
                <Input 
                  value={formData.pickup.address} 
                  onChange={(e) => setFormData({...formData, pickup: {...formData.pickup, address: e.target.value}})}
                  placeholder={isArabic ? "الشارع، المدينة، المبنى" : "Street, City, Building"}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "عنوان التسليم" : "Drop-off Address"}</Label>
                <Input 
                  value={formData.dropoff.address} 
                  onChange={(e) => setFormData({...formData, dropoff: {...formData.dropoff, address: e.target.value}})}
                  placeholder={isArabic ? "الشارع، المدينة، المبنى" : "Street, City, Building"}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "سعر مخصص (اختياري - اتركه للمتوسط)" : "Custom Price (Optional - Leave for average)"}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    type="number"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : (isArabic ? "نشر الشحنة" : "Post Shipment")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveries.map(delivery => (
          <Card key={delivery._id} className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{delivery.productName}</CardTitle>
                <Badge>{isArabic ? delivery.status.replace('_', ' ') : delivery.status.replace('_', ' ')}</Badge>
              </div>
              <CardDescription>{delivery.weight} {isArabic ? "كجم" : "kg"}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="text-sm space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-1" />
                  <span>{delivery.pickup.address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-1" />
                  <span>{delivery.dropoff.address}</span>
                </div>
              </div>
              <div className="pt-2 border-t flex justify-between text-sm">
                <span className="text-muted-foreground">{isArabic ? "السعر:" : "Price:"}</span>
                <span className="font-bold">{delivery.price.amount} {isArabic ? "ج.م" : "EGP"}</span>
              </div>
              
              {delivery.status === 'searching' && delivery.offers?.length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">{isArabic ? "العروض المستلمة:" : "Offers Received:"}</p>
                  {delivery.offers.map((offer: any) => (
                    <div key={offer._id} className="flex justify-between items-center bg-muted/50 p-2 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>{offer.price} {isArabic ? "ج.م" : "EGP"}</span>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => handleSelectDriver(delivery._id, offer._id)}>
                        {isArabic ? "اختيار" : "Select"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {delivery.status === 'driver_assigned' && (
                <div className="space-y-2">
                  <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                    <p className="text-xs font-bold text-primary flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {isArabic ? "رمز الأمان:" : "SECURITY CODE:"}
                    </p>
                    <p className="text-2xl font-black text-center tracking-widest py-1">{delivery.confirmationCode}</p>
                    <p className="text-[10px] text-center text-muted-foreground">{isArabic ? "أعطِ هذا الرمز للسائق فقط عند الاستلام." : "Give this code to the driver ONLY upon delivery."}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        setChatDeliveryId(delivery._id);
                        setIsChatDialogOpen(true);
                      }}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" /> {isArabic ? "محادثة" : "Chat"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSelectedDeliveryId(delivery._id);
                        setIsDisputeDialogOpen(true);
                      }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" /> {isArabic ? "نزاع" : "Dispute"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {deliveries.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">{isArabic ? "لا توجد شحنات" : "No shipments"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{isArabic ? "ابدأ بإنشاء طلب شحن جديد." : "Get started by creating a new shipment request."}</p>
        </div>
      )}

      {/* Dispute Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir={isArabic ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {isArabic ? "فتح نزاع" : "Raise Dispute"}
            </DialogTitle>
            <DialogDescription>
              {isArabic ? "يرجى توضيح سبب المشكلة مع الشحنة." : "Please explain the issue with this shipment."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRaiseDispute} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{isArabic ? "السبب" : "Reason"}</Label>
              <Select onValueChange={setDisputeReason} required>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر السبب" : "Select reason"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_delivered">{isArabic ? "لم يتم التوصيل" : "Not Delivered"}</SelectItem>
                  <SelectItem value="damaged_goods">{isArabic ? "بضاعة تالفة" : "Damaged Goods"}</SelectItem>
                  <SelectItem value="wrong_recipient">{isArabic ? "مستلم خاطئ" : "Wrong Recipient"}</SelectItem>
                  <SelectItem value="other">{isArabic ? "سبب آخر" : "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? "الوصف" : "Description"}</Label>
              <Textarea 
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                placeholder={isArabic ? "أدخل تفاصيل المشكلة..." : "Describe the problem in detail..."}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="destructive" className="w-full" disabled={isDisputing}>
                {isDisputing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : (isArabic ? "إرسال النزاع" : "Submit Dispute")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0" dir={isArabic ? 'rtl' : 'ltr'}>
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{isArabic ? "المحادثة مع السائق" : "Chat with Driver"}</DialogTitle>
          </DialogHeader>
          {chatDeliveryId && currentUser && (
            <LogisticsChat deliveryId={chatDeliveryId} currentUser={currentUser} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Truck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v6h2" />
      <path d="M13 9h4" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}
