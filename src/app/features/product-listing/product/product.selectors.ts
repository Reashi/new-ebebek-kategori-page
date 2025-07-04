// src/app/features/product-listing/product/product.selectors.ts
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

export const selectFilterOptions = createSelector(
  selectProductState,
  (state) => state.filterOptions
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

// Filter Options Selectors - FIX: Default değerlerle birlikte
export const selectCategories = createSelector(
  selectFilterOptions,
  (filterOptions) => filterOptions?.categories || []
);

export const selectBrands = createSelector(
  selectFilterOptions,
  (filterOptions) => filterOptions?.brands || []
);

export const selectSizes = createSelector(
  selectFilterOptions,
  (filterOptions) => filterOptions?.sizes || []
);

export const selectColors = createSelector(
  selectFilterOptions,
  (filterOptions) => filterOptions?.colors || []
);

export const selectPriceRange = createSelector(
  selectFilterOptions,
  (filterOptions) => filterOptions?.priceRange || { min: 0, max: 5000 }
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

// On sale products
export const selectOnSaleProducts = createSelector(
  selectAllProducts,
  (products) => products.filter(product => product.isOnSale)
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

// Filtered products (by brands)
export const selectProductsByBrands = createSelector(
  selectAllProducts,
  selectProductFilters,
  (products, filters) => {
    if (!filters.brandIds || filters.brandIds.length === 0) return products;
    
    return products.filter(product => 
      filters.brandIds!.includes(product.brandId)
    );
  }
);

// Filtered products (by sizes)
export const selectProductsBySizes = createSelector(
  selectAllProducts,
  selectProductFilters,
  (products, filters) => {
    if (!filters.sizeIds || filters.sizeIds.length === 0) return products;
    
    return products.filter(product => 
      product.sizes && product.sizes.some(size => filters.sizeIds!.includes(size))
    );
  }
);

// Filtered products (by colors)
export const selectProductsByColors = createSelector(
  selectAllProducts,
  selectProductFilters,
  (products, filters) => {
    if (!filters.colorIds || filters.colorIds.length === 0) return products;
    
    return products.filter(product => 
      product.colors && product.colors.some(color => filters.colorIds!.includes(color))
    );
  }
);

// Filtered products (by genders)
export const selectProductsByGenders = createSelector(
  selectAllProducts,
  selectProductFilters,
  (products, filters) => {
    if (!filters.genders || filters.genders.length === 0) return products;
    
    return products.filter(product => 
      filters.genders!.includes(product.gender)
    );
  }
);

// Filtered products (by ratings)
export const selectProductsByRatings = createSelector(
  selectAllProducts,
  selectProductFilters,
  (products, filters) => {
    if (!filters.ratings || filters.ratings.length === 0) return products;
    
    return products.filter(product => {
      const productRating = Math.floor(product.rating);
      return filters.ratings!.some(rating => productRating >= rating);
    });
  }
);

// Active filters count
export const selectActiveFiltersCount = createSelector(
  selectProductFilters,
  (filters) => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.brandIds && filters.brandIds.length > 0) count++;
    if (filters.sizeIds && filters.sizeIds.length > 0) count++;
    if (filters.colorIds && filters.colorIds.length > 0) count++;
    if (filters.genders && filters.genders.length > 0) count++;
    if (filters.ratings && filters.ratings.length > 0) count++;
    if (filters.priceRange) count++;
    if (filters.inStockOnly) count++;
    if (filters.onSaleOnly) count++;
    if (filters.searchTerm) count++;
    return count;
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