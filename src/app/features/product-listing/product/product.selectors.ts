// src/app/features/product-listing/product/product.selectors.ts - Updated with Facets Support

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState, Product, PaginationInfo, ApiFilterOptions } from './product.model';

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

export const selectSortBy = createSelector(
  selectProductState,
  (state) => state.sortBy
);

// Facets selectors - Yeni eklenenler
export const selectFacets = createSelector(
  selectProductState,
  (state) => state.facets || []
);

export const selectAvailableColors = createSelector(
  selectProductState,
  (state) => state.availableColors || []
);

export const selectAvailableSizes = createSelector(
  selectProductState,
  (state) => state.availableSizes || []
);

export const selectAvailableGenders = createSelector(
  selectProductState,
  (state) => state.availableGenders || []
);

export const selectAvailableRatings = createSelector(
  selectProductState,
  (state) => state.availableRatings || []
);

export const selectAvailableCategories = createSelector(
  selectProductState,
  (state) => state.availableCategories || []
);

export const selectAvailableBrands = createSelector(
  selectProductState,
  (state) => state.availableBrands || []
);

export const selectFilterError = createSelector(
  selectProductState,
  (state) => state.filterError
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

// Combined filter options selector
export const selectAllFilterOptions = createSelector(
  selectAvailableColors,
  selectAvailableSizes,
  selectAvailableGenders,
  selectAvailableRatings,
  selectAvailableCategories,
  selectAvailableBrands,
  (colors, sizes, genders, ratings, categories, brands): ApiFilterOptions => ({
    colors,
    sizes,
    genders,
    ratings,
    categories,
    brands
  })
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

// Pagination info
export const selectPaginationInfo = createSelector(
  selectCurrentPage,
  selectPageSize,
  selectTotalCount,
  selectTotalPages,
  selectHasNextPage,
  selectHasPreviousPage,
  (currentPage, pageSize, totalCount, totalPages, hasNext, hasPrevious): PaginationInfo => ({
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: hasNext,
    hasPreviousPage: hasPrevious,
    startItem: totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0,
    endItem: Math.min(currentPage * pageSize, totalCount)
  })
);

// Active filters check
export const selectHasActiveFilters = createSelector(
  selectProductFilters,
  (filters) => {
    return !!(
      filters.categoryId ||
      (filters.brandIds && filters.brandIds.length > 0) ||
      (filters.sizes && filters.sizes.length > 0) ||
      (filters.genders && filters.genders.length > 0) ||
      (filters.colors && filters.colors.length > 0) ||
      filters.priceRange ||
      (filters.ratings && filters.ratings.length > 0) ||
      filters.searchTerm ||
      filters.inStockOnly ||
      filters.onSaleOnly
    );
  }
);

// Active filters count
export const selectActiveFiltersCount = createSelector(
  selectProductFilters,
  (filters) => {
    let count = 0;
    
    if (filters.categoryId) count++;
    if (filters.brandIds && filters.brandIds.length > 0) count++;
    if (filters.sizes && filters.sizes.length > 0) count++;
    if (filters.genders && filters.genders.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.priceRange) count++;
    if (filters.ratings && filters.ratings.length > 0) count++;
    if (filters.searchTerm) count++;
    if (filters.inStockOnly) count++;
    if (filters.onSaleOnly) count++;
    
    return count;
  }
);

// Products with applied filters (for debugging)
export const selectFilteredProducts = createSelector(
  selectAllProducts,
  selectProductFilters,
  (products, filters) => {
    let filteredProducts = [...products];

    // Category filter
    if (filters.categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === filters.categoryId);
    }

    // Brand filter
    if (filters.brandIds && filters.brandIds.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        filters.brandIds!.includes(p.brandId)
      );
    }

    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.sizes && p.sizes.some(size => filters.sizes!.includes(size))
      );
    }

    // Gender filter
    if (filters.genders && filters.genders.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.gender && filters.genders!.includes(p.gender)
      );
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.colors && p.colors.some(color => filters.colors!.includes(color))
      );
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filteredProducts = filteredProducts.filter(p => 
        p.price >= min && p.price <= max
      );
    }

    // Rating filter
    if (filters.ratings && filters.ratings.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.rating && filters.ratings!.some(rating => p.rating! >= rating)
      );
    }

    // Search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    // Stock filter
    if (filters.inStockOnly) {
      filteredProducts = filteredProducts.filter(p => p.inStock);
    }

    // Sale filter
    if (filters.onSaleOnly) {
      filteredProducts = filteredProducts.filter(p => p.isOnSale);
    }

    return filteredProducts;
  }
);

// Filter options availability check
export const selectHasFilterData = createSelector(
  selectAllFilterOptions,
  selectFacets,
  (options, facets) => {
    return !!(
      options.colors.length ||
      options.sizes.length ||
      options.genders.length ||
      options.ratings.length ||
      options.categories.length ||
      options.brands.length ||
      facets.length
    );
  }
);

// Filter loading state
export const selectFilterOptionsLoading = createSelector(
  selectProductsLoading,
  selectHasFilterData,
  (loading, hasData) => loading && !hasData
);

// Error states
export const selectHasAnyError = createSelector(
  selectProductsError,
  selectFilterError,
  (productError, filterError) => !!(productError || filterError)
);

export const selectAllErrors = createSelector(
  selectProductsError,
  selectFilterError,
  (productError, filterError) => ({
    productError,
    filterError,
    hasAnyError: !!(productError || filterError)
  })
);

// Performance selectors
export const selectProductsPerformance = createSelector(
  selectAllProducts,
  selectTotalCount,
  selectCurrentPage,
  selectPageSize,
  (products, totalCount, currentPage, pageSize) => ({
    loadedProducts: products.length,
    totalProducts: totalCount,
    currentPage,
    pageSize,
    loadPercentage: totalCount > 0 ? (products.length / totalCount) * 100 : 0,
    isFullyLoaded: products.length === totalCount
  })
);

// Brand products count
export const selectBrandProductCounts = createSelector(
  selectAllProducts,
  (products) => {
    const brandCounts: { [brandId: string]: number } = {};
    
    products.forEach(product => {
      if (product.brandId) {
        brandCounts[product.brandId] = (brandCounts[product.brandId] || 0) + 1;
      }
    });
    
    return brandCounts;
  }
);

// Category products count
export const selectCategoryProductCounts = createSelector(
  selectAllProducts,
  (products) => {
    const categoryCounts: { [categoryId: string]: number } = {};
    
    products.forEach(product => {
      if (product.categoryId) {
        categoryCounts[product.categoryId] = (categoryCounts[product.categoryId] || 0) + 1;
      }
    });
    
    return categoryCounts;
  }
);