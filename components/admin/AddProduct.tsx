"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { productService } from "@/lib/api/services/productService";
import { Plus, Image as ImageIcon, Upload, MapPin, Truck } from "lucide-react";
import Image from "next/image";

interface AddProductProps {
  onProductAdded?: () => void;
  isArabic?: boolean;
}

interface TranslationKeys {
  productAdded: string;
  addProductFailed: string;
  addProduct: string;
  adding: string;
  price: string;
  enterPrice: string;
  stock: string;
  enterStock: string;
  selectCategory: string;
  addImages: string;
  productName: string;
  productNameEn: string;
  description: string;
  descriptionEn: string;
  productImages: string;
  rawMaterials: string;
  solvents: string;
  industrial: string;
  labChemicals: string;
  productType: string;
  lab: string;
  commercial: string;
  unit: string;
  kg: string;
  ton: string;
  mg: string;
  g: string;
  l: string;
  ml: string;
  chemicalName: string;
  purity: string;
  originZone: string;
  selectOriginZone: string;
  minOrderQuantity: string;
  enterMinOrderQuantity: string;
  stockLocation: string;
  enterStockLocation: string;
  wholesalePrice: string;
}

const translations: Record<"ar" | "en", TranslationKeys> = {
  ar: {
    productAdded: "تم إضافة المنتج بنجاح",
    addProductFailed: "فشل في إضافة المنتج",
    addProduct: "إضافة منتج",
    adding: "جاري الإضافة...",
    price: "السعر",
    enterPrice: "أدخل السعر",
    stock: "الكمية المتاحة",
    enterStock: "أدخل الكمية المتاحة",
    selectCategory: "اختر الفئة",
    addImages: "إضافة صور",
    productName: "اسم المنتج",
    productNameEn: "اسم المنتج (الإنجليزية)",
    description: "وصف المنتج",
    descriptionEn: "وصف المنتج (الإنجليزية)",
    productImages: "صور المادة",
    rawMaterials: "مواد خام",
    solvents: "مذيبات",
    industrial: "كيماويات صناعية",
    labChemicals: "كيماويات مختبرية",
    productType: "نوع المنتج",
    lab: "معملي",
    commercial: "تجاري",
    unit: "الوحدة",
    kg: "كيلو",
    ton: "طن",
    mg: "مليجرام",
    g: "جرام",
    l: "لتر",
    ml: "مليليتر",
    chemicalName: "الاسم الكيميائي",
    purity: "النقاء (%)",
    originZone: "نطاق التجميع",
    selectOriginZone: "اختر نطاق التجميع",
    minOrderQuantity: "أقل كمية للطلب",
    enterMinOrderQuantity: "أدخل أقل كمية للطلب",
    stockLocation: "مكان التخزين",
    enterStockLocation: "أدخل عنوان المخزن بالتفصيل",
    wholesalePrice: "سعر الجملة"
  },
  en: {
    productAdded: "Product added successfully",
    addProductFailed: "Failed to add product",
    addProduct: "Add Product",
    adding: "Adding...",
    price: "Price",
    enterPrice: "Enter price",
    stock: "Stock Quantity",
    enterStock: "Enter stock quantity",
    selectCategory: "Select category",
    addImages: "Add Images",
    productName: "Product Name (Arabic)",
    productNameEn: "Product Name (English)",
    description: "Description (Arabic)",
    descriptionEn: "Description (English)",
    productImages: "Material Images",
    rawMaterials: "Raw Materials",
    solvents: "Solvents",
    industrial: "Industrial Chemicals",
    labChemicals: "Laboratory Chemicals",
    productType: "Product Type",
    lab: "Laboratory",
    commercial: "Commercial",
    unit: "Unit",
    kg: "Kilogram (kg)",
    ton: "Ton",
    mg: "Milligram (mg)",
    g: "Gram (g)",
    l: "Liter (l)",
    ml: "Milliliter (ml)",
    chemicalName: "Chemical Name",
    purity: "Purity (%)",
    originZone: "Origin Zone",
    selectOriginZone: "Select origin zone",
    minOrderQuantity: "Min Order Quantity",
    enterMinOrderQuantity: "Enter minimum order quantity",
    stockLocation: "Stock Location",
    enterStockLocation: "Enter detailed warehouse address",
    wholesalePrice: "Wholesale Price"
  }
};

export function AddProduct({ onProductAdded, isArabic = false }: AddProductProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  type Lang = keyof typeof translations;
  type TranslationKey = keyof TranslationKeys;
  const lang: Lang = isArabic ? 'ar' : 'en';
  const translate = (key: TranslationKey): string => translations[lang][key];
  const [loading, setLoading] = useState(false);
  interface ProductFormData {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    price: string;
    stock: string;
    category: string;
    images: string[];
    productType: string;
    unit: string;
    chemicalName: string;
    purity: string;
    originZone: string;
    minOrderQuantity: string;
    stockLocation: string;
  }

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    titleEn: "",
    description: "",
    descriptionEn: "",
    price: "",
    stock: "",
    category: "",
    images: [] as string[],
    productType: "commercial",
    unit: "kg",
    chemicalName: "",
    purity: "",
    originZone: "Cairo",
    minOrderQuantity: "1",
    stockLocation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend Validation
    const quantity = parseFloat(formData.stock);
    const minOrderQuantity = parseFloat(formData.minOrderQuantity);
    
    if (quantity < minOrderQuantity) {
      toast.error(isArabic 
        ? `الكمية المتاحة (${quantity}) يجب أن تكون أكبر من أو تساوي أقل كمية للطلب (${minOrderQuantity})` 
        : `Total stock (${quantity}) must be >= Min Order Quantity (${minOrderQuantity})`);
      return;
    }

    setLoading(true);

    try {
      const productData = {
        title: formData.title,
        titleEn: formData.titleEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn,
        price: parseFloat(formData.price),
        quantity: quantity,
        category: formData.category,
        images: formData.images,
        productType: formData.productType,
        unit: formData.unit,
        chemicalName: formData.chemicalName,
        purity: parseFloat(formData.purity),
        originZone: formData.originZone,
        minOrderQuantity: minOrderQuantity,
        stockLocation: formData.stockLocation,
        status: "available"
      };

      await productService.createProduct(productData);
      toast.success(translate("productAdded"));

      if (onProductAdded) {
        onProductAdded();
      }

      // Reset form
      setFormData({
        title: "",
        titleEn: "",
        description: "",
        descriptionEn: "",
        price: "",
        stock: "",
        category: "",
        images: [],
        productType: "commercial",
        unit: "kg",
        chemicalName: "",
        purity: "",
        originZone: "Cairo",
        minOrderQuantity: "1",
        stockLocation: "",
      });
    } catch (error) {
      toast.error(translate("addProductFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Here you would typically upload the file to your server
      // and get the URL back. For now, we'll just use a placeholder
      imageUrls.push(URL.createObjectURL(file));
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{translate("addProduct")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">{translate("productName")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={translate("productName")}
                required
                dir={isArabic ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <Label htmlFor="titleEn">{translate("productNameEn")}</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                placeholder={translate("productNameEn")}
                required
                dir={isArabic ? "rtl" : "ltr"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="chemicalName">{translate("chemicalName")}</Label>
              <Input
                id="chemicalName"
                value={formData.chemicalName}
                onChange={(e) => setFormData(prev => ({ ...prev, chemicalName: e.target.value }))}
                placeholder={translate("chemicalName")}
                required
              />
            </div>
            <div>
              <Label htmlFor="stockLocation" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {translate("stockLocation")}
              </Label>
              <Input
                id="stockLocation"
                value={formData.stockLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, stockLocation: e.target.value }))}
                placeholder={translate("enterStockLocation")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="productType">{translate("productType")}</Label>
              <Select
                value={formData.productType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, productType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={translate("productType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">{translate("lab")}</SelectItem>
                  <SelectItem value="commercial">{translate("commercial")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="purity">{translate("purity")}</Label>
              <Input
                id="purity"
                type="number"
                value={formData.purity}
                onChange={(e) => setFormData(prev => ({ ...prev, purity: e.target.value }))}
                placeholder={translate("purity")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="originZone" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {translate("originZone")}
              </Label>
              <Select
                value={formData.originZone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, originZone: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={translate("selectOriginZone")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Alexandria">Alexandria</SelectItem>
                  <SelectItem value="Delta">Delta</SelectItem>
                  <SelectItem value="Upper Egypt">Upper Egypt</SelectItem>
                  <SelectItem value="Suez Canal">Suez Canal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="unit">{translate("unit")}</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={translate("unit")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">{translate("kg")}</SelectItem>
                  <SelectItem value="ton">{translate("ton")}</SelectItem>
                  <SelectItem value="mg">{translate("mg")}</SelectItem>
                  <SelectItem value="g">{translate("g")}</SelectItem>
                  <SelectItem value="l">{translate("l")}</SelectItem>
                  <SelectItem value="ml">{translate("ml")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium text-slate-700">
                {translate("wholesalePrice")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">{translate("price")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder={translate("enterPrice")}
                      required
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">/ {formData.unit}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">{translate("stock")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder={translate("enterStock")}
                      required
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{formData.unit}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderQuantity" className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {translate("minOrderQuantity")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="minOrderQuantity"
                      type="number"
                      value={formData.minOrderQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, minOrderQuantity: e.target.value }))}
                      placeholder={translate("enterMinOrderQuantity")}
                      required
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{formData.unit}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category">{translate("selectCategory")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={translate("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw-materials">{translate("rawMaterials")}</SelectItem>
                  <SelectItem value="solvents">{translate("solvents")}</SelectItem>
                  <SelectItem value="industrial">{translate("industrial")}</SelectItem>
                  <SelectItem value="lab-chemicals">{translate("labChemicals")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">{translate("description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={translate("description")}
              required
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <Label htmlFor="descriptionEn">{translate("descriptionEn")}</Label>
            <Textarea
              id="descriptionEn"
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              placeholder={translate("descriptionEn")}
              required
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <Label>{translate("productImages")}</Label>
            <div className="space-y-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative w-32 h-32">
                  <Image
                    src={url}
                    alt="Product"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => document.getElementById("imageInput")?.click()}
              >
                <Upload className="h-4 w-4" />
                {translate("addImages")}
              </Button>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? translate("adding") : translate("addProduct")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
