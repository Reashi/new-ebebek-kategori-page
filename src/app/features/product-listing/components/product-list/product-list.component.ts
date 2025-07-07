// src/app/features/product-listing/components/product-list/product-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Product } from '../../product/product.model';
import { ProductCardComponent } from '../product-list-item/product-list-item.component';
import * as ProductActions from '../../product/product.actions';
import * as ProductSelectors from '../../product/product.selectors';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="product-list-container">
      <!-- Header Section -->
      <div class="list-header">
        <div class="list-title">
          <h1>E-bebek Ürünleri</h1>
          <p *ngIf="paginationInfo$ | async as info" class="result-summary">
            {{ info.totalCount }} üründen {{ info.startItem }}-{{ info.endItem }} arası gösteriliyor
          </p>
        </div>
        
        <div class="list-controls">
          <div class="sort-options">
            <label for="sort-select" class="sort-label">Sıralama:</label>
            <select id="sort-select" [(ngModel)]="sortBy" (change)="onSortChange()" class="sort-select">
              <option value="name">İsme Göre</option>
              <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
              <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
              <option value="rating">Puana Göre</option>
              <option value="newest">En Yeni</option>
            </select>
          </div>
          
          <div class="view-options">
            <button 
              class="view-btn"
              [class.active]="viewMode === 'grid'"
              (click)="setViewMode('grid')"
              title="Izgara Görünümü">
              ⊞
            </button>
            <button 
              class="view-btn"
              [class.active]="viewMode === 'list'"
              (click)="setViewMode('list')"
              title="Liste Görünümü">
              ☰
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="loading-state">
        <div class="loading-grid">
          <div *ngFor="let item of loadingItems" class="loading-card">
            <app-product-card [loading]="true" [product]="dummyProduct"></app-product-card>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="error-state">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3>Bir hata oluştu</h3>
          <p>{{ error }}</p>
          <button (click)="retryLoad()" class="retry-btn">Tekrar Dene</button>
        </div>
      </div>
      
      <!-- Products Section -->
      <div class="products-section" *ngIf="!(loading$ | async) && !(error$ | async)">
        <!-- Products Grid/List -->
        <div 
          class="products-container"
          [class.grid-view]="viewMode === 'grid'"
          [class.list-view]="viewMode === 'list'"
          *ngIf="(products$ | async)?.length; else noProductsFound">
          
          <app-product-card
            *ngFor="let product of products$ | async; trackBy: trackByProductId"
            [product]="product"
            [loading]="false"
            (productClick)="onProductClick($event)"
            (addToCart)="onAddToCart($event)"
            (addToFavorites)="onAddToFavorites($event)"
            class="product-item">
          </app-product-card>
        </div>
        
        <!-- No Products Found Template -->
        <ng-template #noProductsFound>
          <div class="no-products-state">
            <div class="no-products-content">
              <div class="no-products-icon">🔍</div>
              <h3>Ürün bulunamadı</h3>
              <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
              <p>Farklı filtreler deneyebilir veya arama teriminizi değiştirebilirsiniz.</p>
              <button 
                *ngIf="hasActiveFilters$ | async" 
                (click)="clearAllFilters()" 
                class="clear-filters-btn">
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </ng-template>
        
        <!-- Pagination -->
        <div class="pagination" *ngIf="paginationInfo$ | async as info">
          <button 
            (click)="previousPage()" 
            [disabled]="!info.hasPreviousPage"
            class="page-btn prev-btn"
            aria-label="Önceki sayfa">
            ← Önceki
          </button>
          
          <div class="page-numbers">
            <span class="page-info">
              Sayfa {{ info.currentPage }} / {{ info.totalPages }}
            </span>
          </div>
          
          <button 
            (click)="nextPage()" 
            [disabled]="!info.hasNextPage"
            class="page-btn next-btn"
            aria-label="Sonraki sayfa">
            Sonraki →
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Observables
  products$: Observable<Product[]>;
  selectedProduct$: Observable<Product | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  paginationInfo$: Observable<any>;
  hasActiveFilters$: Observable<boolean>;
  
  // Form data
  sortBy = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  
  // Loading state helpers
  loadingItems = Array(12).fill(0);
  dummyProduct: Product = {
    id: 'dummy',
    name: 'Loading...',
    price: 0,
    description: '',
    imageUrl: '',
    categoryId: '',
    brandId: '',
    inStock: true
  };

  constructor(private store: Store) {
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.selectedProduct$ = this.store.select(ProductSelectors.selectSelectedProduct);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.error$ = this.store.select(ProductSelectors.selectProductsError);
    this.paginationInfo$ = this.store.select(ProductSelectors.selectPaginationInfo);
    this.hasActiveFilters$ = this.store.select(ProductSelectors.selectHasActiveFilters);
  }

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts() {
    // Artık bu action otomatik olarak current filters, page, pageSize ile çalışacak
    this.store.dispatch(ProductActions.loadProducts());
  }

  onProductClick(productId: string) {
    this.store.dispatch(ProductActions.selectProduct({ productId }));
    console.log('Ürün detayına git:', productId);
  }

  onAddToCart(productId: string) {
    console.log('Sepete eklendi:', productId);
    // Burada gerçek sepete ekleme işlemi yapılacak
    // this.cartService.addToCart(productId);
  }

  onAddToFavorites(productId: string) {
    console.log('Favorilere eklendi:', productId);
    // Burada gerçek favorilere ekleme işlemi yapılacak
    // this.favoritesService.addToFavorites(productId);
  }

  onSortChange() {
    console.log('Sort by:', this.sortBy);
    this.store.dispatch(ProductActions.setSortBy({ sortBy: this.sortBy }));
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
    // View mode'u localStorage'a kaydedebiliriz
    // localStorage.setItem('productViewMode', mode);
  }

  clearAllFilters() {
    this.store.dispatch(ProductActions.clearFilters());
  }

  nextPage() {
    this.store.dispatch(ProductActions.nextPage());
  }

  previousPage() {
    this.store.dispatch(ProductActions.previousPage());
  }

  retryLoad() {
    this.store.dispatch(ProductActions.retryLastAction());
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}