// src/app/features/product-listing/components/product-list.component.ts
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
      <h1>E-bebek Ürünleri</h1>
      
      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-wrapper">
          <input 
            type="text" 
            placeholder="Ürün ara..." 
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            class="search-input">
        </div>
        
        <div class="filter-wrapper">
          <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()" class="category-select">
            <option value="">Tüm Kategoriler</option>
            <option value="strollers">Bebek Arabaları</option>
            <option value="food">Mama & Beslenme</option>
            <option value="toys">Oyuncaklar</option>
            <option value="feeding">Emzirme & Beslenme</option>
            <option value="safety">Güvenlik</option>
            <option value="care">Bakım & Hijyen</option>
            <option value="car-seats">Oto Koltuğu</option>
            <option value="diapers">Bez & Islak Mendil</option>
            <option value="bath">Banyo</option>
            <option value="sleep">Uyku</option>
          </select>
          
          <label class="stock-filter">
            <input 
              type="checkbox" 
              [(ngModel)]="inStockOnly" 
              (change)="onStockFilterChange()">
            Sadece Stokta Olanlar
          </label>
          
          <button (click)="clearAllFilters()" class="clear-btn">
            Filtreleri Temizle
          </button>
        </div>
      </div>
      
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
        <div class="products-info">
          <p *ngIf="paginationInfo$ | async as info">
            {{ info.totalCount }} üründen {{ info.startItem }}-{{ info.endItem }} arası gösteriliyor
          </p>
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
            </div>
            
            <div class="product-info">
              <h3 class="product-name" (click)="selectProduct(product.id)">{{ product.name }}</h3>
              
              <div class="product-rating">
                <div class="stars">
                  <span class="star filled">★</span>
                  <span class="star filled">★</span>
                  <span class="star filled">★</span>
                  <span class="star filled">★</span>
                  <span class="star empty">☆</span>
                </div>
                <span class="rating-text">(4.0)</span>
              </div>
              
              <div class="product-price">{{ product.price | currency:'TRY':'symbol':'1.2-2' }}</div>
              
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
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
    }
    
    h1 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 30px;
    }
    
    .filters-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    
    .search-wrapper {
      margin-bottom: 15px;
    }
    
    .search-input {
      width: 100%;
      max-width: 400px;
      padding: 12px 16px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #1da1f2;
    }
    
    .filter-wrapper {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .category-select {
      padding: 10px 15px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      background: white;
      cursor: pointer;
    }
    
    .stock-filter {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    
    .clear-btn {
      padding: 10px 20px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .clear-btn:hover {
      background: #c0392b;
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
    
    .products-info {
      margin-bottom: 20px;
      color: #7f8c8d;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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
      margin-bottom: 12px;
    }
    
    .stars {
      display: flex;
      gap: 2px;
    }
    
    .star {
      font-size: 0.9em;
      color: #f39c12;
    }
    
    .star.empty {
      color: #ddd;
    }
    
    .rating-text {
      font-size: 0.85em;
      color: #7f8c8d;
    }
    
    .product-price {
      font-size: 1.25em;
      font-weight: bold;
      color: #e67e22;
      margin-bottom: 16px;
      margin-top: auto;
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
      .filter-wrapper {
        flex-direction: column;
        align-items: stretch;
      }
      
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
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
        grid-template-columns: 1fr;
      }
      
      .product-image-wrapper {
        height: 180px;
      }
    }
    
    @media (min-width: 1400px) {
      .products-grid {
        grid-template-columns: repeat(5, 1fr);
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
  searchTerm = '';
  selectedCategory = '';
  inStockOnly = false;

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

  onSearchChange() {
    this.store.dispatch(ProductActions.setFilters({
      filters: { searchTerm: this.searchTerm }
    }));
  }

  onCategoryChange() {
    this.store.dispatch(ProductActions.setFilters({
      filters: { categoryId: this.selectedCategory || undefined }
    }));
  }

  onStockFilterChange() {
    this.store.dispatch(ProductActions.setFilters({
      filters: { inStockOnly: this.inStockOnly }
    }));
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.inStockOnly = false;
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
    // Şimdilik sadece console log, daha sonra cart functionality eklenecek
    console.log('Sepete eklendi:', productId);
    
    // İsteğe bağlı: Basit bir alert göster
    // alert('Ürün sepete eklendi!');
    
    // Gelecekte burada cart action dispatch edilecek:
    // this.store.dispatch(CartActions.addToCart({ productId, quantity: 1 }));
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}