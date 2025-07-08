// src/app/features/product-listing/product/product.model.ts - Updated with Facets Support

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
  isNew?: boolean;
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
  sortBy?: string;
  lastAction?: string | null;
  
  // Orijinal filter seçenekleri
  availableCategories?: any[];
  availableBrands?: any[];
  
  // Facets'den gelen filter seçenekleri
  availableColors?: any[];
  availableSizes?: any[];
  availableGenders?: any[];
  availableRatings?: any[];
  
  // API'den gelen raw facets verisi
  facets?: any[];
  
  // Hata yönetimi
  filterError?: string | null;
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
  rgbCode?: string; // API'den gelen RGB kodu
  count?: number;
}

export interface SizeOption {
  id: string;
  name: string;
  category?: string; // Yaş grubu, beden kategorisi vb.
  count?: number;
}

export interface GenderOption {
  id: string;
  name: string;
  apiCode?: string; // API'den gelen orijinal kod
  count?: number;
}

export interface RatingOption {
  value: number;
  count: number;
  label?: string; // "4 yıldız ve üzeri" gibi
}

// Facets için tip tanımları
export interface FacetValue {
  code: string;
  name: string;
  count: number;
  selected?: boolean;
}

export interface Facet {
  code: string;
  name: string;
  multiSelect: boolean;
  visible: boolean;
  values: FacetValue[];
}

// API Response interface'leri
export interface ApiFilterOptions {
  colors: ColorOption[];
  sizes: SizeOption[];
  genders: GenderOption[];
  ratings: RatingOption[];
  categories: Category[];
  brands: Brand[];
}

// Component'ler için helper interface'ler
export interface FilterState {
  selectedCategoryId: string;
  selectedBrandIds: string[];
  selectedSizes: string[];
  selectedGenders: string[];
  selectedColors: string[];
  selectedRatings: number[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  onSaleOnly: boolean;
  inStockOnly: boolean;
  searchTerm: string;
}

export interface FilterValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Analytics için interface'ler
export interface FilterUsageAnalytics {
  filterType: keyof ProductFilters;
  filterValue: any;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface SearchAnalytics {
  searchTerm: string;
  resultCount: number;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  filtersApplied?: Partial<ProductFilters>;
}

// Pagination için helper interface
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

// Filter sidebar için display interface'i
export interface FilterDisplayOptions {
  showCategoryFilter: boolean;
  showBrandFilter: boolean;
  showSizeFilter: boolean;
  showGenderFilter: boolean;
  showColorFilter: boolean;
  showPriceFilter: boolean;
  showRatingFilter: boolean;
  showSaleFilter: boolean;
  showStockFilter: boolean;
  maxBrandsToShow: number;
  maxColorsToShow: number;
  maxSizesToShow: number;
}

// Default değerler
export const DEFAULT_FILTER_DISPLAY_OPTIONS: FilterDisplayOptions = {
  showCategoryFilter: true,
  showBrandFilter: true,
  showSizeFilter: true,
  showGenderFilter: true,
  showColorFilter: true,
  showPriceFilter: true,
  showRatingFilter: true,
  showSaleFilter: true,
  showStockFilter: true,
  maxBrandsToShow: 10,
  maxColorsToShow: 12,
  maxSizesToShow: 8
};

export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_SORT_BY = 'relevance';

// Utility type'lar
export type FilterKey = keyof ProductFilters;
export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name';
export type ViewMode = 'grid' | 'list';