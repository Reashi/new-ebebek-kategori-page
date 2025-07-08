// src/app/features/product-listing/product/product.effects.ts - Updated with Facets Support

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, combineLatest, Observable } from 'rxjs';
import { map, catchError, switchMap, tap, take } from 'rxjs/operators';

import * as ProductActions from './product.actions';
import * as ProductSelectors from './product.selectors';
import { ProductService, ProductResponse } from '../services/product.service';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);
  private store = inject(Store);

  // İlk sayfa yüklendiğinde ürünleri yükle
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        combineLatest([
          this.store.select(ProductSelectors.selectProductFilters).pipe(take(1)),
          this.store.select(ProductSelectors.selectCurrentPage).pipe(take(1)),
          this.store.select(ProductSelectors.selectPageSize).pipe(take(1))
        ]).pipe(
          map(([filters, currentPage, pageSize]) =>
            ProductActions.loadProductsWithParams({
              filters,
              page: currentPage,
              pageSize
            })
          )
        )
      )
    )
  );

  // Parametrelerle ürün yükleme - Geliştirilmiş versiyon
  loadProductsWithParams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProductsWithParams),
      switchMap(({ filters, page, pageSize, sortBy }) =>
        this.productService.getProducts({
          filters,
          page,
          pageSize,
          sortBy
        }).pipe(
          map((response: ProductResponse) => {
            // Facets verisi varsa filter sidebar'ı güncelle
            if (response.facets && response.facets.length > 0) {
              // Filter sidebar'a facets verisini gönder (action eklenecek)
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
            console.error('Load products with params error:', error);
            return of(ProductActions.loadProductsFailure({ 
              error: error.message || 'Ürünler yüklenirken bir hata oluştu' 
            }));
          })
        )
      )
    )
  );

  // Ürün arama - Geliştirilmiş versiyon
  searchProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.searchProducts),
      switchMap(({ searchTerm }) =>
        combineLatest([
          this.store.select(ProductSelectors.selectProductFilters).pipe(take(1)),
          this.store.select(ProductSelectors.selectPageSize).pipe(take(1))
        ]).pipe(
          switchMap(([currentFilters, pageSize]) =>
            this.productService.searchProducts(searchTerm, {
              filters: currentFilters,
              page: 1,
              pageSize
            }).pipe(
              map((response: ProductResponse) => {
                // Facets verisi varsa filter sidebar'ı güncelle
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
                console.error('Search products error:', error);
                return of(ProductActions.searchProductsFailure({ 
                  error: error.message || 'Arama sırasında bir hata oluştu' 
                }));
              })
            )
          )
        )
      )
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
            console.error('Select product error:', error);
            return of(ProductActions.selectProductFailure({ 
              error: error.message || 'Ürün detayları yüklenirken bir hata oluştu' 
            }));
          })
        )
      )
    )
  );

  // Filtre değişikliklerinde ürünleri yeniden yükle
  filterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setFilters, ProductActions.clearFilters, ProductActions.addFilter, ProductActions.removeFilter),
      switchMap(() =>
        combineLatest([
          this.store.select(ProductSelectors.selectProductFilters).pipe(take(1)),
          this.store.select(ProductSelectors.selectPageSize).pipe(take(1))
        ]).pipe(
          map(([filters, pageSize]) => 
            ProductActions.loadProductsWithParams({
              filters,
              page: 1,
              pageSize
            })
          )
        )
      )
    )
  );

  // Sıralama değişikliklerinde ürünleri yeniden yükle
  sortChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setSortBy),
      switchMap(({ sortBy }) =>
        combineLatest([
          this.store.select(ProductSelectors.selectProductFilters).pipe(take(1)),
          this.store.select(ProductSelectors.selectCurrentPage).pipe(take(1)),
          this.store.select(ProductSelectors.selectPageSize).pipe(take(1))
        ]).pipe(
          map(([filters, currentPage, pageSize]) => 
            ProductActions.loadProductsWithParams({
              filters,
              page: currentPage,
              pageSize,
              sortBy
            })
          )
        )
      )
    )
  );

  // Sayfa değişikliklerinde ürünleri yeniden yükle
  pageChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setPage, ProductActions.nextPage, ProductActions.previousPage),
      switchMap((action) =>
        combineLatest([
          this.store.select(ProductSelectors.selectProductFilters).pipe(take(1)),
          this.store.select(ProductSelectors.selectCurrentPage).pipe(take(1)),
          this.store.select(ProductSelectors.selectPageSize).pipe(take(1))
        ]).pipe(
          map(([filters, currentPage, pageSize]) => {
            let newPage = currentPage;
            
            if (action.type === ProductActions.nextPage.type) {
              newPage = currentPage + 1;
            } else if (action.type === ProductActions.previousPage.type) {
              newPage = Math.max(1, currentPage - 1);
            } else if (action.type === ProductActions.setPage.type && 'page' in action) {
              newPage = (action as any).page;
            }
            
            return ProductActions.loadProductsWithParams({
              filters,
              page: newPage,
              pageSize
            });
          })
        )
      )
    )
  );

  // Sayfa boyutu değişikliklerinde ürünleri yeniden yükle
  pageSizeChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setPageSize),
      switchMap(({ pageSize }) =>
        this.store.select(ProductSelectors.selectProductFilters).pipe(
          take(1),
          map((filters) => 
            ProductActions.loadProductsWithParams({
              filters,
              page: 1,
              pageSize
            })
          )
        )
      )
    )
  );

  // Filtre seçeneklerini yükle - Düzeltilmiş versiyon
  loadFilterOptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadFilterOptions),
      switchMap(() => {
        // İlk önce basit bir ürün listesi çek ki facets verisini alalım
        return this.productService.getProducts({
          page: 1,
          pageSize: 1 // Sadece facets için, çok az ürün yeter
        }).pipe(
          switchMap((response: ProductResponse) => {
            if (response.facets && response.facets.length > 0) {
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
            console.error('Load filter options error:', error);
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
      switchMap(() =>
        combineLatest([
          this.store.select(ProductSelectors.selectProductFilters).pipe(take(1)),
          this.store.select(ProductSelectors.selectCurrentPage).pipe(take(1)),
          this.store.select(ProductSelectors.selectPageSize).pipe(take(1))
        ]).pipe(
          map(([filters, currentPage, pageSize]) => 
            ProductActions.loadProductsWithParams({
              filters,
              page: currentPage,
              pageSize
            })
          )
        )
      )
    )
  );

  // Başarılı arama sonrası search term'i filtrelere ekle
  searchSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.searchProductsSuccess),
      map(({ searchTerm }) => 
        ProductActions.setFilters({ 
          filters: { searchTerm } 
        })
      )
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
          console.log('NgRx Product Action:', action.type);
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
        
        // Hata türüne göre özel işlemler yapılabilir
        if (action.error.includes('yetkilendirme')) {
          // Auth error handling
          console.warn('API yetkilendirme sorunu. Token kontrol edilmeli.');
        } else if (action.error.includes('zaman aşımı')) {
          // Timeout error handling
          console.warn('API zaman aşımı. Bağlantı kontrolü yapılmalı.');
        }
      })
    ),
    { dispatch: false }
  );
}