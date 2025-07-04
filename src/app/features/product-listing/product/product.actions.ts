// src/app/features/product-listing/store/product.actions.ts
import { createAction, props } from '@ngrx/store';
import { Product, ProductFilters } from './product.model';

// Load Products Actions
export const loadProducts = createAction(
  '[Product List] Load Products',
  props<{ 
    filters?: ProductFilters;
    page?: number;
    pageSize?: number;
  }>()
);

export const loadProductsSuccess = createAction(
  '[Product API] Load Products Success',
  props<{ 
    products: Product[];
    totalCount: number;
    currentPage: number;
  }>()
);

export const loadProductsFailure = createAction(
  '[Product API] Load Products Failure',
  props<{ error: string }>()
);

// Select Product Actions
export const selectProduct = createAction(
  '[Product List] Select Product',
  props<{ productId: string }>()
);

export const selectProductSuccess = createAction(
  '[Product API] Select Product Success',
  props<{ product: Product }>()
);

export const selectProductFailure = createAction(
  '[Product API] Select Product Failure',
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

// Pagination Actions
export const setPage = createAction(
  '[Product Pagination] Set Page',
  props<{ page: number }>()
);

export const setPageSize = createAction(
  '[Product Pagination] Set Page Size',
  props<{ pageSize: number }>()
);

// Reset Actions
export const resetProductState = createAction(
  '[Product] Reset State'
);

export function loadFilterOptions(): any {
  throw new Error('Function not implemented.');
}
