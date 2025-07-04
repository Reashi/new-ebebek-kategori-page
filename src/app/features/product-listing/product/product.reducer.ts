// src/app/features/product-listing/product/product.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { ProductState } from './product.model';
import * as ProductActions from './product.actions';

export const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filters: {},
  totalCount: 0,
  currentPage: 1,
  pageSize: 12
};

export const productReducer = createReducer(
  initialState,

  // Load Products
  on(ProductActions.loadProducts, (state, { filters, page, pageSize }) => ({
    ...state,
    loading: true,
    error: null,
    filters: filters ? { ...state.filters, ...filters } : state.filters,
    currentPage: page || state.currentPage,
    pageSize: pageSize || state.pageSize
  })),

  on(ProductActions.loadProductsSuccess, (state, { products, totalCount, currentPage }) => ({
    ...state,
    products,
    totalCount,
    currentPage,
    loading: false,
    error: null
  })),

  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    products: [],
    loading: false,
    error
  })),

  // Select Product
  on(ProductActions.selectProduct, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ProductActions.selectProductSuccess, (state, { product }) => ({
    ...state,
    selectedProduct: product,
    loading: false,
    error: null
  })),

  on(ProductActions.selectProductFailure, (state, { error }) => ({
    ...state,
    selectedProduct: null,
    loading: false,
    error
  })),

  on(ProductActions.clearSelectedProduct, (state) => ({
    ...state,
    selectedProduct: null
  })),

  // Filters
  on(ProductActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
    currentPage: 1 // Reset to first page when filtering
  })),

  on(ProductActions.clearFilters, (state) => ({
    ...state,
    filters: {},
    currentPage: 1
  })),

  // Pagination
  on(ProductActions.setPage, (state, { page }) => ({
    ...state,
    currentPage: page
  })),

  on(ProductActions.setPageSize, (state, { pageSize }) => ({
    ...state,
    pageSize,
    currentPage: 1 // Reset to first page when changing page size
  })),

  // Reset
  on(ProductActions.resetProductState, () => initialState)
);