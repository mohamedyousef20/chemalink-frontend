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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Truck, 
  PlusCircle, 
  Loader2, 
  MapPin, 
  Package, 
  MessageSquare,
  DollarSign,
  CheckCircle2,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { marketplaceService } from "@/lib/api";

export default function FreightMarketplacePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArabic, setIsArabic] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Form state for new request
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    pickupLocation: "",
    deliveryLocation: "",
    truckType: "10 tons"
  });

  // Form state for driver offer
  const [offerData, setOfferData] = useState({
    price: "",
    message: ""
  });

  useEffect(() => {
    setIsArabic(document.documentElement.lang === 'ar');
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.transport.getRequests();
      console.log("API response:", response);
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error(isArabic ? "فشل في تحميل طلبات النقل" : "Failed to load transport requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async (requestId: string) => {
    try {
      setLoadingOffers(true);
      const response = await marketplaceService.transport.getOffers(requestId);
      if (response.data.success) {
        setOffers(response.data.data);
        setIsOwner(response.data.isOwner);
      }
    } catch (error: any) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await marketplaceService.transport.createRequest(formData);
      if (response.data.success) {
        toast.success(isArabic ? "تم إنشاء طلب النقل بنجاح" : "Transport request created successfully");
        setIsDialogOpen(false);
        setFormData({
          productName: "",
          quantity: "",
          pickupLocation: "",
          deliveryLocation: "",
          truckType: "10 tons"
        });
        fetchRequests();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isArabic ? "فشل في إنشاء الطلب" : "Failed to create request"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOffer = async (requestId: string) => {
    if (!offerData.price) {
      toast.error(isArabic ? "يرجى تحديد السعر" : "Please specify price");
      return;
    }
    try {
      setSubmitting(true);
      const response = await marketplaceService.transport.submitOffer({
        requestId,
        price: Number(offerData.price),
        message: offerData.message
      });
      if (response.data.success) {
        toast.success(isArabic ? "تم تقديم عرضك بنجاح" : "Offer submitted successfully");
        setOfferData({ price: "", message: "" });
        fetchOffers(requestId);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isArabic ? "فشل في تقديم العرض" : "Failed to submit offer"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignDriver = async (offerId: string, requestId: string) => {
    try {
      setSubmitting(true);
      const response = await marketplaceService.transport.assignDriver(offerId);
      if (response.data.success) {
        toast.success(isArabic ? "تم اختيار السائق بنجاح" : "Driver assigned successfully");
        fetchRequests();
        fetchOffers(requestId);
      }
    } catch (error: any) {
      toast.error(isArabic ? "فشل في تعيين السائق" : "Failed to assign driver");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
            <Truck className="h-8 w-8" />
            {isArabic ? "سوق خدمات النقل (Freight)" : "Freight Marketplace"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? "اطلب شاحنة لنقل موادك الكيميائية أو قدم عروض أسعار كسائق" : "Request a truck for your chemicals or provide price offers as a driver"}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-12 px-6 text-lg">
              <PlusCircle className="h-5 w-5" />
              {isArabic ? "طلب نقل جديد" : "New Transport Request"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir={isArabic ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle>{isArabic ? "إنشاء طلب نقل جديد" : "Create New Transport Request"}</DialogTitle>
              <DialogDescription>
                {isArabic ? "أدخل تفاصيل الشحنة والمكان ليتمكن السائقون من تقديم عروضهم" : "Enter shipment details so drivers can provide offers"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "اسم المنتج" : "Product Name"}</Label>
                  <Input 
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    placeholder={isArabic ? "حمض سلفونيك" : "Sulfonic Acid"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "الكمية" : "Quantity"}</Label>
                  <Input 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder={isArabic ? "10 طن" : "10 Tons"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "نوع الشاحنة المطلوب" : "Truck Type"}</Label>
                <Select 
                  value={formData.truckType}
                  onValueChange={(val) => setFormData({...formData, truckType: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5 tons">{isArabic ? "5 طن" : "5 Tons"}</SelectItem>
                    <SelectItem value="10 tons">{isArabic ? "10 طن" : "10 Tons"}</SelectItem>
                    <SelectItem value="20 tons">{isArabic ? "20 طن" : "20 Tons"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "مكان الاستلام (Pickup)" : "Pickup Location"}</Label>
                <Input 
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                  placeholder={isArabic ? "العاشر من رمضان" : "10th of Ramadan"}
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "مكان التسليم (Delivery)" : "Delivery Location"}</Label>
                <Input 
                  value={formData.deliveryLocation}
                  onChange={(e) => setFormData({...formData, deliveryLocation: e.target.value})}
                  placeholder={isArabic ? "برج العرب، الإسكندرية" : "Borg El Arab, Alexandria"}
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isArabic ? "نشر الطلب" : "Post Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="text-center py-20 border-dashed">
            <CardContent>
              <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium text-muted-foreground">
                {isArabic ? "لا توجد طلبات نقل مفتوحة حالياً" : "No open transport requests at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request) => (
              <Card key={request._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-background">
                        {request.truckType}
                      </Badge>
                      <CardTitle className="text-xl">{request.productName}</CardTitle>
                    </div>
                    <Badge className={request.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {request.status === 'open' ? (isArabic ? 'مفتوح' : 'Open') : (isArabic ? 'تم التعيين' : 'Assigned')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{isArabic ? "الكمية:" : "Qty:"}</span>
                      <span className="font-bold">{request.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground text-xs">
                        {new Date(request.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "من:" : "From:"}</p>
                        <p className="font-medium">{request.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-red-600 mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "إلى:" : "To:"}</p>
                        <p className="font-medium">{request.deliveryLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Dialog onOpenChange={(open) => {
                      if (open) {
                        setSelectedRequest(request);
                        fetchOffers(request._id);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          {isArabic ? "عرض العروض" : "View Offers"}
                          {request.offers?.length > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                              {request.offers.length}
                            </Badge>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
                        <DialogHeader>
                          <DialogTitle>{isArabic ? "العروض المقدمة" : "Driver Offers"}</DialogTitle>
                          <DialogDescription>
                            {request.productName} | {request.pickupLocation} ➔ {request.deliveryLocation}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue={isOwner ? "offers" : "submit"} className="flex-1 overflow-hidden flex flex-col mt-4">
                          <TabsList className="w-full">
                            {isOwner && (
                              <TabsTrigger value="offers" className="flex-1">{isArabic ? "العروض الحالية" : "Current Offers"}</TabsTrigger>
                            )}
                            {request.status === 'open' && (
                              <TabsTrigger value="submit" className="flex-1">{isArabic ? "تقديم عرض جديد" : "Submit New Offer"}</TabsTrigger>
                            )}
                          </TabsList>
                          
                          {isOwner && (
                            <TabsContent value="offers" className="flex-1 overflow-y-auto pt-4 pr-1">
                              {loadingOffers ? (
                                <div className="flex justify-center py-10">
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                              ) : offers.length === 0 ? (
                                <p className="text-center py-10 text-muted-foreground">
                                  {isArabic ? "لا توجد عروض لهذا الطلب بعد" : "No offers for this request yet"}
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  {offers.map((offer) => (
                                    <Card key={offer._id} className={offer.requestId.status === 'assigned' && offer.isAssigned ? 'border-primary ring-1 ring-primary' : ''}>
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                              <Truck className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                              <p className="text-sm font-bold">{offer.driverId?.name || (isArabic ? 'سائق' : 'Driver')}</p>
                                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(offer.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                                              </div>
                                            </div>
                                          </div>
                                          <p className="text-lg font-bold text-green-600">{offer.price} EGP</p>
                                        </div>
                                        {offer.message && (
                                          <div className="bg-muted/50 p-2 rounded text-xs mb-3 flex items-start gap-2">
                                            <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground" />
                                            <p>{offer.message}</p>
                                          </div>
                                        )}
                                        {request.status === 'open' && (
                                          <Button 
                                            className="w-full h-8 text-xs" 
                                            variant="secondary"
                                            disabled={submitting}
                                            onClick={() => handleAssignDriver(offer._id, request._id)}
                                          >
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            {isArabic ? "اختيار هذا السائق" : "Choose this Driver"}
                                          </Button>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </TabsContent>
                          )}
                          
                          <TabsContent value="submit" className="pt-4">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>{isArabic ? "عرض السعر (EGP)" : "Price Offer (EGP)"}</Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    className="pl-9"
                                    type="number"
                                    value={offerData.price}
                                    onChange={(e) => setOfferData({...offerData, price: e.target.value})}
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>{isArabic ? "رسالة إضافية" : "Additional Message"}</Label>
                                <Input 
                                  value={offerData.message}
                                  onChange={(e) => setOfferData({...offerData, message: e.target.value})}
                                  placeholder={isArabic ? "مثال: متاح شاحنة مجهزة لنقل المواد الكيميائية" : "e.g. Equipped truck available for chemical transport"}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                disabled={submitting}
                                onClick={() => handleSubmitOffer(request._id)}
                              >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {isArabic ? "تقديم العرض الآن" : "Submit Offer Now"}
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
