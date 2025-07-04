// src/app/features/product-listing/components/product-list/product-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, startWith } from 'rxjs/operators';

import { Product } from '../../product/product.model';
import * as ProductActions from '../../product/product.actions';
import * as ProductSelectors from '../../product/product.selectors';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
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
  activeFiltersCount$: Observable<number>;

  constructor(private store: Store) {
    // Initialize observables
    this.products$ = this.store.select(ProductSelectors.selectAllProducts).pipe(
      startWith([])
    );
    this.selectedProduct$ = this.store.select(ProductSelectors.selectSelectedProduct);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.error$ = this.store.select(ProductSelectors.selectProductsError);
    this.paginationInfo$ = this.store.select(ProductSelectors.selectPaginationInfo);
    this.activeFiltersCount$ = this.store.select(ProductSelectors.selectActiveFiltersCount);
  }

  ngOnInit() {
    // Load products when component initializes
    this.store.dispatch(ProductActions.loadProducts({}));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Product actions
  loadProducts() {
    this.store.dispatch(ProductActions.loadProducts({}));
  }

  selectProduct(productId: string) {
    this.store.dispatch(ProductActions.selectProduct({ productId }));
  }

  closeModal() {
    this.store.dispatch(ProductActions.clearSelectedProduct());
  }

  // Pagination
  nextPage() {
    this.paginationInfo$.pipe(takeUntil(this.destroy$)).subscribe(info => {
      if (info?.hasNextPage) {
        this.store.dispatch(ProductActions.setPage({ page: info.currentPage + 1 }));
      }
    });
  }

  previousPage() {
    this.paginationInfo$.pipe(takeUntil(this.destroy$)).subscribe(info => {
      if (info?.hasPreviousPage) {
        this.store.dispatch(ProductActions.setPage({ page: info.currentPage - 1 }));
      }
    });
  }

  goToPage(page: number) {
    this.store.dispatch(ProductActions.setPage({ page }));
  }

  // Cart functionality (placeholder)
  addToCart(productId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    console.log('Sepete eklendi:', productId);
    
    // TODO: Implement cart functionality
    // this.store.dispatch(CartActions.addToCart({ productId, quantity: 1 }));
    
    // Optional: Show success message
    // this.showSuccessMessage('Ürün sepete eklendi!');
  }

  // Utility methods
  retryLoad() {
    this.loadProducts();
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  // Product rating display
  getStarsArray(rating: number): { filled: boolean }[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ filled: i <= Math.floor(rating) });
    }
    return stars;
  }

  // Price display
  hasDiscount(product: Product): boolean {
    return !!(product.originalPrice && product.originalPrice > product.price);
  }

  getDiscountPercentage(product: Product): number {
    if (!this.hasDiscount(product)) return 0;
    return Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100);
  }

  // Product availability
  isAvailable(product: Product): boolean {
    return product.inStock;
  }

  // Accessibility
  getProductAriaLabel(product: Product): string {
    return `${product.name}, ${product.price} TL, ${product.inStock ? 'Stokta var' : 'Stokta yok'}`;
  }

  // Modal accessibility
  onModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  // Filter actions
  clearAllFilters() {
    this.store.dispatch(ProductActions.clearFilters());
  }
}