// src/app/features/product-listing/product/product.model.ts - Fixed Multi-Brand Support

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
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
  brandIds?: string[]; // Çoklu marka seçimi için array
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
  
  // Index signature ekleyerek dinamik property assignment'a izin ver
  [key: string]: any;
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
  sortBy: string;
  lastAction: string | null;
  
  // Filter seçenekleri - TİP HATASI DÜZELTİLDİ
  availableCategories: Category[];
  availableBrands: Brand[];
  availableColors: ColorOption[];
  availableSizes: SizeOption[];
  availableGenders: GenderOption[];
  availableRatings: RatingOption[]; // any[] yerine RatingOption[]
  
  // API'den gelen raw facets verisi
  facets: Facet[];
  
  // Hata yönetimi
  filterError: string | null;
}

// Filter seçenekleri için tip tanımları
export interface Category {
  id: string;
  name: string;
  count?: number;
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
  rgbCode?: string;
  count?: number;
}

export interface SizeOption {
  id: string;
  name: string;
  category?: string;
  count?: number;
}

export interface GenderOption {
  id: string;
  name: string;
  apiCode?: string;
  count?: number;
}

export interface RatingOption {
  id: string;
  name: string;
  value: number;
  count?: number;
  label?: string;
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
  selectedBrandIds: string[]; // Çoklu marka seçimi
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