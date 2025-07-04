// src/app/features/product-listing/product/product.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as ProductActions from './product.actions';
import { ProductService } from '../services/product.service';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);

  // Load products effect
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(({ filters, page, pageSize }) =>
        this.productService.getProducts({ filters, page, pageSize }).pipe(
          map((response) => 
            ProductActions.loadProductsSuccess({
              products: response.products,
              totalCount: response.totalCount,
              currentPage: response.currentPage
            })
          ),
          catchError((error) => {
            console.error('Load products error:', error);
            return of(ProductActions.loadProductsFailure({ 
              error: error.message || 'Ürünler yüklenirken bir hata oluştu' 
            }));
          })
        )
      )
    )
  );

  // Load filter options effect - eğer loadFilterOptions action'ı varsa
  // Şimdilik bu effect'i kapatıyoruz çünkü action tanımlanmamış olabilir
  /*
  loadFilterOptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadFilterOptions),
      switchMap(() =>
        this.productService.getFilterOptions().pipe(
          map((filterOptions) => 
            ProductActions.loadFilterOptionsSuccess({ filterOptions })
          ),
          catchError((error) => {
            console.error('Load filter options error:', error);
            return of(ProductActions.loadFilterOptionsFailure({ 
              error: error.message || 'Filtre seçenekleri yüklenirken bir hata oluştu' 
            }));
          })
        )
      )
    )
  );
  */

  // Select product effect
  selectProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.selectProduct),
      switchMap(({ productId }) =>
        this.productService.getProductById(productId).pipe(
          map((product) => 
            ProductActions.selectProductSuccess({ product })
          ),
          catchError((error) => {
            console.error('Select product error:', error);
            return of(ProductActions.selectProductFailure({ 
              error: error.message || 'Ürün detayları yüklenirken bir hata oluştu' 
            }));
          })
        )
      )
    )
  );

  // Filter change effect - reload products when filters change
  filterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setFilters, ProductActions.clearFilters),
      map(() => ProductActions.loadProducts({}))
    )
  );

  // Page change effect - reload products when page changes
  pageChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.setPage, ProductActions.setPageSize),
      map(() => ProductActions.loadProducts({}))
    )
  );

  // Log actions for debugging (only in development)
  logActions$ = createEffect(() =>
    this.actions$.pipe(
      tap((action) => {
        console.log('NgRx Action:', action);
      })
    ),
    { dispatch: false }
  );
}