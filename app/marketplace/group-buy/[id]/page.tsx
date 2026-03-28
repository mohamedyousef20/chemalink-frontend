"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Package,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { marketplaceService } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function GroupBuyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [agreedToCommitment, setAgreedToCommitment] = useState(false);
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    // Check language from html lang attribute or similar
    setIsArabic(document.documentElement.lang === 'ar');
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.groupBuy.getById(id as string);
      console.log(response, 'jkdfjk')
      if (response.data.success) {
        setCampaign(response.data.data.groupBuy);
        setQuantity(response.data.data.groupBuy?.minOrderQuantity || 1);
      } else {
        toast.error(isArabic ? "فشل في تحميل تفاصيل الحملة" : "Failed to load campaign details");
      }
    } catch (error: any) {
      console.error("Error fetching campaign:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!agreedToCommitment) {
      toast.error(isArabic ? "يجب الموافقة على التعهد المالي" : "You must agree to the financial commitment");
      return;
    }

    if (quantity < campaign.minOrderQuantity) {
      toast.error(isArabic ? `الحد الأدنى للطلب هو ${campaign.minOrderQuantity}` : `Minimum order quantity is ${campaign.minOrderQuantity}`);
      return;
    }

    const remaining = campaign.targetQuantity - campaign.currentQuantity;
    if (quantity > remaining) {
      toast.error(isArabic ? `الكمية المتاحة فقط هي ${remaining}` : `Only ${remaining} units remaining`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await marketplaceService.groupBuy.join(id as string, {
        quantity,
        financialCommitment: true,
        paymentMethod: 'cash' // Default for now
      });
      if (response.data.success) {
        toast.success(isArabic ? "فى انتظار مراجعة الادارة  تم الانضمام للحملة بنجاح" : "Successfully joined the campaign");
        router.refresh();
        fetchCampaignDetails(); // Refresh data
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join campaign");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          {isArabic ? "جاري تحميل تفاصيل الحملة..." : "Loading campaign details..."}
        </p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{isArabic ? "الحملة غير موجودة" : "Campaign Not Found"}</h2>
        <Button asChild className="mt-4">
          <Link href="/">{isArabic ? "العودة للرئيسية" : "Back to Home"}</Link>
        </Button>
      </div>
    );
  }

  const progress = Math.min(100, Math.round((campaign.currentQuantity / campaign.targetQuantity) * 100));
  const remaining = campaign.targetQuantity - campaign.currentQuantity;
  const deadline = new Date(campaign.deadline).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12" dir={isArabic ? 'rtl' : 'ltr'}>
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> {isArabic ? "رجوع" : "Back"}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-primary/5 p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="outline" className="mb-2 bg-background">
                    {campaign.purity}% {isArabic ? "نقاء" : "Purity"}
                  </Badge>
                  <h1 className="text-3xl font-bold text-primary">{campaign.chemicalName}</h1>
                </div>
                <Badge className={campaign.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {isArabic ? (campaign.status === 'Open' ? 'نشط' : campaign.status) : campaign.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-background rounded-full border shadow-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">{isArabic ? "السعر" : "Price"}</p>
                    <p className="text-sm font-bold">{campaign.pricePerUnit} EGP</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-background rounded-full border shadow-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">{isArabic ? "الموعد" : "Deadline"}</p>
                    <p className="text-sm font-bold">{deadline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-background rounded-full border shadow-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">{isArabic ? "التسليم" : "Delivery"}</p>
                    <p className="text-sm font-bold truncate max-w-[100px]">{campaign.deliveryLocation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-background rounded-full border shadow-sm">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">{isArabic ? "الوحدة" : "Unit"}</p>
                    <p className="text-sm font-bold uppercase">{campaign.unit}</p>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {isArabic ? "عن الحملة" : "About Campaign"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {campaign.description || (isArabic ? "لا يوجد وصف متاح." : "No description available.")}
              </p>

              <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isArabic ? "المورد" : "Supplier"}</p>
                    <p className="font-bold">{campaign.supplier?.isTrustedSeller}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> {campaign.supplier?.isTrustedSeller ? "مورد موثوق" : ""}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Action */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-xl">{isArabic ? "انضم الآن" : "Join Now"}</CardTitle>
              <CardDescription>
                {isArabic ? "احجز حصتك في الشراء الجماعي" : "Reserve your share in this group buy"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>{isArabic ? "التقدم الحالي" : "Current Progress"}</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{campaign.currentQuantity} {campaign.unit} {isArabic ? "محجوز" : "Reserved"}</span>
                  <span>{campaign.targetQuantity} {campaign.unit} {isArabic ? "هدف" : "Target"}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-bold">
                    {isArabic ? "الكمية المطلوبة" : "Order Quantity"} ({campaign.unit})
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      min={campaign.minOrderQuantity}
                      max={remaining}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="text-lg font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    {isArabic
                      ? `الحد الأدنى: ${campaign.minOrderQuantity} ${campaign.unit} | المتبقي: ${remaining} ${campaign.unit}`
                      : `Min: ${campaign.minOrderQuantity} ${campaign.unit} | Remaining: ${remaining} ${campaign.unit}`}
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-800">{isArabic ? "الإجمالي التقديري" : "Estimated Total"}</span>
                    <span className="text-lg font-bold text-green-900">{(quantity * campaign.pricePerUnit).toLocaleString()} EGP</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 space-x-reverse pt-2">
                  <Checkbox
                    id="commitment"
                    checked={agreedToCommitment}
                    onCheckedChange={(checked) => setAgreedToCommitment(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="commitment"
                      className="text-xs font-bold text-primary leading-tight cursor-pointer"
                    >
                      {isArabic ? "تعهد مالي (تعهد بالشراء)" : "Financial Commitment"}
                    </label>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        {isArabic
                          ? "أتعهد بشراء الكمية المحددة بالسعر المعلن عند اكتمال الحملة."
                          : "I commit to purchasing the specified quantity at the advertised price when the campaign is completed."}
                      </p>
                      {/* الملحوظة الجديدة باللون البرتقالي لتنبيه المستخدم */}
                      <p className="text-[10px] font-bold text-orange-600 leading-normal flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {isArabic
                          ? "ملاحظة: عند موافقة الإدارة، يجب دفع 1% كـ (تعهد وفاء) لضمان جدية الطلب."
                          : "Note: Upon management approval, a 1% (Commitment Fee) must be paid to ensure order validity."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-muted/20 border-t">
              <Button
                className="w-full h-12 text-lg font-bold shadow-md"
                disabled={submitting || !agreedToCommitment || campaign.status !== 'Open'}
                onClick={handleJoin}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isArabic ? "جاري المعالجة..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {isArabic ? "تأكيد الانضمام" : "Confirm Join"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1 mb-2">
              <ShieldCheck className="h-3 w-3" /> {isArabic ? "كيف يعمل الشراء الجماعي؟" : "How Group Buy Works?"}
            </h4>
            <ol className="text-[10px] text-blue-700 space-y-1 list-decimal list-inside">
              <li>{isArabic ? "اختر الكمية التي تحتاجها" : "Select the quantity you need"}</li>
              <li>{isArabic ? "تعهد بالشراء عند اكتمال العدد" : "Commit to buy when target is met"}</li>
              <li>{isArabic ? "عند اكتمال الحملة، سيتم تحويل طلبك لطلب شراء حقيقي" : "Once target reached, your reservation becomes a real order"}</li>
              <li>{isArabic ? "ستحصل على السعر المخفض المعلن" : "You get the advertised discounted price"}</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
