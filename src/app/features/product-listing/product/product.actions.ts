// src/app/features/product-listing/product/product.actions.ts - Updated with Facets Support

import { createAction, props } from '@ngrx/store';
import { Product, ProductFilters } from './product.model';

// Load Products Actions
export const loadProducts = createAction(
  '[Product/API] Load Products'
);

export const loadProductsWithParams = createAction(
  '[Product List] Load Products With Params',
  props<{ 
    filters?: ProductFilters;
    page?: number;
    pageSize?: number;
    sortBy?: string;
  }>()
);

export const loadProductsSuccess = createAction(
  '[Product/API] Load Products Success',
  props<{ 
    products: Product[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    facets?: any[];
  }>()
);

export const loadProductsFailure = createAction(
  '[Product/API] Load Products Failure',
  props<{ error: string }>()
);

// Search Products Actions
export const searchProducts = createAction(
  '[Product Search] Search Products',
  props<{ searchTerm: string }>()
);

export const searchProductsSuccess = createAction(
  '[Product/API] Search Products Success',
  props<{ 
    products: Product[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    searchTerm: string;
    facets?: any[];
  }>()
);

export const searchProductsFailure = createAction(
  '[Product/API] Search Products Failure',
  props<{ error: string }>()
);

// Select Product Actions
export const selectProduct = createAction(
  '[Product List] Select Product',
  props<{ productId: string }>()
);

export const selectProductSuccess = createAction(
  '[Product/API] Select Product Success',
  props<{ product: Product }>()
);

export const selectProductFailure = createAction(
  '[Product/API] Select Product Failure',
  props<{ error: string }>()
);

export const clearSelectedProduct = createAction(
  '[Product List] Clear Selected Product'
);

// Filter Actions
export const setFilters = createAction(
  '[Product Filter] Set Filters',
  props<{ filters: Partial<ProductFilters> }>()
);

export const clearFilters = createAction(
  '[Product Filter] Clear Filters'
);

export const addFilter = createAction(
  '[Product Filter] Add Filter',
  props<{ filterType: keyof ProductFilters; value: any }>()
);

export const removeFilter = createAction(
  '[Product Filter] Remove Filter',
  props<{ filterType: keyof ProductFilters; value?: any }>()
);

// Sort Actions
export const setSortBy = createAction(
  '[Product Sort] Set Sort By',
  props<{ sortBy: string }>()
);

// Pagination Actions
export const setPage = createAction(
  '[Product Pagination] Set Page',
  props<{ page: number }>()
);

export const setPageSize = createAction(
  '[Product Pagination] Set Page Size',
  props<{ pageSize: number }>()
);

export const nextPage = createAction(
  '[Product Pagination] Next Page'
);

export const previousPage = createAction(
  '[Product Pagination] Previous Page'
);

// Filter Options Actions - Yeni eklenenler
export const loadFilterOptions = createAction(
  '[Product Filter] Load Filter Options'
);

export const loadFilterOptionsSuccess = createAction(
  '[Product/API] Load Filter Options Success',
  props<{ categories: any[]; brands: any[]; }>()
);

export const loadFilterOptionsFailure = createAction(
  '[Product/API] Load Filter Options Failure',
  props<{ error: string }>()
);

// Facets Support Actions - Yeni eklenenler
export const updateFilterOptions = createAction(
  '[Product Filter] Update Filter Options from Facets',
  props<{ 
    facets: any[];
    availableColors?: any[];
    availableSizes?: any[];
    availableGenders?: any[];
  }>()
);

export const updateFilterOptionsSuccess = createAction(
  '[Product Filter] Update Filter Options Success',
  props<{ 
    availableColors: any[];
    availableSizes: any[];
    availableGenders: any[];
    availableRatings?: any[];
  }>()
);

// Reset Actions
export const resetProductState = createAction(
  '[Product] Reset State'
);

export const retryLastAction = createAction(
  '[Product] Retry Last Action'
);

// Utility Actions - Hata durumları için
export const showFilterError = createAction(
  '[Product Filter] Show Filter Error',
  props<{ message: string }>()
);

export const clearFilterError = createAction(
  '[Product Filter] Clear Filter Error'
);

// Performance tracking actions
export const trackFilterUsage = createAction(
  '[Product Analytics] Track Filter Usage',
  props<{ 
    filterType: string;
    filterValue: any;
    timestamp: number;
  }>()
);

export const trackSearchQuery = createAction(
  '[Product Analytics] Track Search Query',
  props<{ 
    searchTerm: string;
    resultCount: number;
    timestamp: number;
  }>()
);