// src/app/features/product-listing/components/filter-sidebar/filter-sidebar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, startWith } from 'rxjs/operators';

import { ProductFilters, FilterOptions, Brand, Category, Size, Color } from '../../product/product.model';
import * as ProductActions from '../../product/product.actions';
import * as ProductSelectors from '../../product/product.selectors';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables - FIX: Added startWith to provide default empty arrays
  categories$: Observable<Category[]>;
  brands$: Observable<Brand[]>;
  sizes$: Observable<Size[]>;
  colors$: Observable<Color[]>;
  filters$: Observable<ProductFilters>;

  // Local state
  selectedCategoryId = '';
  selectedBrands: string[] = [];
  selectedSizes: string[] = [];
  selectedGenders: ('male' | 'female' | 'unisex')[] = [];
  selectedColors: string[] = [];
  selectedRatings: number[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = false;
  onSaleOnly = false;

  constructor(private store: Store) {
    // Observable selectors with default values
    this.categories$ = this.store.select(ProductSelectors.selectCategories).pipe(
      startWith([])
    );
    this.brands$ = this.store.select(ProductSelectors.selectBrands).pipe(
      startWith([])
    );
    this.sizes$ = this.store.select(ProductSelectors.selectSizes).pipe(
      startWith([])
    );
    this.colors$ = this.store.select(ProductSelectors.selectColors).pipe(
      startWith([])
    );
    this.filters$ = this.store.select(ProductSelectors.selectProductFilters).pipe(
      startWith({})
    );
  }

  ngOnInit() {
    // Load filter options when component initializes
    this.store.dispatch(ProductActions.loadFilterOptions());

    // Subscribe to current filters to sync local state
    this.filters$.pipe(takeUntil(this.destroy$)).subscribe(filters => {
      this.syncLocalStateWithFilters(filters);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed properties
  get hasActiveFilters(): boolean {
    return !!(
      this.selectedCategoryId ||
      this.selectedBrands.length > 0 ||
      this.selectedSizes.length > 0 ||
      this.selectedGenders.length > 0 ||
      this.selectedColors.length > 0 ||
      this.selectedRatings.length > 0 ||
      this.minPrice !== null ||
      this.maxPrice !== null ||
      this.inStockOnly ||
      this.onSaleOnly
    );
  }

  // Event handlers
  onCategoryChange() {
    this.updateFilters({ 
      categoryId: this.selectedCategoryId || undefined 
    });
  }

  onBrandChange(brandId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    
    if (target.checked) {
      this.selectedBrands = [...this.selectedBrands, brandId];
    } else {
      this.selectedBrands = this.selectedBrands.filter(id => id !== brandId);
    }
    
    this.updateFilters({ 
      brandIds: this.selectedBrands.length > 0 ? this.selectedBrands : undefined 
    });
  }

  onSizeChange(sizeId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    
    if (target.checked) {
      this.selectedSizes = [...this.selectedSizes, sizeId];
    } else {
      this.selectedSizes = this.selectedSizes.filter(id => id !== sizeId);
    }
    
    this.updateFilters({ 
      sizeIds: this.selectedSizes.length > 0 ? this.selectedSizes : undefined 
    });
  }

  onGenderChange(gender: 'male' | 'female' | 'unisex', event: Event) {
    const target = event.target as HTMLInputElement;
    
    if (target.checked) {
      this.selectedGenders = [...this.selectedGenders, gender];
    } else {
      this.selectedGenders = this.selectedGenders.filter(g => g !== gender);
    }
    
    this.updateFilters({ 
      genders: this.selectedGenders.length > 0 ? this.selectedGenders : undefined 
    });
  }

  onColorToggle(colorId: string) {
    if (this.selectedColors.includes(colorId)) {
      this.selectedColors = this.selectedColors.filter(id => id !== colorId);
    } else {
      this.selectedColors = [...this.selectedColors, colorId];
    }
    
    this.updateFilters({ 
      colorIds: this.selectedColors.length > 0 ? this.selectedColors : undefined 
    });
  }

  onRatingChange(rating: number, event: Event) {
    const target = event.target as HTMLInputElement;
    
    if (target.checked) {
      this.selectedRatings = [...this.selectedRatings, rating];
    } else {
      this.selectedRatings = this.selectedRatings.filter(r => r !== rating);
    }
    
    this.updateFilters({ 
      ratings: this.selectedRatings.length > 0 ? this.selectedRatings : undefined 
    });
  }

  onPriceChange() {
    // Debounce logic could be added here if needed
    const priceRange = (this.minPrice !== null || this.maxPrice !== null) ? {
      min: this.minPrice || 0,
      max: this.maxPrice || 10000
    } : undefined;
    
    this.updateFilters({ priceRange });
  }

  onStockFilterChange() {
    this.updateFilters({ 
      inStockOnly: this.inStockOnly || undefined 
    });
  }

  onSaleFilterChange() {
    this.updateFilters({ 
      onSaleOnly: this.onSaleOnly || undefined 
    });
  }

  clearAllFilters() {
    // Reset all local state
    this.resetLocalState();
    
    // Dispatch clear action
    this.store.dispatch(ProductActions.clearFilters());
  }

  // Helper methods
  private updateFilters(filters: Partial<ProductFilters>) {
    this.store.dispatch(ProductActions.setFilters({ filters }));
  }

  private syncLocalStateWithFilters(filters: ProductFilters) {
    if (!filters) return; // FIX: Guard clause for undefined filters
    
    this.selectedCategoryId = filters.categoryId || '';
    this.selectedBrands = filters.brandIds || [];
    this.selectedSizes = filters.sizeIds || [];
    this.selectedGenders = filters.genders || [];
    this.selectedColors = filters.colorIds || [];
    this.selectedRatings = filters.ratings || [];
    this.minPrice = filters.priceRange?.min ?? null;
    this.maxPrice = filters.priceRange?.max ?? null;
    this.inStockOnly = filters.inStockOnly || false;
    this.onSaleOnly = filters.onSaleOnly || false;
  }

  private resetLocalState() {
    this.selectedCategoryId = '';
    this.selectedBrands = [];
    this.selectedSizes = [];
    this.selectedGenders = [];
    this.selectedColors = [];
    this.selectedRatings = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = false;
    this.onSaleOnly = false;
  }

  // Utility methods for template
  isColorSelected(colorId: string): boolean {
    return this.selectedColors.includes(colorId);
  }

  isBrandSelected(brandId: string): boolean {
    return this.selectedBrands.includes(brandId);
  }

  isSizeSelected(sizeId: string): boolean {
    return this.selectedSizes.includes(sizeId);
  }

  isGenderSelected(gender: 'male' | 'female' | 'unisex'): boolean {
    return this.selectedGenders.includes(gender);
  }

  isRatingSelected(rating: number): boolean {
    return this.selectedRatings.includes(rating);
  }

  getSelectedFiltersCount(): number {
    let count = 0;
    if (this.selectedCategoryId) count++;
    if (this.selectedBrands.length > 0) count++;
    if (this.selectedSizes.length > 0) count++;
    if (this.selectedGenders.length > 0) count++;
    if (this.selectedColors.length > 0) count++;
    if (this.selectedRatings.length > 0) count++;
    if (this.minPrice !== null || this.maxPrice !== null) count++;
    if (this.inStockOnly) count++;
    if (this.onSaleOnly) count++;
    return count;
  }

  // Accessibility methods
  onKeydownColorToggle(event: KeyboardEvent, colorId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onColorToggle(colorId);
    }
  }

  getColorAriaLabel(color: Color): string {
    const isSelected = this.isColorSelected(color.id);
    return `${color.name} rengi ${isSelected ? 'seçili' : 'seçili değil'}`;
  }
}