// src/app/features/product-listing/product/product.model.ts

// Ana Product interface'i - mevcut alanlara yenileri eklendi
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // İndirim hesaplaması için
  description: string;
  imageUrl: string;
  categoryId: string;
  brandId: string; // Yeni: Marka ID'si
  sizes: string[]; // Yeni: Mevcut bedenler dizisi
  colors: string[]; // Yeni: Mevcut renkler dizisi  
  gender: 'male' | 'female' | 'unisex'; // Yeni: Cinsiyet
  rating: number; // Yeni: Ortalama puan (0-5)
  reviewCount: number; // Yeni: Yorum sayısı
  inStock: boolean;
  isOnSale: boolean; // Yeni: İndirimde mi?
  createdAt?: Date;
  updatedAt?: Date;
}

// Filtre seçenekleri için yardımcı interface'ler
export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string; // Hiyerarşik kategoriler için
}

export interface Size {
  id: string;
  name: string; // Gösterim adı (örn: "0-3 Ay", "S")
  value: string; // Gerçek değer
  sortOrder?: number; // Sıralama için
}

export interface Color {
  id: string;
  name: string; // Renk adı (örn: "Pembe", "Mavi")
  hexCode: string; // Hex renk kodu (örn: "#FFC0CB")
}

// Genişletilmiş ProductFilters interface'i
export interface ProductFilters {
  categoryId?: string; // Mevcut
  brandIds?: string[]; // Yeni: Çoklu marka seçimi
  sizeIds?: string[]; // Yeni: Çoklu beden seçimi
  colorIds?: string[]; // Yeni: Çoklu renk seçimi
  genders?: ('male' | 'female' | 'unisex')[]; // Yeni: Çoklu cinsiyet seçimi
  priceRange?: { // Mevcut
    min: number;
    max: number;
  };
  ratings?: number[]; // Yeni: Seçilen minimum puanlar (örn: [4, 5])
  searchTerm?: string; // Mevcut
  inStockOnly?: boolean; // Mevcut
  onSaleOnly?: boolean; // Yeni: Sadece indirimdekiler
}

// Filter seçeneklerini tutan interface
export interface FilterOptions {
  categories: Category[];
  brands: Brand[];
  sizes: Size[];
  colors: Color[];
  priceRange: {
    min: number;
    max: number;
  };
}

// Genişletilmiş ProductState interface'i
export interface ProductState {
  products: Product[]; // Mevcut
  selectedProduct: Product | null; // Mevcut
  loading: boolean; // Mevcut
  error: string | null; // Mevcut
  filters: ProductFilters; // Mevcut - ama genişletildi
  filterOptions: FilterOptions; // Yeni: Filtre seçenekleri
  totalCount: number; // Mevcut
  currentPage: number; // Mevcut
  pageSize: number; // Mevcut
}

// API response interface'leri
export interface ProductResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductQueryParams {
  filters?: ProductFilters;
  page?: number;
  pageSize?: number;
}

// Ek yardımcı interface'ler
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem: number;
  endItem: number;
}

// Ürün arama ve sıralama için
export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

export const SORT_OPTIONS: SortOption[] = [
  { key: 'name', label: 'İsme Göre (A-Z)', direction: 'asc' },
  { key: 'name', label: 'İsme Göre (Z-A)', direction: 'desc' },
  { key: 'price', label: 'Fiyat (Düşükten Yükseğe)', direction: 'asc' },
  { key: 'price', label: 'Fiyat (Yüksekten Düşüğe)', direction: 'desc' },
  { key: 'rating', label: 'Puana Göre (Yüksekten Düşüğe)', direction: 'desc' },
  { key: 'createdAt', label: 'Yeniden Eskiye', direction: 'desc' },
];

// Gender enum'u yerine kullanılabilir
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNISEX = 'unisex'
}

// Cinsiyet label'ları
export const GENDER_LABELS = {
  [Gender.MALE]: 'Erkek',
  [Gender.FEMALE]: 'Kız',
  [Gender.UNISEX]: 'Unisex'
};

// Varsayılan değerler
export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
  priceRange: { min: 0, max: 5000 }
};

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {};

// Utility types
export type ProductSortKey = keyof Pick<Product, 'name' | 'price' | 'rating' | 'createdAt'>;
export type FilterKey = keyof ProductFilters;