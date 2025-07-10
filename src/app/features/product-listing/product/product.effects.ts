// src/app/features/product-listing/product/product.effects.ts - Fixed Parameter Passing

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, combineLatest, Observable } from 'rxjs';
import { map, catchError, switchMap, tap, take, withLatestFrom } from 'rxjs/operators';

import * as ProductActions from './product.actions';
import * as ProductSelectors from './product.selectors';
import { ProductService, ProductResponse, ProductQueryParams } from '../services/product.service';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);
  private store = inject(Store);

  // İlk sayfa yüklendiğinde ürünleri yükle
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      withLatestFrom(
        this.store.select(ProductSelectors.selectProductFilters),
        this.store.select(ProductSelectors.selectCurrentPage),
        this.store.select(ProductSelectors.selectPageSize),
        this.store.select(ProductSelectors.selectSortBy)
      ),
      map(([action, filters, currentPage, pageSize, sortBy]) => {
        console.log('loadProducts$ triggered with:', { filters, currentPage, pageSize, sortBy });
        return ProductActions.loadProductsWithParams({
          filters,
          page: currentPage,
          pageSize,
          sortBy
        });
      })
    )
  );

  // Parametrelerle ürün yükleme - Düzeltilmiş versiyon
  loadProductsWithParams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProductsWithParams),
      tap(action => {
        console.log('loadProductsWithParams$ triggered with action:', action);
      }),
      switchMap(({ filters, page, pageSize, sortBy }) => {
        // Parametreleri doğru şekilde yapılandır
        const queryParams: ProductQueryParams = {
          filters: filters || {},
          page: page || 1,
          pageSize: pageSize || 12,
          sortBy: sortBy || 'relevance'
        };

        console.log('Calling productService.getProducts with params:', queryParams);
        console.log('Filters being passed:', queryParams.filters);

        return this.productService.getProducts(queryParams).pipe(
          map((response: ProductResponse) => {
            console.log('ProductService returned response:', response);
            
            // Facets verisi varsa filter sidebar'ı güncelle
            if (response.facets && response.facets.length > 0) {
              this.store.dispatch(ProductActions.updateFilterOptions({
                facets: response.facets,
                availableColors: response.availableColors || [],
                availableSizes: response.availableSizes || [],
                availableGenders: response.availableGenders || []
              }));
            }
            
            return ProductActions.loadProductsSuccess({
              products: response.products,
              totalCount: response.totalCount,
              currentPage: response.currentPage,
              pageSize: response.pageSize,
              facets: response.facets
            });
          }),
          catchError((error: any) => {
            console.error('loadProductsWithParams$ error:', error);
            return of(ProductActions.loadProductsFailure({ 
              error: error.message || 'Ürünler yüklenirken bir hata oluştu' 
            }));
          })
        );
      })
    )
  );

  // Ürün arama
  searchProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.searchProducts),
      withLatestFrom(
        this.store.select(ProductSelectors.selectProductFilters),
        this.store.select(ProductSelectors.selectPageSize)
      ),
      switchMap(([{ searchTerm }, currentFilters, pageSize]) => {
        console.log('searchProducts$ triggered:', { searchTerm, currentFilters });
        
        const searchParams: ProductQueryParams = {
          filters: {
            ...currentFilters,
            searchTerm
          },
          page: 1,
          pageSize
        };

        return this.productService.searchProducts(searchTerm, searchParams).pipe(
          map((response: ProductResponse) => {
            if (response.facets && response.facets.length > 0) {
              this.store.dispatch(ProductActions.updateFilterOptions({
                facets: response.facets,
                availableColors: response.availableColors || [],
                availableSizes: response.availableSizes || [],
                availableGenders: response.availableGenders || []
              }));
            }
            
            return ProductActions.searchProductsSuccess({
              products: response.products,
              totalCount: response.totalCount,
              currentPage: response.currentPage,
              pageSize: response.pageSize,
              searchTerm,
              facets: response.facets
            });
          }),
          catchError((error: any) => {
            console.error('searchProducts$ error:', error);
            return of(ProductActions.searchProductsFailure({ 
              error: error.message || 'Arama sırasında bir hata oluştu' 
            }));
          })
        );
      })
    )
  );

  // Tekil ürün detayı yükleme
  selectProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.selectProduct),
      switchMap(({ productId }) =>
        this.productService.getProductById(productId).pipe(
          map((product) => 
            ProductActions.selectProductSuccess({ product })
          ),
          catchError((error: any) => {
            console.error('selectProduct$ error:', error);
            return of(ProductActions.selectProductFailure({ 
              error: error.message || 'Ürün detayları yüklenirken bir hata oluştu' 
            }));
          })
        )
      )
    )
  );

  // Filtre değişikliklerinde ürünleri yeniden yükle - DÜZELTİLDİ
  filterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setFilters, ProductActions.clearFilters, ProductActions.addFilter, ProductActions.removeFilter),
      tap(action => {
        console.log('filterChange$ triggered by action:', action.type);
      }),
      withLatestFrom(
        this.store.select(ProductSelectors.selectProductFilters),
        this.store.select(ProductSelectors.selectPageSize),
        this.store.select(ProductSelectors.selectSortBy)
      ),
      map(([action, filters, pageSize, sortBy]) => {
        console.log('filterChange$ - current state:', { filters, pageSize, sortBy });
        console.log('filterChange$ - filters type:', typeof filters);
        console.log('filterChange$ - filters content:', JSON.stringify(filters, null, 2));
        
        return ProductActions.loadProductsWithParams({
          filters: filters || {},
          page: 1, // Filtre değişiminde ilk sayfaya dön
          pageSize,
          sortBy
        });
      })
    )
  );

  // Sıralama değişikliklerinde ürünleri yeniden yükle
  sortChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setSortBy),
      withLatestFrom(
        this.store.select(ProductSelectors.selectProductFilters),
        this.store.select(ProductSelectors.selectCurrentPage),
        this.store.select(ProductSelectors.selectPageSize)
      ),
      map(([{ sortBy }, filters, currentPage, pageSize]) => {
        console.log('sortChange$ triggered:', { sortBy, filters });
        
        return ProductActions.loadProductsWithParams({
          filters,
          page: currentPage,
          pageSize,
          sortBy
        });
      })
    )
  );

  // Sayfa değişikliklerinde ürünleri yeniden yükle
  pageChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setPage, ProductActions.nextPage, ProductActions.previousPage),
      withLatestFrom(
        this.store.select(ProductSelectors.selectProductFilters),
        this.store.select(ProductSelectors.selectCurrentPage),
        this.store.select(ProductSelectors.selectPageSize),
        this.store.select(ProductSelectors.selectSortBy)
      ),
      map(([action, filters, currentPage, pageSize, sortBy]) => {
        let newPage = currentPage;
        
        if (action.type === ProductActions.nextPage.type) {
          newPage = currentPage + 1;
        } else if (action.type === ProductActions.previousPage.type) {
          newPage = Math.max(1, currentPage - 1);
        } else if (action.type === ProductActions.setPage.type && 'page' in action) {
          newPage = (action as any).page;
        }
        
        console.log('pageChange$ triggered:', { newPage, filters });
        
        return ProductActions.loadProductsWithParams({
          filters,
          page: newPage,
          pageSize,
          sortBy
        });
      })
    )
  );

  // Sayfa boyutu değişikliklerinde ürünleri yeniden yükle
  pageSizeChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setPageSize),
      withLatestFrom(
        this.store.select(ProductSelectors.selectProductFilters),
        this.store.select(ProductSelectors.selectSortBy)
      ),
      map(([{ pageSize }, filters, sortBy]) => {
        console.log('pageSizeChange$ triggered:', { pageSize, filters });
        
        return ProductActions.loadProductsWithParams({
          filters,
          page: 1,
          pageSize,
          sortBy
        });
      })
    )
  );

  // Filtre seçeneklerini yükle
  loadFilterOptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadFilterOptions),
      switchMap(() => {
        console.log('loadFilterOptions$ triggered');
        
        // İlk önce basit bir ürün listesi çek ki facets verisini alalım
        return this.productService.getProducts({
          page: 1,
          pageSize: 1 // Sadece facets için, çok az ürün yeter
        }).pipe(
          switchMap((response: ProductResponse) => {
            if (response.facets && response.facets.length > 0) {
              console.log('Filter options loaded from facets:', response.facets.length);
              return of(ProductActions.updateFilterOptions({
                facets: response.facets,
                availableColors: response.availableColors || [],
                availableSizes: response.availableSizes || [],
                availableGenders: response.availableGenders || []
              }));
            } else {
              // Fallback olarak kategoriler ve markalar yükle
              const categories$ = this.productService.getCategories().pipe(
                catchError(() => of([]))
              );
              const brands$ = this.productService.getBrands().pipe(
                catchError(() => of([]))
              );

              return combineLatest([categories$, brands$]).pipe(
                map(([categories, brands]) => 
                  ProductActions.loadFilterOptionsSuccess({ categories, brands })
                )
              );
            }
          }),
          catchError((error: any) => {
            console.error('loadFilterOptions$ error:', error);
            return of(ProductActions.loadFilterOptionsFailure({ 
              error: error.message || 'Filtre seçenekleri yüklenirken hata oluştu' 
            }));
          })
        );
      })
    )
  );

  // Son işlemi tekrar dene
  retryLastAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.retryLastAction),
      withLatestFrom(
        this.store.select(ProductSelectors.selectProductFilters),
        this.store.select(ProductSelectors.selectCurrentPage),
        this.store.select(ProductSelectors.selectPageSize),
        this.store.select(ProductSelectors.selectSortBy)
      ),
      map(([action, filters, currentPage, pageSize, sortBy]) => {
        console.log('retryLastAction$ triggered');
        
        return ProductActions.loadProductsWithParams({
          filters,
          page: currentPage,
          pageSize,
          sortBy
        });
      })
    )
  );

  // Filter seçenekleri güncellendiğinde log
  filterOptionsUpdated$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateFilterOptions),
      tap(({ facets, availableColors, availableSizes, availableGenders }) => {
        console.log('Filter options updated:', {
          facetsCount: facets?.length || 0,
          colorsCount: availableColors?.length || 0,
          sizesCount: availableSizes?.length || 0,
          gendersCount: availableGenders?.length || 0
        });
      })
    ),
    { dispatch: false }
  );

  // Debug için action logging
  logActions$ = createEffect(() =>
    this.actions$.pipe(
      tap((action) => {
        if (action.type.includes('[Product')) {
          console.log('NgRx Product Action dispatched:', action.type);
          if (action.type.includes('Filter')) {
            console.log('Filter action details:', action);
          }
        }
      })
    ),
    { dispatch: false }
  );

  // API hata yönetimi
  handleApiErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ProductActions.loadProductsFailure,
        ProductActions.searchProductsFailure,
        ProductActions.selectProductFailure,
        ProductActions.loadFilterOptionsFailure
      ),
      tap((action) => {
        console.error('Product API Error:', action.error);
        
        if (action.error.includes('yetkilendirme')) {
          console.warn('API yetkilendirme sorunu. Token kontrol edilmeli.');
        } else if (action.error.includes('zaman aşımı')) {
          console.warn('API zaman aşımı. Bağlantı kontrolü yapılmalı.');
        }
      })
    ),
    { dispatch: false }
  );
}