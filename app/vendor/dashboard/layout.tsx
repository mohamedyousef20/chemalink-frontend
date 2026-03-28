'use client';

import { useLanguage } from "@/components/language-provider";
import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { value: 'overview', label: language === "ar" ? "نظرة عامة" : "Overview", href: '/vendor/dashboard/overview' },
    { value: 'analytics', label: language === 'ar' ? 'التحليلات' : 'Analytics', href: '/vendor/dashboard/analytics' },
    { value: 'orders', label: t("orders"), href: '/vendor/dashboard/orders' },
    { value: 'products', label: t("products"), href: '/vendor/dashboard/products' },
    { value: 'rfqs', label: language === "ar" ? "طلبات العروض" : "RFQs", href: '/vendor/dashboard/rfqs' },
    { value: 'groupbuys', label: language === "ar" ? "الشراء الجماعي" : "Group Buys", href: '/vendor/dashboard/groupbuys' },
    { value: 'activity', label: language === 'ar' ? 'سجل الطلبات' : 'Order Activity', href: '/vendor/dashboard/activity' },
  ];

  const currentTab = tabs.find(tab => pathname.startsWith(tab.href))?.value || 'overview';

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{language === "ar" ? "لوحة تحكم المورد" : "Supplier Dashboard"}</h1>
            <p className="text-muted-foreground">
              {language === "ar"
                ? "مرحبًا بك في لوحة تحكم المورد، يمكنك إدارة المواد الكيميائية وطلبات التوريد من هنا."
                : "Welcome to your supplier dashboard, manage your chemical materials and supply orders from here."}
            </p>
          </div>
          <Button asChild>
            <Link href="/vendor/dashboard/products/new">
              <Plus className="h-4 w-4 mr-2" />
              {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
            </Link>
          </Button>
        </div>

        <Tabs value={currentTab} onValueChange={(value) => router.push(tabs.find(t => t.value === value)?.href || '/vendor/dashboard/overview')} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto p-1 bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-[120px]">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-6">
            {children}
          </div>
        </Tabs>
      </main>
    </div>
  );
}
