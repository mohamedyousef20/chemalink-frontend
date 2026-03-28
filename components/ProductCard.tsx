"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Star, Package, Beaker, FlaskConical, Droplets, Badge } from "lucide-react"
import { toast } from 'sonner';
import { cartService, wishlistService, marketplaceService } from "@/lib/api"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

type ProductColorOption = {
  name: string
  value: string
  available: boolean
}

type ProductRatings = {
  average: number
  count: number
}

type ProductCardProduct = {
  _id: string
  title: string
  images: string[]
  price: number
  discountPercentage?: number
  discountedPrice?: number
  quantity: number
  productType?: 'lab' | 'commercial'
  unit?: string
  category?: {
    name?: string
    nameEn?: string
  }
  ratings?: ProductRatings
  sold?: number
  isFeatured?: boolean
  sellerTrusted?: boolean
  isFavorite?: boolean
}

interface ProductCardProps {
  product: ProductCardProduct
  language: string
  onAddToCart?: (productId: string) => void
  onToggleWishlist?: (productId: string) => Promise<void> | void
  isFavorite?: boolean
}

export function ProductCard({ product, language, onAddToCart, onToggleWishlist, isFavorite: isFavoriteProp }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [isSubmittingRFQ, setIsSubmittingRFQ] = useState(false)
  const [isJoiningGroupBuy, setIsJoiningGroupBuy] = useState(false)

  const requestQuoteHandler = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product) return
    setIsSubmittingRFQ(true)
    try {
      await marketplaceService.rfq.createRFQ({
        chemicalName: product.title,
        quantity: 1,
        unit: product.unit || 'kg',
        deliveryLocation: 'Cairo',
        deliveryTime: 'Immediate',
        description: `Request for ${product.title}`
      })
      toast.success(language === 'ar' ? 'تم إرسال طلب عرض السعر' : 'RFQ submitted')
    } catch (err: any) {
      toast.error(language === 'ar' ? 'فشل إرسال الطلب' : 'Failed to submit RFQ')
    } finally {
      setIsSubmittingRFQ(false)
    }
  }, [product, language])

  const joinGroupBuyHandler = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product) return
    setIsJoiningGroupBuy(true)
    try {
      const activeGroupBuys = await marketplaceService.groupBuy.getActiveCampaigns({
        chemicalName: product.title,
        status: 'Active'
      })

      if (activeGroupBuys.data && activeGroupBuys.data.length > 0) {
        await marketplaceService.groupBuy.joinCampaign(activeGroupBuys.data[0]._id, {
          quantity: 1,
          deliveryAddressId: 'default',
        })
        toast.success(language === 'ar' ? 'تم الانضمام للشراء الجماعي' : 'Joined group buy')
      } else {
        toast.error(language === 'ar' ? 'لا توجد حملات نشطة' : 'No active group buys')
      }
    } catch (err: any) {
      toast.error(language === 'ar' ? 'فشل الانضمام' : 'Failed to join')
    } finally {
      setIsJoiningGroupBuy(false)
    }
  }, [product, language])

  const computedDiscountedPrice = useMemo(() => {
    if (product.discountedPrice && product.discountedPrice > 0) {
      return product.discountedPrice
    }
    if (product.discountPercentage && product.discountPercentage > 0) {
      const discountAmount = product.price * (product.discountPercentage / 100)
      return Number((product.price - discountAmount).toFixed(2))
    }
    return product.price
  }, [product.discountedPrice, product.discountPercentage, product.price])

  const hasDiscount = computedDiscountedPrice < product.price
  const isLowStock = product.quantity > 0 && product.quantity <= 5
  const isOutOfStock = product.quantity === 0

  useEffect(() => {
    if (typeof isFavoriteProp === "boolean") {
      setIsFavorite(isFavoriteProp)
    } else {
      setIsFavorite(product.isFavorite || false)
    }
  }, [isFavoriteProp, product.isFavorite])


  // Toggle Favorite Handler - للزر العلوي (إضافة/إزالة)
  const toggleWishlistHandler = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onToggleWishlist) {
      setIsTogglingFavorite(true)
      try {
        await onToggleWishlist(product._id)
      } finally {
        setIsTogglingFavorite(false)
      }
      return
    }

    setIsTogglingFavorite(true)
    try {
      await wishlistService.toggleWishlist(product._id)

      const newFavoriteStatus = !isFavorite
      setIsFavorite(newFavoriteStatus)

      toast.success(
        newFavoriteStatus
          ? (language === "ar" ? "تمت الإضافة إلى المفضلة" : "Added to favorites")
          : (language === "ar" ? "تم الحذف من المفضلة" : "Removed from favorites")
      )
    } catch (error) {
      console.error('Toggle favorite error:', error)
      toast.error(language === "ar" ? "فشل تحديث المفضلة" : "Failed to update favorites")
    } finally {
      setIsTogglingFavorite(false)
    }
  }, [onToggleWishlist, product._id, isFavorite, language])

  const addToCartHandler = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) {
      toast.error(language === "ar" ? "المنتج غير متوفر" : "Product is out of stock")
      return
    }

    setIsAddingToCart(true)
    try {
      await cartService.addToCart({
        productId: product._id,
        quantity: 1
      })

      toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart")
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error(language === "ar" ? "فشل إضافة المنتج إلى السلة" : "Failed to add product to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }, [product._id, isOutOfStock, language])




  return (
    <Link href={`/products/${product._id}`} className="block" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md">
        {/* Product Image */}
        <div className="aspect-square relative">
          <Image
            src={normalizeImageUrl(product.images[0])}
            alt={product.title}
            fill
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = "/placeholder.svg";
            }}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges and Wishlist Button */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{product.discountPercentage}%
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                {language === "ar" ? "مميز" : "Featured"}
              </span>
            )}
            {product.sellerTrusted && (
              <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold pl-3 pr-4 py-2 rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{language === "ar" ? "منتج موثوق" : "Trusted Product"}</span>
              </div>
            )}
            {isOutOfStock && (
              <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
                {language === "ar" ? "نفذت الكمية" : "Out of Stock"}
              </span>
            )}
          </div>

          {/* Wishlist Button - Top Right */}
          <button
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all z-10 ${isFavorite
              ? 'bg-red-500 text-white opacity-100 scale-110'
              : 'bg-white/90 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
              }`}
            onClick={toggleWishlistHandler}
            disabled={isTogglingFavorite}
            title={isFavorite ?
              (language === "ar" ? "إزالة من المفضلة" : "Remove from favorites") :
              (language === "ar" ? "إضافة إلى المفضلة" : "Add to favorites")
            }
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white' : 'text-gray-700'}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3">
          {/* Category & Type */}
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-500">
              {language === "ar" ? product.category?.name : product.category?.nameEn}
            </p>
            {product.productType && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                {language === "ar" 
                  ? (product.productType === 'lab' ? 'معملي' : 'تجاري') 
                  : (product.productType === 'lab' ? 'Lab' : 'Commercial')}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1 flex items-center gap-1">
            <Beaker className="h-3.5 w-3.5 text-blue-500" />
            {product.title}
          </h3>

          {/* Rating & Sold */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-xs text-gray-600">
                {product?.ratings?.average?.toFixed(2) ?? "0.0"}
              </span>
              <span className="ml-0.5 text-xs text-gray-400">
                ({product?.ratings?.count})
              </span>
            </div>
            {(product.sold ?? 0) > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Package className="h-3.5 w-3.5 mr-1" />
                {product.sold ?? 0} {language === "ar" ? "مباع" : "sold"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            {hasDiscount ? (
              <>
                <span className="text-base font-bold text-blue-600">
                  {computedDiscountedPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-blue-600">
                {product.price.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
              </span>
            )}
            <span className="text-xs text-gray-500 font-medium">
              / {language === "ar" ? (product.unit || "كجم") : (product.unit || "kg")}
            </span>
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-gray-500 flex items-center gap-1">
              <Package className="h-3 w-3" />
              {language === "ar" ? `المتاح: ${product.quantity}` : `Stock: ${product.quantity}`} {product.unit}
            </div>
          </div>

          {/* Stock Warning */}
          {isLowStock && (
            <p className="text-xs text-orange-600 font-medium">
              {language === "ar" ? `${product.quantity} متبقي فقط` : `Only ${product.quantity} left`}
            </p>
          )}

          {/* Buttons Container */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-slate-900 hover:bg-slate-800"
                size="sm"
                disabled={isOutOfStock || isAddingToCart}
                onClick={addToCartHandler}
              >
                {isAddingToCart ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    {language === "ar" ? "جاري الإضافة..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {isOutOfStock
                      ? (language === "ar" ? "نفذت الكمية" : "Out of Stock")
                      : (language === "ar" ? "أضف للسلة" : "Add to Cart")
                    }
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="px-3"
                onClick={toggleWishlistHandler}
                disabled={isTogglingFavorite}
                title={isFavorite ?
                  (language === "ar" ? "إزالة من المفضلة" : "Remove from favorites") :
                  (language === "ar" ? "إضافة إلى المفضلة" : "Add to favorites")
                }
              >
                {isTogglingFavorite ? (
                  <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-xs font-semibold"
                size="sm"
                onClick={requestQuoteHandler}
                disabled={isSubmittingRFQ}
              >
                <FlaskConical className="h-3.5 w-3.5 mr-1" />
                {isSubmittingRFQ ? "..." : (language === "ar" ? "اطلب عرض سعر" : "Quote")}
              </Button>
              
              <Button
                className="flex-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50 h-8 text-xs font-semibold"
                variant="outline"
                size="sm"
                onClick={joinGroupBuyHandler}
                disabled={isJoiningGroupBuy}
              >
                <Package className="h-3.5 w-3.5 mr-1" />
                {isJoiningGroupBuy ? "..." : (language === "ar" ? "شراء جماعي" : "Group Buy")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}