"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { toast } from 'sonner'
import { categoryService } from "@/lib/api"

// تحديث الواجهة لتطابق النموذج الجديد
interface Category {
  _id: string;
  name: string; // تم التغيير من object إلى string
  slug: string; // إضافة slug لاستخدامه في الروابط
  // image?: string;
  description?: string;
  commonApplications?: string[];
}

export function CategorySection() {
  const { language } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await categoryService.getCategories();
        // تأكد من الوصول للبيانات بشكل صحيح حسب بنية الـ API لديك
        setCategories(response.data || [])
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-8">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (error || categories.length === 0) {
    return null; // أو عرض رسالة "لا توجد فئات"
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {language === "ar" ? "تصفح حسب الفئة الكيميائية" : "Browse by Chemical Category"}
        </h2>
        <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
          {language === "ar" ? "عرض الكل" : "View All"}
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/categories/${category.slug || category._id}`} // استخدام الـ slug في الرابط أفضل لـ SEO
          >
            <Card className="group overflow-hidden transition-all hover:shadow-lg border-muted hover:border-primary/50">

              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.commonApplications && category.commonApplications.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 hidden sm:block">
                    {category.commonApplications[0]}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}