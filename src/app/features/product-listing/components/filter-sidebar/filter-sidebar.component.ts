// src/app/features/product-listing/components/filter-sidebar/filter-sidebar.component.ts - Updated

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

  // Filter data - Bunlar API'den gelecek
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

  // API'den gelecek veriler
  availableSizes: FilterOption[] = [];
  availableGenders: FilterOption[] = [];
  availableColors: ColorOption[] = [];
  availableRatings: FilterOption[] = [];

  // Fallback veriler (API'den gelmezse)
  defaultSizes: FilterOption[] = [
    { id: '0-3-ay', name: '0-3 Ay', count: 25 },
    { id: '3-6-ay', name: '3-6 Ay', count: 30 },
    { id: '6-12-ay', name: '6-12 Ay', count: 35 },
    { id: '12-18-ay', name: '12-18 Ay', count: 28 },
    { id: '18-24-ay', name: '18-24 Ay', count: 20 },
    { id: '2-3-yas', name: '2-3 Yaş', count: 18 }
  ];

  defaultGenders: FilterOption[] = [
    { id: 'erkek', name: 'Erkek', count: 45 },
    { id: 'kız', name: 'Kız', count: 42 },
    { id: 'unisex', name: 'Unisex', count: 38 }
  ];

  defaultColors: ColorOption[] = [
    { id: 'mavi', name: 'Mavi', hexCode: '#3498db' },
    { id: 'kirmizi', name: 'Kırmızı', hexCode: '#e74c3c' },
    { id: 'yesil', name: 'Yeşil', hexCode: '#27ae60' },
    { id: 'sari', name: 'Sarı', hexCode: '#f1c40f' },
    { id: 'pembe', name: 'Pembe', hexCode: '#e91e63' },
    { id: 'mor', name: 'Mor', hexCode: '#9b59b6' },
    { id: 'turuncu', name: 'Turuncu', hexCode: '#e67e22' },
    { id: 'kahverengi', name: 'Kahverengi', hexCode: '#8d6e63' },
    { id: 'gri', name: 'Gri', hexCode: '#95a5a6' },
    { id: 'siyah', name: 'Siyah', hexCode: '#2c3e50' },
    { id: 'beyaz', name: 'Beyaz', hexCode: '#ecf0f1' },
    { id: 'krem', name: 'Krem', hexCode: '#f5f5dc' }
  ];

  priceRanges = [
    { min: 0, max: 50, label: '0-50 TL' },
    { min: 50, max: 100, label: '50-100 TL' },
    { min: 100, max: 250, label: '100-250 TL' },
    { min: 250, max: 500, label: '250-500 TL' },
    { min: 500, max: 1000, label: '500-1000 TL' },
    { min: 1000, max: 999999, label: '1000+ TL' }
  ];

  defaultRatingOptions: FilterOption[] = [
    { id: '4', name: '4 yıldız ve üzeri', count: 25 },
    { id: '3', name: '3 yıldız ve üzeri', count: 45 },
    { id: '2', name: '2 yıldız ve üzeri', count: 15 },
    { id: '1', name: '1 yıldız ve üzeri', count: 8 }
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

    // API'den filter seçeneklerini yükle
    this.store.dispatch(ProductActions.loadFilterOptions());
    
    // Facets güncellemelerini dinle
    this.store.select(ProductSelectors.selectFacets)
      .pipe(takeUntil(this.destroy$))
      .subscribe(facets => {
        if (facets && facets.length > 0) {
          this.updateFilterOptionsFromApi(facets);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFilterOptionsFromApi() {
    // Bu method artık ngOnInit'de dispatch ediliyor
    // Fallback olarak default değerleri yükle
    this.availableSizes = this.defaultSizes;
    this.availableGenders = this.defaultGenders;
    this.availableColors = this.defaultColors;
    this.availableRatings = [...this.defaultRatingOptions];
  }

  // API'den gelen facets verisini işleme methodu
    updateFilterOptionsFromApi(facets: any[]) {
    if (!facets) return;

    console.log('Facets received:', facets); // Debug için

    // Size facet'i işle
    const sizeFacet = facets.find(f => f.code === 'size');
    if (sizeFacet?.values) {
      this.availableSizes = sizeFacet.values.map((value: any) => ({
        id: value.code,
        name: value.name,
        count: value.count
      }));
    }

    // Gender facet'i işle
    const genderFacet = facets.find(f => f.code === 'gender');
    if (genderFacet?.values) {
      this.availableGenders = genderFacet.values.map((value: any) => ({
        id: this.mapGenderCode(value.code),
        name: value.name,
        count: value.count
      }));
    }

    // Color facet'i işle
    const colorFacet = facets.find(f => f.code === 'color');
    if (colorFacet?.values) {
      this.availableColors = colorFacet.values.map((value: any) => ({
        id: this.mapColorCode(value.code),
        name: value.name,
        hexCode: this.rgbToHex(value.code) || this.getDefaultColorHex(value.name)
      }));
    }

    // Rating facet'i işle
    const ratingFacet = facets.find(f => f.code === 'review_rating_star');
    if (ratingFacet?.values) {
      this.availableRatings = ratingFacet.values
        .filter((value: any) => !value.name.includes('Puansız'))
        .map((value: any) => ({
          id: value.code || value.name,
          name: value.name,
          count: value.count
        }))
        .filter((item: FilterOption) => Number(item.id) > 0);
    }

    // Brand facet'i işle - Burada kodlar sayısal, isimler string
    const brandFacet = facets.find(f => f.code === 'brand');
    if (brandFacet?.values) {
      console.log('Brand facet values:', brandFacet.values); // Debug için
      this.brands = brandFacet.values.map((value: any) => ({
        id: value.code.toString(), // Code'u string'e çevir
        name: value.name,
        productCount: value.count
      }));
      console.log('Processed brands:', this.brands); // Debug için
    }
  }

  private mapGenderCode(apiCode: string): string {
    const genderMap: { [key: string]: string } = {
      'Erkek Bebek': 'erkek',
      'Kız Bebek': 'kız',
      'Unisex': 'unisex',
      'Kadın': 'unisex' // Anne ürünleri için
    };
    return genderMap[apiCode] || 'unisex';
  }

  private mapColorCode(rgbCode: string): string {
    const rgbMap: { [key: string]: string } = {
      '0;0;255': 'mavi',
      '255;0;0': 'kirmizi',
      '0;128;0': 'yesil',
      '255;255;0': 'sari',
      '255;0;255': 'pembe',
      '128;0;128': 'mor',
      '255;165;0': 'turuncu',
      '165;42;42': 'kahverengi',
      '128;128;128': 'gri',
      '0;0;0': 'siyah',
      '255;255;255': 'beyaz',
      '194;178;128': 'krem'
    };
    return rgbMap[rgbCode] || rgbCode;
  }

  private rgbToHex(rgbCode: string): string | null {
    if (!rgbCode.includes(';')) return null;
    
    const [r, g, b] = rgbCode.split(';').map(Number);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private getDefaultColorHex(colorName: string): string {
    const colorHexMap: { [key: string]: string } = {
      'Mavi': '#3498db',
      'Kırmızı': '#e74c3c',
      'Yeşil': '#27ae60',
      'Sarı': '#f1c40f',
      'Pembe': '#e91e63',
      'Mor': '#9b59b6',
      'Turuncu': '#e67e22',
      'Kahverengi': '#8d6e63',
      'Gri': '#95a5a6',
      'Siyah': '#2c3e50',
      'Beyaz': '#ecf0f1',
      'Krem': '#f5f5dc',
      'Ekru': '#f5f5dc'
    };
    return colorHexMap[colorName] || '#cccccc';
  }

  private extractRatingValue(ratingName: string): number {
    const match = ratingName.match(/(\d+)\*/);
    return match ? parseInt(match[1]) : 0;
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

  // Getter methods for templates
  get sizes(): FilterOption[] {
    return this.availableSizes.length > 0 ? this.availableSizes : this.defaultSizes;
  }

  get genders(): FilterOption[] {
    return this.availableGenders.length > 0 ? this.availableGenders : this.defaultGenders;
  }

  get colors(): ColorOption[] {
    return this.availableColors.length > 0 ? this.availableColors : this.defaultColors;
  }

  get ratingOptions(): any[] {
    return this.availableRatings.length > 0 ? this.availableRatings : this.defaultRatingOptions;
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