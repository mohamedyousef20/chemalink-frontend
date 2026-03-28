"use client"

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Shield, Scale, Info } from "lucide-react"

const sections = [
  {
    id: "definitions",
    titleEn: "Definitions",
    titleAr: "التعريفات",
    icon: Info,
    contentEn: [
      "Chemalink is a multi-vendor B2B chemical marketplace platform.",
      "User refers to any visitor, buyer, or supplier using the platform.",
      "Seller/Supplier is a registered user who publishes products on Chemalink.",
      "Services include browsing, carts, RFQs, group buys, notifications, and industrial dashboards."
    ],
    contentAr: [
      "Chemalink: منصة تجارة إلكترونية B2B لتداول المواد الكيميائية تديرها شركة Chemalink.",
      "المستخدم: أي شخص يستخدم المنصة كمشتري أو مورد أو زائر.",
      "البائع/المورد: مستخدم مسجَّل يعرض منتجاته الكيميائية عبر Chemalink.",
      "الخدمات: جميع الميزات المتاحة مثل عرض المنتجات، طلبات عرض السعر (RFQ)، الشراء الجماعي، الإشعارات، ولوحات التحكم الصناعية."
    ],
  },
  {
    id: "consent",
    titleEn: "Acceptance",
    titleAr: "الموافقة على الشروط",
    icon: CheckCircle,
    contentEn: [
      "Using Chemalink implies acceptance of these terms.",
      "Chemalink may update the Terms periodically; continued use means acceptance."
    ],
    contentAr: [
      "استخدامك لـ Chemalink يعني قبولك لهذه الشروط.",
      "يحق لـ Chemalink تعديل الشروط ونشرها، واستمرار الاستخدام يعد موافقة."
    ],
  },
  {
    id: "eligibility",
    titleEn: "Eligibility & Accounts",
    titleAr: "الأهلية والحساب",
    icon: Shield,
    contentEn: [
      "You must be 18+ or legally authorized to represent the account holder.",
      "Provide accurate registration information and keep your credentials secure.",
      "Verification (email, phone, ID) may be required for certain operations."
    ],
    contentAr: [
      "يجب أن يكون عمر المستخدم 18 سنة فأكثر أو أن يكون ممثلاً قانونياً لشركة.",
      "يجب إدخال معلومات صحيحة عند التسجيل والحفاظ على سرية بيانات الدخول.",
      "قد تطلب Chemalink التحقق عبر البريد أو الهاتف أو السجل التجاري لبعض العمليات."
    ],
  },
  {
    id: "pricing",
    titleEn: "Products, Pricing & Payments",
    titleAr: "المنتجات، الأسعار والدفع",
    icon: Scale,
    contentEn: [
      "Sellers are responsible for accurate specifications, safety data sheets, and pricing.",
      "Chemalink may review or remove non-compliant listings.",
      "Default revenue split: 85% seller / 15% Chemalink (platform fees).",
      "Payments are processed through approved industrial gateways."
    ],
    contentAr: [
      "المورد مسؤول عن دقة المواصفات الفنية، أوراق السلامة (MSDS)، والأسعار.",
      "يحق لـ Chemalink مراجعة أو إيقاف المنتجات المخالفة لمعايير السلامة.",
      "نسبة مشاركة العائد الافتراضية: 85% للمورد و15% للمنصة.",
      "تُعالج المدفوعات عبر بوابات معتمدة متوافقة مع التعاملات التجارية."
    ],
  },
  {
    id: "shipping",
    titleEn: "Shipping & Returns",
    titleAr: "الشحن والاسترجاع",
    icon: Info,
    contentEn: [
      "Shipping timelines and fees are handled by the seller or agreed logistics partner.",
      "Pickup points and secret PIN confirmations may be used based on coverage.",
      "Return / exchange policies vary per seller; each listing clarifies the applicable policy."
    ],
    contentAr: [
      "تفاصيل الشحن اللوجستي والمهل والتكاليف تقع ضمن مسؤولية المورد.",
      "قد توفر Chemalink نقاط توزيع معتمدة للمواد الكيميائية.",
      "سياسات المرتجعات تخضع لمعايير التعامل مع المواد الكيميائية والحفاظ على سلامتها."
    ],
  },
  {
    id: "ratings",
    titleEn: "Content & Ratings",
    titleAr: "المحتوى والتقييمات",
    icon: Info,
    contentEn: [
      "Registered users can leave one review per product and may edit or delete it.",
      "Chemalink may moderate or remove offensive, fraudulent, or promotional content.",
      "Manipulating ratings or creating fake accounts is prohibited."
    ],
    contentAr: [
      "يمكن للمستخدمين المسجّلين إضافة تقييم واحد لكل منتج مع إمكانية التعديل أو الحذف.",
      "يحق لـ Chemalink إزالة المحتوى المخالف أو المسيء أو الاحتيالي.",
      "ممنوع التلاعب بالتقييمات أو إنشاء حسابات مزيفة لهذا الغرض."
    ],
  },
  {
    id: "legal",
    titleEn: "Liability & Termination",
    titleAr: "المسؤولية وإنهاء الحساب",
    icon: Shield,
    contentEn: [
      "Chemalink acts as a B2B intermediary and is not liable for manufacturing defects.",
      "Chemalink may suspend accounts for safety violations or fraud.",
      "Disputes fall under governing commercial laws."
    ],
    contentAr: [
      "تعمل Chemalink كوسيط B2B ولا تتحمل مسؤولية عيوب التصنيع الكيميائية.",
      "يحق للمنصة تعليق الحساب عند مخالفة معايير السلامة أو الاحتيال.",
      "تُطبق القوانين التجارية المعمول بها على النزاعات."
    ],
  },
]

export default function TermsAndConditionsPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 text-sm">
          {isArabic ? "مستند قانوني" : "Legal Document"}
        </Badge>
        <div className="space-y-3">
          <h1 className={cn("text-3xl font-bold tracking-tight", isArabic && "font-[Cairo]")}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {isArabic ? "شروط الاستخدام - Chemalink" : "Chemalink Terms of Service"}
          </h1>
          <p className="text-muted-foreground" dir={isArabic ? "rtl" : "ltr"}>
            {isArabic
              ? "آخر تحديث: 25 نوفمبر 2025"
              : "Last updated: 25 November 2025"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle dir={isArabic ? "rtl" : "ltr"}>
            {isArabic ? "ملخص سريع" : "Quick Highlights"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {isArabic ? "معلومات الشحن" : "Shipping"}
              </h3>
              <p className="text-sm">
                {isArabic
                  ? "البائع أو مقدم الخدمة مسؤول عن الشحن والمهل الزمنية، مع إمكانية استخدام نقاط الاستلام."
                  : "Sellers/logistics partners handle shipping timelines; pickup hubs may apply."}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {isArabic ? "سياسة العمولات" : "Revenue Split"}
              </h3>
              <p className="text-sm">
                {isArabic
                  ? "النسبة الافتراضية 85% للمورد / 15% للمنصة رسوم تشغيل."
                  : "Default split: 85% seller / 15% Chemalink (platform fees)."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon
          const content = isArabic ? section.contentAr : section.contentEn
          const title = isArabic ? section.titleAr : section.titleEn

          return (
            <Card key={section.id} id={section.id} className="scroll-mt-20">
              <CardHeader className="flex flex-row items-center gap-3" dir={isArabic ? "rtl" : "ltr"}>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3" dir={isArabic ? "rtl" : "ltr"}>
                  {content.map((paragraph, idx) => (
                    <li key={idx} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="space-y-4" dir={isArabic ? "rtl" : "ltr"}>
          <h3 className="text-lg font-semibold">
            {isArabic ? "التواصل والدعم" : "Need to reach us?"}
          </h3>
          <p className="text-muted-foreground">
            {isArabic
              ? "للأسئلة القانونية أو التعاقدية راسلنا على mohamedyousefle@gmail.com أو استخدم صفحة الاتصال."
              : "For legal or commercial queries, email mohamedyousefle@gmail.com or use the contact form."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
