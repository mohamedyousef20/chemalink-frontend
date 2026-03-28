"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MapPin, Package, Clock, CheckCircle2, AlertCircle, Loader2, Upload, Globe, UserCheck, CreditCard, MessageCircle } from "lucide-react";
import { logisticsService } from "@/lib/logisticsService";
import { toast } from "sonner";
import LogisticsChat from "@/components/logistics/LogisticsChat";
import { useAuthStore } from "@/store/useAuthStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DriverDashboard() {
  const { user: currentUser } = useAuthStore();
  const [subscription, setSubscription] = useState<any>(null);
  // ... existing states ...
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [chatDeliveryId, setChatDeliveryId] = useState<string | null>(null);
  const [nearbyJobs, setNearbyJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [otp, setOtp] = useState<{ [key: string]: string }>({});
  const [isArabic, setIsArabic] = useState(false);
  const [showVerificationForm, setShowAddVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({
    nationalId: "",
    licenseNumber: "",
    vehicleType: "motorcycle",
    vehicleNumber: ""
  });

  useEffect(() => {
    setIsArabic(document.documentElement.lang === 'ar');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, jobsRes] = await Promise.all([
        logisticsService.subscriptions.getStatus(),
        logisticsService.deliveries.getDriverDeliveries()
      ]);
      setSubscription(subRes.data.data);
      setMyJobs(jobsRes.data.data);
      
      // If subscription is active or trial, fetch nearby jobs
      if (subRes.data.data.status === 'active' || subRes.data.data.status === 'trial') {
        const nearbyRes = await logisticsService.deliveries.getNearby(30.0444, 31.2357); // Cairo default
        setNearbyJobs(nearbyRes.data.data);
      }
    } catch (error) {
      toast.error(isArabic ? "فشل في تحميل بيانات لوحة التحكم" : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      method: formData.get('method') as string,
      transactionId: formData.get('transactionId') as string,
      url: "https://placeholder-url.com/proof.jpg" // Mock URL for now
    };

    try {
      setUploading(true);
      await logisticsService.subscriptions.uploadProof(data);
      toast.success(isArabic ? "تم رفع إثبات الدفع! في انتظار موافقة المسؤول." : "Payment proof uploaded! Waiting for admin approval.");
      fetchData();
    } catch (error) {
      toast.error(isArabic ? "فشل الرفع" : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await logisticsService.deliveries.apply(jobId);
      toast.success(isArabic ? "تم تقديم الطلب بنجاح!" : "Application submitted!");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isArabic ? "فشل في التقديم" : "Failed to apply"));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      await logisticsService.users.updateDriverProfile({
        ...verificationData,
        verificationDocuments: {
          nationalIdCardFront: "https://placeholder.com/id_front.jpg",
          drivingLicenseFront: "https://placeholder.com/license_front.jpg"
        }
      });
      toast.success(isArabic ? "تم تحديث البيانات بنجاح!" : "Profile updated successfully!");
      setShowAddVerification(false);
      fetchData();
    } catch (error) {
      toast.error(isArabic ? "فشل التحديث" : "Update failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10" /></div>;

  return (
    <div className="container mx-auto p-4 space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8 text-primary" /> {isArabic ? "لوحة تحكم السائق" : "Driver Dashboard"}
        </h1>
        <Badge variant={subscription?.status === 'active' || subscription?.status === 'trial' ? 'default' : 'destructive'}>
          {isArabic ? "الحالة:" : "Status:"} {subscription?.status?.toUpperCase()}
        </Badge>
      </header>

      {!subscription?.driverId?.driverProfile?.isVerified && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> {isArabic ? "توثيق الهوية مطلوب" : "Identity Verification Required"}
            </CardTitle>
            <CardDescription>{isArabic ? "يرجى إكمال بياناتك وتوثيق حسابك لتتمكن من سحب الأرباح والحصول على ثقة البائعين." : "Please complete your profile and verify your account to withdraw earnings and gain seller trust."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showVerificationForm} onOpenChange={setShowAddVerification}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white hover:bg-blue-100 border-blue-300 text-blue-700">
                  {isArabic ? "إكمال بيانات التوثيق" : "Complete Verification"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" dir={isArabic ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle>{isArabic ? "بيانات السائق" : "Driver Details"}</DialogTitle>
                  <DialogDescription>{isArabic ? "أدخل بياناتك الشخصية وبيانات المركبة." : "Enter your personal and vehicle details."}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? "الرقم القومي" : "National ID"}</Label>
                      <Input 
                        value={verificationData.nationalId} 
                        onChange={(e) => setVerificationData({...verificationData, nationalId: e.target.value})}
                        required 
                        maxLength={14}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? "رقم الرخصة" : "License Number"}</Label>
                      <Input 
                        value={verificationData.licenseNumber} 
                        onChange={(e) => setVerificationData({...verificationData, licenseNumber: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "نوع المركبة" : "Vehicle Type"}</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={verificationData.vehicleType}
                      onChange={(e) => setVerificationData({...verificationData, vehicleType: e.target.value})}
                    >
                      <option value="motorcycle">{isArabic ? "دراجة نارية" : "Motorcycle"}</option>
                      <option value="car">{isArabic ? "سيارة" : "Car"}</option>
                      <option value="van">{isArabic ? "فان" : "Van"}</option>
                      <option value="truck_small">{isArabic ? "نقل صغير" : "Small Truck"}</option>
                      <option value="truck_large">{isArabic ? "نقل ثقيل" : "Large Truck"}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "رقم اللوحة" : "Vehicle Plate Number"}</Label>
                    <Input 
                      value={verificationData.vehicleNumber} 
                      onChange={(e) => setVerificationData({...verificationData, vehicleNumber: e.target.value})}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : (isArabic ? "حفظ وإرسال للتوثيق" : "Save & Submit for Verification")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {subscription?.status === 'expired' && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> {isArabic ? "الاشتراك مطلوب" : "Subscription Required"}
            </CardTitle>
            <CardDescription>{isArabic ? "انتهت فترة التجربة أو الاشتراك. يرجى رفع إثبات الدفع للمتابعة." : "Your trial or subscription has expired. Please upload payment proof to continue."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadProof} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{isArabic ? "طريقة الدفع" : "Payment Method"}</Label>
                <select name="method" className="w-full p-2 border rounded">
                  <option value="vodafone_cash">{isArabic ? "فودافون كاش" : "Vodafone Cash"}</option>
                  <option value="bank_transfer">{isArabic ? "تحويل بنكي" : "Bank Transfer"}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "رقم المعاملة" : "Transaction ID"}</Label>
                <Input name="transactionId" required placeholder={isArabic ? "أدخل رقم المرجع" : "Enter Reference Number"} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isArabic ? "إرسال الدفع" : "Submit Payment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="nearby">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nearby">{isArabic ? "وظائف قريبة" : "Nearby Jobs"} ({nearbyJobs.length})</TabsTrigger>
          <TabsTrigger value="active">{isArabic ? "توصيلاتي" : "My Deliveries"} ({myJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="nearby" className="space-y-4 pt-4">
          {nearbyJobs.map(job => (
            <Card key={job._id}>
              <CardContent className="p-4 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <Package className="h-5 w-5 text-primary" /> {job.productName}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {isArabic ? "من:" : "From:"} {job.pickup.address}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {isArabic ? "إلى:" : "To:"} {job.dropoff.address}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-2xl font-bold text-green-600">{job.price.amount} {isArabic ? "ج.م" : "EGP"}</span>
                  <Button onClick={() => handleApply(job._id)} disabled={subscription?.status === 'expired'}>
                    {isArabic ? "التقديم للوظيفة" : "Apply for Job"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {nearbyJobs.length === 0 && <p className="text-center py-10 text-muted-foreground">{isArabic ? "لا توجد وظائف قريبة." : "No nearby jobs found."}</p>}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 pt-4">
          {myJobs.map(job => (
            <Card key={job._id} className={job.status === 'completed' ? 'opacity-70' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-4">
                  <Badge>{isArabic ? job.status.replace('_', ' ') : job.status.replace('_', ' ')}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {new Date(job.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">{job.productName}</p>
                    <p className="text-sm">{job.pickup.address} ➔ {job.dropoff.address}</p>
                  </div>
                  {job.status === 'driver_assigned' && (
                    <div className="flex flex-col gap-2 pt-2 border-t">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>{isArabic ? "رمز التوصيل" : "Delivery Code"}</Label>
                          <Input 
                            placeholder={isArabic ? "رمز 6 أرقام" : "6-digit code"} 
                            maxLength={6}
                            value={otp[job._id] || ""}
                            onChange={(e) => setOtp({...otp, [job._id]: e.target.value})}
                          />
                        </div>
                        <Button onClick={() => handleComplete(job._id)}>
                          {isArabic ? "تحقق وإكمال" : "Verify & Complete"}
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => {
                          setChatDeliveryId(job._id);
                          setIsChatDialogOpen(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {isArabic ? "التحدث مع البائع" : "Chat with Seller"}
                      </Button>
                    </div>
                  )}
                  {job.status === 'completed' && (
                    <div className="flex items-center text-green-600 font-bold gap-2">
                      <CheckCircle2 className="h-5 w-5" /> {isArabic ? "تم تحرير الدفعة" : "Payment Released"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0" dir={isArabic ? 'rtl' : 'ltr'}>
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{isArabic ? "المحادثة مع البائع" : "Chat with Seller"}</DialogTitle>
          </DialogHeader>
          {chatDeliveryId && currentUser && (
            <LogisticsChat deliveryId={chatDeliveryId} currentUser={currentUser} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
