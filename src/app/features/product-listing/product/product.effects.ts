// src/app/features/product-listing/product/product.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, combineLatest } from 'rxjs';
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

  // Parametrelerle ürün yükleme
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
          map((response: ProductResponse) => 
            ProductActions.loadProductsSuccess({
              products: response.products,
              totalCount: response.totalCount,
              currentPage: response.currentPage,
              pageSize: response.pageSize
            })
          ),
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

  // Ürün arama
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
              map((response: ProductResponse) => 
                ProductActions.searchProductsSuccess({
                  products: response.products,
                  totalCount: response.totalCount,
                  currentPage: response.currentPage,
                  pageSize: response.pageSize,
                  searchTerm
                })
              ),
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

// Filtre seçeneklerini yükle - API facet verilerinden
  loadFilterOptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadFilterOptions),
      switchMap(() => {
        return this.productService.getFacets().pipe(
          map((facets) => 
            ProductActions.loadFilterOptionsSuccess({ 
              categories: facets.find(f => f.code === 'category')?.values || [],
              brands: facets.find(f => f.code === 'brand')?.values || []
            })
          ),
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

  // Debug için action logging
  logActions$ = createEffect(() =>
    this.actions$.pipe(
      tap((action) => {
        console.log('NgRx Action:', action);
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
        console.error('API Error:', action.error);
      })
    ),
    { dispatch: false }
  );
}