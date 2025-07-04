// src/app/features/product-listing/product/product.model.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // İndirim hesaplamak için
  description: string;
  imageUrl: string;
  categoryId: string;
  brandId: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  sizes?: string[];
  gender?: 'erkek' | 'kız' | 'unisex';
  isOnSale?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductFilters {
  categoryId?: string;
  brandIds?: string[];
  sizes?: string[];
  genders?: string[];
  colors?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  ratings?: number[];
  searchTerm?: string;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
}

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

// Filter seçenekleri için yardımcı interface'ler
export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  productCount?: number;
}

export interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

export interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
}