// src/app/features/product-listing/store/product.model.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryId: string;
  inStock: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductFilters {
  categoryId?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
  inStockOnly?: boolean;
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