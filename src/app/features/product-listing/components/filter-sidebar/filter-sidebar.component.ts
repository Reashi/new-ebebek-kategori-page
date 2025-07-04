// src/app/features/product-listing/components/filter-sidebar/filter-sidebar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductFilters, Category, Brand, FilterOption, ColorOption } from '../../product/product.model';
import * as ProductActions from '../../product/product.actions';
import * as ProductSelectors from '../../product/product.selectors';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss']
})
export class FilterSidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables
  filters$: Observable<ProductFilters>;
  hasActiveFilters$: Observable<boolean>;

  // Filter data
  categories: Category[] = [
    { id: 'strollers', name: 'Bebek Arabaları' },
    { id: 'food', name: 'Mama & Beslenme' },
    { id: 'toys', name: 'Oyuncaklar' },
    { id: 'feeding', name: 'Emzirme & Beslenme' },
    { id: 'safety', name: 'Güvenlik' },
    { id: 'care', name: 'Bakım & Hijyen' },
    { id: 'car-seats', name: 'Oto Koltuğu' },
    { id: 'diapers', name: 'Bez & Islak Mendil' },
    { id: 'bath', name: 'Banyo' },
    { id: 'sleep', name: 'Uyku' }
  ];

  brands: Brand[] = [
    { id: 'chicco', name: 'Chicco', productCount: 45 },
    { id: 'bebeto', name: 'Bebeto', productCount: 32 },
    { id: 'mama-papa', name: 'Mama Papa', productCount: 28 },
    { id: 'johnson', name: 'Johnson\'s', productCount: 23 },
    { id: 'philips-avent', name: 'Philips Avent', productCount: 19 },
    { id: 'tommee-tippee', name: 'Tommee Tippee', productCount: 15 },
    { id: 'nuby', name: 'Nuby', productCount: 12 },
    { id: 'mam', name: 'MAM', productCount: 11 }
  ];

  sizes: FilterOption[] = [
    { id: '0-3-ay', name: '0-3 Ay', count: 25 },
    { id: '3-6-ay', name: '3-6 Ay', count: 30 },
    { id: '6-12-ay', name: '6-12 Ay', count: 35 },
    { id: '12-18-ay', name: '12-18 Ay', count: 28 },
    { id: '18-24-ay', name: '18-24 Ay', count: 20 },
    { id: '2-3-yas', name: '2-3 Yaş', count: 18 }
  ];

  genders: FilterOption[] = [
    { id: 'erkek', name: 'Erkek', count: 45 },
    { id: 'kız', name: 'Kız', count: 42 },
    { id: 'unisex', name: 'Unisex', count: 38 }
  ];

  colors: ColorOption[] = [
    { id: 'kirmizi', name: 'Kırmızı', hexCode: '#e74c3c' },
    { id: 'mavi', name: 'Mavi', hexCode: '#3498db' },
    { id: 'yesil', name: 'Yeşil', hexCode: '#27ae60' },
    { id: 'sari', name: 'Sarı', hexCode: '#f1c40f' },
    { id: 'pembe', name: 'Pembe', hexCode: '#e91e63' },
    { id: 'mor', name: 'Mor', hexCode: '#9b59b6' },
    { id: 'turuncu', name: 'Turuncu', hexCode: '#e67e22' },
    { id: 'kahverengi', name: 'Kahverengi', hexCode: '#8d6e63' },
    { id: 'gri', name: 'Gri', hexCode: '#95a5a6' },
    { id: 'siyah', name: 'Siyah', hexCode: '#2c3e50' },
    { id: 'beyaz', name: 'Beyaz', hexCode: '#ecf0f1' },
    { id: 'lacivert', name: 'Lacivert', hexCode: '#2c3e50' },
    { id: 'bordo', name: 'Bordo', hexCode: '#8e44ad' },
    { id: 'turkuaz', name: 'Turkuaz', hexCode: '#1abc9c' },
    { id: 'krem', name: 'Krem', hexCode: '#f5f5dc' },
    { id: 'gold', name: 'Gold', hexCode: '#ffd700' },
    { id: 'gumush', name: 'Gümüş', hexCode: '#c0c0c0' },
    { id: 'pastel-mavi', name: 'Pastel Mavi', hexCode: '#add8e6' }
  ];

  priceRanges = [
    { min: 0, max: 50, label: '0-50 TL' },
    { min: 50, max: 100, label: '50-100 TL' },
    { min: 100, max: 250, label: '100-250 TL' },
    { min: 250, max: 500, label: '250-500 TL' },
    { min: 500, max: 1000, label: '500-1000 TL' },
    { min: 1000, max: 999999, label: '1000+ TL' }
  ];

  ratingOptions = [
    { value: 4, count: 25 },
    { value: 3, count: 45 },
    { value: 2, count: 15 },
    { value: 1, count: 8 }
  ];

  // Form data
  selectedCategoryId = '';
  brandSearchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  onSaleOnly = false;
  inStockOnly = false;

  // Current filters
  private currentFilters: ProductFilters = {};

  constructor(private store: Store) {
    this.filters$ = this.store.select(ProductSelectors.selectProductFilters);
    this.hasActiveFilters$ = this.store.select(ProductSelectors.selectHasActiveFilters);
  }

  ngOnInit() {
    this.filters$.pipe(takeUntil(this.destroy$)).subscribe(filters => {
      this.currentFilters = filters;
      this.updateFormFromFilters(filters);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFormFromFilters(filters: ProductFilters) {
    this.selectedCategoryId = filters.categoryId || '';
    this.onSaleOnly = filters.onSaleOnly || false;
    this.inStockOnly = filters.inStockOnly || false;
    
    if (filters.priceRange) {
      this.minPrice = filters.priceRange.min;
      this.maxPrice = filters.priceRange.max;
    } else {
      this.minPrice = null;
      this.maxPrice = null;
    }
  }

  getFilteredBrands(): Brand[] {
    if (!this.brandSearchTerm) return this.brands;
    
    return this.brands.filter(brand => 
      brand.name.toLowerCase().includes(this.brandSearchTerm.toLowerCase())
    );
  }

  isSelected(filterType: keyof ProductFilters, value: string | number): boolean {
    const filterValue = this.currentFilters[filterType];
    if (Array.isArray(filterValue)) {
      return filterValue.includes(value as never);
    }
    return filterValue === value;
  }

  onCategoryChange() {
    this.store.dispatch(ProductActions.setFilters({
      filters: { categoryId: this.selectedCategoryId || undefined }
    }));
  }

  onBrandChange(brandId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentBrands = this.currentFilters.brandIds || [];
    
    let newBrands: string[];
    if (checked) {
      newBrands = [...currentBrands, brandId];
    } else {
      newBrands = currentBrands.filter(id => id !== brandId);
    }

    this.store.dispatch(ProductActions.setFilters({
      filters: { brandIds: newBrands.length > 0 ? newBrands : undefined }
    }));
  }

  onSizeChange(sizeId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentSizes = this.currentFilters.sizes || [];
    
    let newSizes: string[];
    if (checked) {
      newSizes = [...currentSizes, sizeId];
    } else {
      newSizes = currentSizes.filter(id => id !== sizeId);
    }

    this.store.dispatch(ProductActions.setFilters({
      filters: { sizes: newSizes.length > 0 ? newSizes : undefined }
    }));
  }

  onGenderChange(genderId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentGenders = this.currentFilters.genders || [];
    
    let newGenders: string[];
    if (checked) {
      newGenders = [...currentGenders, genderId];
    } else {
      newGenders = currentGenders.filter(id => id !== genderId);
    }

    this.store.dispatch(ProductActions.setFilters({
      filters: { genders: newGenders.length > 0 ? newGenders : undefined }
    }));
  }

  onColorChange(colorId: string) {
    const currentColors = this.currentFilters.colors || [];
    const isSelected = currentColors.includes(colorId);
    
    let newColors: string[];
    if (isSelected) {
      newColors = currentColors.filter(id => id !== colorId);
    } else {
      newColors = [...currentColors, colorId];
    }

    this.store.dispatch(ProductActions.setFilters({
      filters: { colors: newColors.length > 0 ? newColors : undefined }
    }));
  }

  onPriceChange() {
    if (this.minPrice !== null || this.maxPrice !== null) {
      this.store.dispatch(ProductActions.setFilters({
        filters: { 
          priceRange: {
            min: this.minPrice || 0,
            max: this.maxPrice || 999999
          }
        }
      }));
    } else {
      this.store.dispatch(ProductActions.setFilters({
        filters: { priceRange: undefined }
      }));
    }
  }

  setPriceRange(min: number, max: number) {
    this.minPrice = min;
    this.maxPrice = max === 999999 ? null : max;
    this.onPriceChange();
  }

  onRatingChange(rating: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentRatings = this.currentFilters.ratings || [];
    
    let newRatings: number[];
    if (checked) {
      newRatings = [...currentRatings, rating];
    } else {
      newRatings = currentRatings.filter(r => r !== rating);
    }

    this.store.dispatch(ProductActions.setFilters({
      filters: { ratings: newRatings.length > 0 ? newRatings : undefined }
    }));
  }

  onSaleChange() {
    this.store.dispatch(ProductActions.setFilters({
      filters: { onSaleOnly: this.onSaleOnly || undefined }
    }));
  }

  onStockChange() {
    this.store.dispatch(ProductActions.setFilters({
      filters: { inStockOnly: this.inStockOnly || undefined }
    }));
  }

  clearAllFilters() {
    this.store.dispatch(ProductActions.clearFilters());
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}