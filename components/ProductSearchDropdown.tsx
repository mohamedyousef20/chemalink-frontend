"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Search, Loader2, X } from "lucide-react"
import { productService } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/language-provider"

interface Product {
  _id: string
  title: string
  titleEn?: string
  price: number
  images: string[]
}

export function ProductSearchDropdown() {
  const { language } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await productService.getProducts({ limit: 1000 }) // Fetching a large limit to simulate "all" products
        if (response.data && response.data.products) {
          setProducts(response.data.products)
        }
      } catch (error) {
        console.error("Failed to fetch products for dropdown:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products
    const term = searchTerm.toLowerCase()
    return products.filter(product => 
      product.title.toLowerCase().includes(term) || 
      (product.titleEn && product.titleEn.toLowerCase().includes(term))
    )
  }, [products, searchTerm])

  const handleSelectProduct = (product: Product) => {
    console.log("Selected Product:", product.title)
    setSearchTerm(product.title)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder={language === "ar" ? "ابحث عن منتج..." : "Search for a product..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 h-12 text-base shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          dir={language === "ar" ? "rtl" : "ltr"}
        />
        <div className={`absolute inset-y-0 ${language === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none`}>
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className={`absolute inset-y-0 ${language === "ar" ? "left-3" : "right-3"} flex items-center text-gray-400 hover:text-gray-600`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {loading ? (
              <div className="p-4 flex items-center justify-center text-gray-500 gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span>{language === "ar" ? "جاري التحميل..." : "Loading products..."}</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ul className="py-1">
                {filteredProducts.map((product) => (
                  <li
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-0 border-gray-50"
                  >
                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Search className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {product.title}
                      </p>
                      {product.titleEn && product.titleEn !== product.title && (
                        <p className="text-xs text-gray-500 truncate">{product.titleEn}</p>
                      )}
                    </div>
                    <div className="text-sm font-bold text-blue-600 whitespace-nowrap">
                      {product.price} {language === "ar" ? "ج.م" : "EGP"}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {language === "ar" ? "لم يتم العثور على منتجات" : "No products found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
