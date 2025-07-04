// src/app/features/product-listing/store/product.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState, Product } from './product.model';

// Feature selector
export const selectProductState = createFeatureSelector<ProductState>('products');

// Basic selectors
export const selectAllProducts = createSelector(
  selectProductState,
  (state) => state.products
);

export const selectSelectedProduct = createSelector(
  selectProductState,
  (state) => state.selectedProduct
);

export const selectProductsLoading = createSelector(
  selectProductState,
  (state) => state.loading
);

export const selectProductsError = createSelector(
  selectProductState,
  (state) => state.error
);

export const selectProductFilters = createSelector(
  selectProductState,
  (state) => state.filters
);

export const selectTotalCount = createSelector(
  selectProductState,
  (state) => state.totalCount
);

export const selectCurrentPage = createSelector(
  selectProductState,
  (state) => state.currentPage
);

export const selectPageSize = createSelector(
  selectProductState,
  (state) => state.pageSize
);

// Computed selectors
export const selectTotalPages = createSelector(
  selectTotalCount,
  selectPageSize,
  (totalCount, pageSize) => Math.ceil(totalCount / pageSize)
);

export const selectHasNextPage = createSelector(
  selectCurrentPage,
  selectTotalPages,
  (currentPage, totalPages) => currentPage < totalPages
);

export const selectHasPreviousPage = createSelector(
  selectCurrentPage,
  (currentPage) => currentPage > 1
);

// Product by ID selector
export const selectProductById = (productId: string) => createSelector(
  selectAllProducts,
  (products) => products.find(product => product.id === productId)
);

// Products by category
export const selectProductsByCategory = (categoryId: string) => createSelector(
  selectAllProducts,
  (products) => products.filter(product => product.categoryId === categoryId)
);

// In stock products
export const selectInStockProducts = createSelector(
  selectAllProducts,
  (products) => products.filter(product => product.inStock)
);

// Search results
export const selectSearchResults = createSelector(
  selectAllProducts,
  selectProductFilters,
  (products, filters) => {
    if (!filters.searchTerm) return products;
    
    const searchTerm = filters.searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }
);

// Price range products
export const selectProductsInPriceRange = createSelector(
  selectAllProducts,
  selectProductFilters,
  (products, filters) => {
    if (!filters.priceRange) return products;
    
    const { min, max } = filters.priceRange;
    return products.filter(product => 
      product.price >= min && product.price <= max
    );
  }
);

// Pagination info
export const selectPaginationInfo = createSelector(
  selectCurrentPage,
  selectPageSize,
  selectTotalCount,
  selectTotalPages,
  selectHasNextPage,
  selectHasPreviousPage,
  (currentPage, pageSize, totalCount, totalPages, hasNext, hasPrevious) => ({
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: hasNext,
    hasPreviousPage: hasPrevious,
    startItem: (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, totalCount)
  })
);