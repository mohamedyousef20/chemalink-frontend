"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Search, X, Loader2, Beaker, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils"
import { productService } from "@/lib/api"

interface ProductSearchProps {
  onSearch: (query: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  minChars?: number
  immediateSearch?: boolean
}

export function ProductSearch({
  onSearch,
  onClear,
  placeholder,
  className,
  autoFocus = false,
  minChars = 1,
  immediateSearch = false,
}: ProductSearchProps) {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions when search query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const response = await productService.getProducts({ 
            search: searchQuery,
            limit: 10 
          })
          if (response.data && response.data.products) {
            setSuggestions(response.data.products)
            setShowSuggestions(true)
          }
        } catch (error) {
          console.error("Failed to fetch suggestions:", error)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const timer = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < minChars) {
      return
    }

    setIsSearching(true)
    setShowSuggestions(false)
    try {
      await onSearch(query)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }, [onSearch, minChars])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (immediateSearch && value.trim().length >= minChars) {
      handleSearch(value)
    }
  }, [handleSearch, immediateSearch, minChars])

  const handleSuggestionClick = (product: any) => {
    setSearchQuery(product.title)
    setShowSuggestions(false)
    handleSearch(product.title)
  }

  const handleClear = useCallback(() => {
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
    onClear?.()
  }, [onClear])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      handleSearch(searchQuery)
    }
  }, [searchQuery, handleSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }, [handleClear])

  const defaultPlaceholder = language === "ar"
    ? `ابحث باسم المادة الكيميائية (مثال: ايثانول)... ${minChars > 1 ? `(حد أدنى ${minChars} حروف)` : ''}`
    : `Search by chemical name (e.g. ايثانول)... ${minChars > 1 ? `(min ${minChars} chars)` : ''}`

  const showClearButton = searchQuery && !isSearching
  const showLoader = isSearching

  return (
    <div className={cn("relative w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="relative w-full"
        role="search"
      >
        <div className="relative">
          <Beaker className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 rtl:left-auto rtl:right-3" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
            placeholder={placeholder || defaultPlaceholder}
            autoFocus={autoFocus}
            className={cn(
              "pl-10 pr-10 rtl:pr-10 rtl:pl-10 transition-all",
              searchQuery && "pr-20 rtl:pl-20"
            )}
            aria-label={language === "ar" ? "شريط البحث" : "Search bar"}
            aria-busy={isSearching}
          />

          {/* Loading Indicator */}
          {showLoader && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3"
              role="status"
              aria-label={language === "ar" ? "جاري البحث" : "Searching"}
            >
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Clear Button */}
          {showClearButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rtl:right-auto rtl:left-1"
              aria-label={language === "ar" ? "مسح البحث" : "Clear search"}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((product) => (
            <button
              key={product._id}
              className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center justify-between text-sm transition-colors border-b last:border-0 rtl:text-right"
              onClick={() => handleSuggestionClick(product)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{product.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {language === "ar" ? product.category?.name : product.category?.nameEn}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600">
                  {product.price} {language === "ar" ? "ج.م" : "EGP"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}