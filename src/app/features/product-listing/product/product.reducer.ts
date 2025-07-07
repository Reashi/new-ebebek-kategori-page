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
  pageSize: 12,
  sortBy: 'relevance',
  lastAction: null,
  availableCategories: [],
  availableBrands: []
};

export const productReducer = createReducer(
  initialState,

  // Load Products
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
    lastAction: 'loadProducts'
  })),

  on(ProductActions.loadProductsWithParams, (state, { filters, page, pageSize, sortBy }) => ({
    ...state,
    loading: true,
    error: null,
    filters: filters ? { ...state.filters, ...filters } : state.filters,
    currentPage: page || state.currentPage,
    pageSize: pageSize || state.pageSize,
    sortBy: sortBy || state.sortBy,
    lastAction: 'loadProductsWithParams'
  })),

  on(ProductActions.loadProductsSuccess, (state, { products, totalCount, currentPage, pageSize }) => ({
    ...state,
    products,
    totalCount,
    currentPage,
    pageSize,
    loading: false,
    error: null
  })),

  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    products: [],
    loading: false,
    error,
    totalCount: 0
  })),

  // Search Products
  on(ProductActions.searchProducts, (state, { searchTerm }) => ({
    ...state,
    loading: true,
    error: null,
    lastAction: 'searchProducts'
  })),

  on(ProductActions.searchProductsSuccess, (state, { products, totalCount, currentPage, pageSize, searchTerm }) => ({
    ...state,
    products,
    totalCount,
    currentPage,
    pageSize,
    loading: false,
    error: null,
    filters: {
      ...state.filters,
      searchTerm
    }
  })),

  on(ProductActions.searchProductsFailure, (state, { error }) => ({
    ...state,
    products: [],
    loading: false,
    error,
    totalCount: 0
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

  on(ProductActions.addFilter, (state, { filterType, value }) => {
    const currentValues = state.filters[filterType] as any;
    let newValues: any;

    if (Array.isArray(currentValues)) {
      newValues = currentValues.includes(value) 
        ? currentValues 
        : [...currentValues, value];
    } else if (currentValues === undefined) {
      newValues = [value];
    } else {
      newValues = [currentValues, value];
    }

    return {
      ...state,
      filters: {
        ...state.filters,
        [filterType]: newValues
      },
      currentPage: 1
    };
  }),

  on(ProductActions.removeFilter, (state, { filterType, value }) => {
    const currentValues = state.filters[filterType] as any;

    if (value === undefined) {
      // Remove entire filter
      const { [filterType]: removed, ...remainingFilters } = state.filters;
      return {
        ...state,
        filters: remainingFilters,
        currentPage: 1
      };
    }

    if (Array.isArray(currentValues)) {
      const newValues = currentValues.filter((v: any) => v !== value);
      return {
        ...state,
        filters: {
          ...state.filters,
          [filterType]: newValues.length > 0 ? newValues : undefined
        },
        currentPage: 1
      };
    }

    if (currentValues === value) {
      const { [filterType]: removed, ...remainingFilters } = state.filters;
      return {
        ...state,
        filters: remainingFilters,
        currentPage: 1
      };
    }

    return state;
  }),

  // Sort
  on(ProductActions.setSortBy, (state, { sortBy }) => ({
    ...state,
    sortBy
  })),

  // Pagination
  on(ProductActions.setPage, (state, { page }) => ({
    ...state,
    currentPage: Math.max(1, page)
  })),

  on(ProductActions.setPageSize, (state, { pageSize }) => ({
    ...state,
    pageSize: Math.max(1, pageSize),
    currentPage: 1 // Reset to first page when changing page size
  })),

  on(ProductActions.nextPage, (state) => ({
    ...state,
    currentPage: state.currentPage + 1
  })),

  on(ProductActions.previousPage, (state) => ({
    ...state,
    currentPage: Math.max(1, state.currentPage - 1)
  })),

  // Filter Options
  on(ProductActions.loadFilterOptions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ProductActions.loadFilterOptionsSuccess, (state, { categories, brands }) => ({
    ...state,
    loading: false,
    error: null,
    // Categories ve brands'i state'e ekleyelim
    availableCategories: categories,
    availableBrands: brands
  })),

  on(ProductActions.loadFilterOptionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Reset
  on(ProductActions.resetProductState, () => initialState),

  // Retry
  on(ProductActions.retryLastAction, (state) => ({
    ...state,
    loading: true,
    error: null
  }))
);