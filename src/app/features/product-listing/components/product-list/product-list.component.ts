// src/app/features/product-listing/components/product-list/product-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Product } from '../../product/product.model';
import * as ProductActions from '../../product/product.actions';
import * as ProductSelectors from '../../product/product.selectors';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-container">
      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="loading-state">
        <div class="spinner"></div>
        <p>Ürünler yükleniyor...</p>
      </div>
      
      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="error-state">
        <p>❌ {{ error }}</p>
        <button (click)="retryLoad()" class="retry-btn">Tekrar Dene</button>
      </div>
      
      <!-- Products Grid -->
      <div class="products-section" *ngIf="!(loading$ | async)">
        <div class="products-header">
          <div class="products-info">
            <p *ngIf="paginationInfo$ | async as info">
              {{ info.totalCount }} üründen {{ info.startItem }}-{{ info.endItem }} arası gösteriliyor
            </p>
          </div>
          
          <div class="sort-options">
            <select [(ngModel)]="sortBy" (change)="onSortChange()" class="sort-select">
              <option value="name">İsme Göre</option>
              <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
              <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
              <option value="rating">Puana Göre</option>
              <option value="newest">En Yeni</option>
            </select>
          </div>
        </div>
        
        <div class="products-grid">
          <div 
            *ngFor="let product of products$ | async; trackBy: trackByProductId" 
            class="product-card"
            [class.out-of-stock]="!product.inStock">
            
            <div class="product-image-wrapper" (click)="selectProduct(product.id)">
              <div class="product-image-placeholder">
                <span class="image-icon">📷</span>
              </div>
              <div *ngIf="!product.inStock" class="stock-overlay">Stok Yok</div>
              <div *ngIf="product.isOnSale" class="sale-badge">İndirim</div>
            </div>
            
            <div class="product-info">
              <h3 class="product-name" (click)="selectProduct(product.id)">{{ product.name }}</h3>
              
              <div class="product-rating" *ngIf="product.rating">
                <div class="stars">
                  <span *ngFor="let star of getStars(product.rating)" 
                        class="star"
                        [class.filled]="star <= product.rating!">★</span>
                </div>
                <span class="rating-text">({{ product.rating }})</span>
                <span class="review-count" *ngIf="product.reviewCount">({{ product.reviewCount }} değerlendirme)</span>
              </div>
              
              <div class="product-brand" *ngIf="getBrandName(product.brandId)">
                {{ getBrandName(product.brandId) }}
              </div>
              
              <div class="product-colors" *ngIf="product.colors && product.colors.length > 0">
                <span class="color-label">Renkler:</span>
                <div class="color-dots">
                  <div 
                    *ngFor="let color of product.colors" 
                    class="color-dot"
                    [style.background-color]="getColorHex(color)"
                    [title]="getColorName(color)">
                  </div>
                </div>
              </div>
              
              <div class="product-pricing">
                <div class="current-price">{{ product.price | currency:'TRY':'symbol':'1.2-2' }}</div>
                <div *ngIf="product.originalPrice && product.isOnSale" class="original-price">
                  {{ product.originalPrice | currency:'TRY':'symbol':'1.2-2' }}
                </div>
                <div *ngIf="product.originalPrice && product.isOnSale" class="discount-percent">
                  %{{ getDiscountPercent(product.price, product.originalPrice) }} İndirim
                </div>
              </div>
              
              <button 
                class="add-to-cart-btn" 
                [disabled]="!product.inStock"
                (click)="addToCart(product.id)"
                (click)="$event.stopPropagation()">
                <span class="cart-icon">🛒</span>
                {{ product.inStock ? 'Sepete Ekle' : 'Stok Yok' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="(products$ | async)?.length === 0 && !(loading$ | async)" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Ürün bulunamadı</h3>
          <p>Arama kriterlerinize uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.</p>
          <button (click)="clearAllFilters()" class="clear-filters-btn">
            Tüm Filtreleri Temizle
          </button>
        </div>
        
        <!-- Pagination -->
        <div class="pagination" *ngIf="paginationInfo$ | async as info">
          <button 
            (click)="previousPage()" 
            [disabled]="!info.hasPreviousPage"
            class="page-btn">
            ← Önceki
          </button>
          
          <span class="page-info">
            Sayfa {{ info.currentPage }} / {{ info.totalPages }}
          </span>
          
          <button 
            (click)="nextPage()" 
            [disabled]="!info.hasNextPage"
            class="page-btn">
            Sonraki →
          </button>
        </div>
      </div>
      
      <!-- Selected Product Modal -->
      <div *ngIf="selectedProduct$ | async as selected" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeModal()">×</button>
          <img [src]="selected.imageUrl" [alt]="selected.name" class="modal-image">
          <h2>{{ selected.name }}</h2>
          <p>{{ selected.description }}</p>
          <div class="modal-price">{{ selected.price | currency:'TRY':'symbol':'1.2-2' }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-container {
      padding: 0;
      font-family: 'Inter', sans-serif;
    }
    
    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1da1f2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-state {
      text-align: center;
      padding: 40px;
      background: #fee;
      border-radius: 8px;
      color: #c0392b;
      margin-bottom: 20px;
    }
    
    .retry-btn {
      padding: 10px 20px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 15px;
    }
    
    .products-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 0 5px;
    }
    
    .products-info {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    
    .sort-options {
      .sort-select {
        padding: 8px 12px;
        border: 1px solid #e1e8ed;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-size: 0.9em;
      }
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .product-card {
      border: 1px solid #e1e8ed;
      border-radius: 12px;
      overflow: hidden;
      background: white;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    
    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      border-color: #3498db;
    }
    
    .product-card.out-of-stock {
      opacity: 0.6;
    }
    
    .product-image-wrapper {
      position: relative;
      height: 200px;
      background: #f8f9fa;
      cursor: pointer;
      overflow: hidden;
    }
    
    .product-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
                  linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
                  linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      transition: transform 0.3s;
    }
    
    .product-card:hover .product-image-placeholder {
      transform: scale(1.05);
    }
    
    .image-icon {
      font-size: 3em;
      color: #bdc3c7;
    }
    
    .stock-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(231, 76, 60, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9em;
    }
    
    .sale-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #e74c3c;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
    }
    
    .product-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .product-name {
      margin: 0 0 12px 0;
      font-size: 1em;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.3;
      cursor: pointer;
      transition: color 0.3s;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-name:hover {
      color: #3498db;
    }
    
    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    
    .stars {
      display: flex;
      gap: 2px;
    }
    
    .star {
      font-size: 0.9em;
      color: #ddd;
      
      &.filled {
        color: #f39c12;
      }
    }
    
    .rating-text, .review-count {
      font-size: 0.8em;
      color: #7f8c8d;
    }
    
    .product-brand {
      font-size: 0.85em;
      color: #7f8c8d;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .product-colors {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      
      .color-label {
        font-size: 0.8em;
        color: #7f8c8d;
      }
      
      .color-dots {
        display: flex;
        gap: 4px;
      }
      
      .color-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #ddd;
        cursor: pointer;
      }
    }
    
    .product-pricing {
      margin-bottom: 16px;
      margin-top: auto;
      
      .current-price {
        font-size: 1.25em;
        font-weight: bold;
        color: #e67e22;
      }
      
      .original-price {
        font-size: 0.9em;
        color: #95a5a6;
        text-decoration: line-through;
        margin-top: 2px;
      }
      
      .discount-percent {
        font-size: 0.8em;
        color: #e74c3c;
        font-weight: 600;
        margin-top: 2px;
      }
    }
    
    .add-to-cart-btn {
      width: 100%;
      padding: 12px 16px;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.9em;
    }
    
    .add-to-cart-btn:hover:not(:disabled) {
      background: #229954;
      transform: translateY(-1px);
    }
    
    .add-to-cart-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }
    
    .cart-icon {
      font-size: 1.1em;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      border: 1px solid #e1e8ed;
      
      .empty-icon {
        font-size: 4em;
        margin-bottom: 20px;
      }
      
      h3 {
        color: #2c3e50;
        margin-bottom: 10px;
      }
      
      p {
        color: #7f8c8d;
        margin-bottom: 20px;
      }
      
      .clear-filters-btn {
        background: #3498db;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.3s;
        
        &:hover {
          background: #2980b9;
        }
      }
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 40px;
    }
    
    .page-btn {
      padding: 12px 24px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .page-btn:hover:not(:disabled) {
      background: #2980b9;
    }
    
    .page-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
    
    .page-info {
      font-weight: 600;
      color: #2c3e50;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    }
    
    .close-btn {
      position: absolute;
      top: 15px;
      right: 20px;
      background: none;
      border: none;
      font-size: 30px;
      cursor: pointer;
      color: #7f8c8d;
    }
    
    .modal-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .modal-price {
      font-size: 1.5em;
      font-weight: bold;
      color: #e67e22;
      margin-top: 15px;
    }
    
    @media (max-width: 768px) {
      .products-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }
      
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
      }
      
      .pagination {
        flex-direction: column;
        gap: 10px;
      }
      
      .product-card {
        font-size: 0.9em;
      }
      
      .product-image-wrapper {
        height: 150px;
      }
      
      .product-info {
        padding: 12px;
      }
      
      .add-to-cart-btn {
        padding: 10px 12px;
        font-size: 0.85em;
      }
    }
    
    @media (max-width: 480px) {
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }
      
      .product-image-wrapper {
        height: 140px;
      }
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Observables
  products$: Observable<Product[]>;
  selectedProduct$: Observable<Product | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  paginationInfo$: Observable<any>;
  
  // Form data
  sortBy = 'name';

  // Color mapping
  private colorMap: { [key: string]: { name: string; hex: string } } = {
    'kirmizi': { name: 'Kırmızı', hex: '#e74c3c' },
    'mavi': { name: 'Mavi', hex: '#3498db' },
    'yesil': { name: 'Yeşil', hex: '#27ae60' },
    'sari': { name: 'Sarı', hex: '#f1c40f' },
    'pembe': { name: 'Pembe', hex: '#e91e63' },
    'mor': { name: 'Mor', hex: '#9b59b6' },
    'turuncu': { name: 'Turuncu', hex: '#e67e22' },
    'kahverengi': { name: 'Kahverengi', hex: '#8d6e63' },
    'gri': { name: 'Gri', hex: '#95a5a6' },
    'siyah': { name: 'Siyah', hex: '#2c3e50' },
    'beyaz': { name: 'Beyaz', hex: '#ecf0f1' },
    'lacivert': { name: 'Lacivert', hex: '#2c3e50' },
    'bordo': { name: 'Bordo', hex: '#8e44ad' },
    'turkuaz': { name: 'Turkuaz', hex: '#1abc9c' },
    'krem': { name: 'Krem', hex: '#f5f5dc' },
    'gold': { name: 'Gold', hex: '#ffd700' },
    'gumush': { name: 'Gümüş', hex: '#c0c0c0' },
    'pastel-mavi': { name: 'Pastel Mavi', hex: '#add8e6' }
  };

  // Brand mapping
  private brandMap: { [key: string]: string } = {
    'chicco': 'Chicco',
    'bebeto': 'Bebeto',
    'mama-papa': 'Mama Papa',
    'johnson': 'Johnson\'s',
    'philips-avent': 'Philips Avent',
    'tommee-tippee': 'Tommee Tippee',
    'nuby': 'Nuby',
    'mam': 'MAM'
  };

  constructor(private store: Store) {
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.selectedProduct$ = this.store.select(ProductSelectors.selectSelectedProduct);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.error$ = this.store.select(ProductSelectors.selectProductsError);
    this.paginationInfo$ = this.store.select(ProductSelectors.selectPaginationInfo);
  }

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts() {
    this.store.dispatch(ProductActions.loadProducts({}));
  }

  selectProduct(productId: string) {
    this.store.dispatch(ProductActions.selectProduct({ productId }));
  }

  closeModal() {
    this.store.dispatch(ProductActions.clearSelectedProduct());
  }

  onSortChange() {
    // Sorting logic burada implement edilecek
    console.log('Sort by:', this.sortBy);
  }

  clearAllFilters() {
    this.store.dispatch(ProductActions.clearFilters());
  }

  nextPage() {
    this.paginationInfo$.pipe(takeUntil(this.destroy$)).subscribe(info => {
      if (info.hasNextPage) {
        this.store.dispatch(ProductActions.setPage({ page: info.currentPage + 1 }));
      }
    });
  }

  previousPage() {
    this.paginationInfo$.pipe(takeUntil(this.destroy$)).subscribe(info => {
      if (info.hasPreviousPage) {
        this.store.dispatch(ProductActions.setPage({ page: info.currentPage - 1 }));
      }
    });
  }

  retryLoad() {
    this.loadProducts();
  }

  addToCart(productId: string) {
    console.log('Sepete eklendi:', productId);
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getBrandName(brandId: string): string {
    return this.brandMap[brandId] || brandId;
  }

  getColorName(colorId: string): string {
    return this.colorMap[colorId]?.name || colorId;
  }

  getColorHex(colorId: string): string {
    return this.colorMap[colorId]?.hex || '#ccc';
  }

  getDiscountPercent(currentPrice: number, originalPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
}