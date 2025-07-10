// src/app/features/product-listing/product/product.reducer.ts - Fixed Filter State Management

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
  availableBrands: [],
  availableColors: [],
  availableSizes: [],
  availableGenders: [],
  availableRatings: [],
  facets: [],
  filterError: null
};

export const productReducer = createReducer(
  initialState,

  // Load Products
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
    filterError: null,
    lastAction: 'loadProducts'
  })),

  on(ProductActions.loadProductsWithParams, (state, { filters, page, pageSize, sortBy }) => {
    console.log('Reducer: loadProductsWithParams', { filters, page, pageSize, sortBy });
    console.log('Current state filters:', state.filters);
    console.log('New filters being applied:', filters);
    
    return {
      ...state,
      loading: true,
      error: null,
      filterError: null,
      filters: filters ? { ...state.filters, ...filters } : state.filters,
      currentPage: page || state.currentPage,
      pageSize: pageSize || state.pageSize,
      sortBy: sortBy || state.sortBy,
      lastAction: 'loadProductsWithParams'
    };
  }),

  on(ProductActions.loadProductsSuccess, (state, { products, totalCount, currentPage, pageSize, facets }) => ({
    ...state,
    products,
    totalCount,
    currentPage,
    pageSize,
    loading: false,
    error: null,
    filterError: null,
    facets: facets || state.facets
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
    filterError: null,
    lastAction: 'searchProducts'
  })),

  on(ProductActions.searchProductsSuccess, (state, { products, totalCount, currentPage, pageSize, searchTerm, facets }) => ({
    ...state,
    products,
    totalCount,
    currentPage,
    pageSize,
    loading: false,
    error: null,
    filterError: null,
    filters: {
      ...state.filters,
      searchTerm
    },
    facets: facets || state.facets
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

  // Filters - DÜZELTİLDİ
  on(ProductActions.setFilters, (state, { filters }) => {
    console.log('Reducer: setFilters called');
    console.log('Current state filters:', state.filters);
    console.log('New filters to merge:', filters);
    
    const updatedFilters = { ...state.filters, ...filters };
    console.log('Final merged filters:', updatedFilters);
    
    return {
      ...state,
      filters: updatedFilters,
      currentPage: 1, // Reset to first page when filtering
      filterError: null
    };
  }),

  on(ProductActions.clearFilters, (state) => {
    console.log('Reducer: clearFilters called');
    return {
      ...state,
      filters: {},
      currentPage: 1,
      filterError: null
    };
  }),

  on(ProductActions.addFilter, (state, { filterType, value }) => {
    console.log('Reducer: addFilter called', { filterType, value });
    console.log('Current filter value:', state.filters[filterType]);
    
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

    console.log('New filter values:', newValues);

    return {
      ...state,
      filters: {
        ...state.filters,
        [filterType]: newValues
      },
      currentPage: 1,
      filterError: null
    };
  }),

  on(ProductActions.removeFilter, (state, { filterType, value }) => {
    console.log('Reducer: removeFilter called', { filterType, value });
    console.log('Current filter value:', state.filters[filterType]);
    
    const currentValues = state.filters[filterType] as any;

    if (value === undefined) {
      // Remove entire filter
      const { [filterType]: removed, ...remainingFilters } = state.filters;
      console.log('Removing entire filter, remaining:', remainingFilters);
      return {
        ...state,
        filters: remainingFilters,
        currentPage: 1,
        filterError: null
      };
    }

    if (Array.isArray(currentValues)) {
      const newValues = currentValues.filter((v: any) => v !== value);
      console.log('Filtered array values:', newValues);
      
      const updatedFilters = { ...state.filters };
      if (newValues.length > 0) {
        updatedFilters[filterType] = newValues;
      } else {
        delete updatedFilters[filterType];
      }
      
      return {
        ...state,
        filters: updatedFilters,
        currentPage: 1,
        filterError: null
      };
    }

    if (currentValues === value) {
      const { [filterType]: removed, ...remainingFilters } = state.filters;
      return {
        ...state,
        filters: remainingFilters,
        currentPage: 1,
        filterError: null
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
    currentPage: 1
  })),

  on(ProductActions.nextPage, (state) => ({
    ...state,
    currentPage: state.currentPage + 1
  })),

  on(ProductActions.previousPage, (state) => ({
    ...state,
    currentPage: Math.max(1, state.currentPage - 1)
  })),

  // Filter Options - Original
  on(ProductActions.loadFilterOptions, (state) => ({
    ...state,
    loading: true,
    error: null,
    filterError: null
  })),

  on(ProductActions.loadFilterOptionsSuccess, (state, { categories, brands }) => ({
    ...state,
    loading: false,
    error: null,
    filterError: null,
    availableCategories: categories,
    availableBrands: brands
  })),

  on(ProductActions.loadFilterOptionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    filterError: error
  })),

  // Facets Support
  on(ProductActions.updateFilterOptions, (state, { facets, availableColors, availableSizes, availableGenders }) => ({
    ...state,
    facets: facets || state.facets,
    availableColors: availableColors || state.availableColors,
    availableSizes: availableSizes || state.availableSizes,
    availableGenders: availableGenders || state.availableGenders,
    filterError: null
  })),

  on(ProductActions.updateFilterOptionsSuccess, (state, { availableColors, availableSizes, availableGenders, availableRatings }) => ({
    ...state,
    availableColors,
    availableSizes,
    availableGenders,
    availableRatings, // Artık her zaman array gelecek
    filterError: null
  })),

  // Filter Error Handling
  on(ProductActions.showFilterError, (state, { message }) => ({
    ...state,
    filterError: message
  })),

  on(ProductActions.clearFilterError, (state) => ({
    ...state,
    filterError: null
  })),

  // Reset
  on(ProductActions.resetProductState, () => initialState),

  // Retry
  on(ProductActions.retryLastAction, (state) => ({
    ...state,
    loading: true,
    error: null,
    filterError: null
  })),

  // Analytics - Optional tracking
  on(ProductActions.trackFilterUsage, (state, { filterType, filterValue, timestamp }) => {
    console.log(`Filter used: ${filterType} = ${filterValue} at ${new Date(timestamp).toISOString()}`);
    return state;
  }),

  on(ProductActions.trackSearchQuery, (state, { searchTerm, resultCount, timestamp }) => {
    console.log(`Search performed: "${searchTerm}" returned ${resultCount} results at ${new Date(timestamp).toISOString()}`);
    return state;
  })
);

// Selector yardımcı fonksiyonları
export const getFilterErrorMessage = (state: ProductState): string | null => {
  return (state.filterError === undefined ? null : state.filterError) as string | null;
};

export const getAvailableFilterOptions = (state: ProductState) => ({
  colors: state.availableColors,
  sizes: state.availableSizes,
  genders: state.availableGenders,
  ratings: state.availableRatings,
  categories: state.availableCategories,
  brands: state.availableBrands
});

export const hasFilterData = (state: ProductState): boolean => {
  return !!(
    state.availableColors?.length ||
    state.availableSizes?.length ||
    state.availableGenders?.length ||
    state.availableRatings?.length ||
    state.facets?.length
  );
};