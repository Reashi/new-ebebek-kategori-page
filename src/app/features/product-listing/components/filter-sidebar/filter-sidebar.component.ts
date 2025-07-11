// src/app/features/product-listing/components/filter-sidebar/filter-sidebar.component.ts - Fixed API Code Usage

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductFilters, Category, Brand } from '../../product/product.model';
import * as ProductActions from '../../product/product.actions';
import * as ProductSelectors from '../../product/product.selectors';

// FİX: Enhanced API Facet interfaces
interface ApiFacetValue {
  code: string;    // API'nin kullandığı değer (örn: "1,5 Yaş")
  name: string;    // Kullanıcıya gösterilen değer (örn: "1.5 Yaş")
  count: number;
  selected?: boolean;
}

interface FilterOptionWithCode {
  id?: string;      // Fallback için
  code?: string;    // API code - öncelik
  name: string;     // Display name
  count?: number;
  value?: any;      // Eski interface uyumluluğu için
}

interface ColorOptionWithCode extends FilterOptionWithCode {
  hexCode: string;
  rgbCode?: string;
}

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

  // Filter data - Static kategoriler
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

  // API'den gelecek veriler - Enhanced with code property
  availableSizes: FilterOptionWithCode[] = [];
  availableGenders: FilterOptionWithCode[] = [];
  availableColors: ColorOptionWithCode[] = [];
  availableRatings: FilterOptionWithCode[] = [];

  // Fallback veriler - Enhanced with code property
  defaultSizes: FilterOptionWithCode[] = [
    { id: '0-3-ay', code: '0-3 Ay', name: '0-3 Ay', count: 25 },
    { id: '3-6-ay', code: '3-6 Ay', name: '3-6 Ay', count: 30 },
    { id: '6-12-ay', code: '6-12 Ay', name: '6-12 Ay', count: 35 },
    { id: '12-18-ay', code: '12-18 Ay', name: '12-18 Ay', count: 28 },
    { id: '18-24-ay', code: '18-24 Ay', name: '18-24 Ay', count: 20 },
    { id: '2-3-yas', code: '2-3 Yaş', name: '2-3 Yaş', count: 18 }
  ];

  defaultGenders: FilterOptionWithCode[] = [
    { id: 'erkek', code: 'Erkek Bebek', name: 'Erkek', count: 45 },
    { id: 'kız', code: 'Kız Bebek', name: 'Kız', count: 42 },
    { id: 'unisex', code: 'Unisex', name: 'Unisex', count: 38 }
  ];

  defaultColors: ColorOptionWithCode[] = [
    { id: 'mavi', code: '0;0;255', name: 'Mavi', hexCode: '#3498db' },
    { id: 'kirmizi', code: '255;0;0', name: 'Kırmızı', hexCode: '#e74c3c' },
    { id: 'yesil', code: '0;128;0', name: 'Yeşil', hexCode: '#27ae60' },
    { id: 'sari', code: '255;255;0', name: 'Sarı', hexCode: '#f1c40f' },
    { id: 'pembe', code: '255;0;255', name: 'Pembe', hexCode: '#e91e63' },
    { id: 'mor', code: '128;0;128', name: 'Mor', hexCode: '#9b59b6' },
    { id: 'turuncu', code: '255;165;0', name: 'Turuncu', hexCode: '#e67e22' },
    { id: 'kahverengi', code: '165;42;42', name: 'Kahverengi', hexCode: '#8d6e63' },
    { id: 'gri', code: '128;128;128', name: 'Gri', hexCode: '#95a5a6' },
    { id: 'siyah', code: '0;0;0', name: 'Siyah', hexCode: '#2c3e50' },
    { id: 'beyaz', code: '255;255;255', name: 'Beyaz', hexCode: '#ecf0f1' },
    { id: 'krem', code: '194;178;128', name: 'Krem', hexCode: '#f5f5dc' }
  ];

  priceRanges = [
    { min: 0, max: 50, label: '0-50 TL' },
    { min: 50, max: 100, label: '50-100 TL' },
    { min: 100, max: 250, label: '100-250 TL' },
    { min: 250, max: 500, label: '250-500 TL' },
    { min: 500, max: 1000, label: '500-1000 TL' },
    { min: 1000, max: 999999, label: '1000+ TL' }
  ];

  defaultRatingOptions: FilterOptionWithCode[] = [
    { id: '4', code: '4* ve üzeri', name: '4 yıldız ve üzeri', count: 25, value: 4 },
    { id: '3', code: '3* ve üzeri', name: '3 yıldız ve üzeri', count: 45, value: 3 },
    { id: '2', code: '2* ve üzeri', name: '2 yıldız ve üzeri', count: 15, value: 2 },
    { id: '1', code: '1* ve üzeri', name: '1 yıldız ve üzeri', count: 8, value: 1 }
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

  // FİX: API'den gelen facets verisini işleme - CODE odaklı
  updateFilterOptionsFromApi(facets: any[]) {
    if (!facets) return;

    console.log('Facets received for processing:', facets);

    // Size facet'i işle - CODE değerini kullan
    const sizeFacet = facets.find(f => f.code === 'size');
    if (sizeFacet?.values) {
      console.log('Size facet values:', sizeFacet.values);
      this.availableSizes = sizeFacet.values
        .filter((value: ApiFacetValue) => value.code && value.name)
        .map((value: ApiFacetValue) => ({
          id: this.normalizeSizeCode(value.code), // Backward compatibility
          code: value.code, // API'nin beklediği değer - ÖNEMLİ!
          name: value.name, // UI'da gösterilen değer
          count: Number(value.count) || 0
        }));
      console.log('Processed sizes:', this.availableSizes);
    }

    // Gender facet'i işle - CODE değerini kullan
    const genderFacet = facets.find(f => f.code === 'gender');
    if (genderFacet?.values) {
      console.log('Gender facet values:', genderFacet.values);
      this.availableGenders = genderFacet.values
        .filter((value: ApiFacetValue) => value.code && value.name)
        .map((value: ApiFacetValue) => ({
          id: this.mapGenderCode(value.code), // Backward compatibility
          code: value.code, // API'nin beklediği değer - ÖNEMLİ!
          name: value.name, // UI'da gösterilen değer
          count: Number(value.count) || 0
        }));
      console.log('Processed genders:', this.availableGenders);
    }

    // Color facet'i işle - CODE değerini kullan
    const colorFacet = facets.find(f => f.code === 'color');
    if (colorFacet?.values) {
      console.log('Color facet values:', colorFacet.values);
      this.availableColors = colorFacet.values
        .filter((value: ApiFacetValue) => value.code && value.name)
        .map((value: ApiFacetValue) => ({
          id: this.mapColorCode(value.code), // Backward compatibility
          code: value.code, // API'nin beklediği değer (RGB format) - ÖNEMLİ!
          name: value.name, // UI'da gösterilen değer
          hexCode: this.rgbToHex(value.code) || this.getDefaultColorHex(value.name)
        }));
      console.log('Processed colors:', this.availableColors);
    }

    // Rating facet'i işle - CODE değerini kullan
    const ratingFacet = facets.find(f => f.code === 'review_rating_star');
    if (ratingFacet?.values) {
      console.log('Rating facet values:', ratingFacet.values);
      this.availableRatings = ratingFacet.values
        .filter((value: ApiFacetValue) => value.name && !value.name.includes('Puansız'))
        .map((value: ApiFacetValue) => ({
          id: String(value.code || this.extractRatingValue(value.name)), // Backward compatibility
          code: value.code || value.name, // API'nin beklediği değer - ÖNEMLİ!
          name: value.name, // UI'da gösterilen değer
          count: Number(value.count) || 0,
          value: this.extractRatingValue(value.name)
        }))
        .filter((item: FilterOptionWithCode) => (item.value || 0) > 0);
      console.log('Processed ratings:', this.availableRatings);
    }

    // Brand facet'i işle - CODE değerini kullan
    const brandFacet = facets.find(f => f.code === 'brand');
    if (brandFacet?.values) {
      console.log('Brand facet values:', brandFacet.values);
      this.brands = brandFacet.values
        .filter((value: ApiFacetValue) => value.code && value.name)
        .map((value: ApiFacetValue) => ({
          id: value.code, // Brand için code değeri direkt kullanılıyor
          name: value.name,
          productCount: Number(value.count) || 0
        }));
      console.log('Processed brands:', this.brands);
    }
  }

  // FİX: Helper methods for code normalization
  private normalizeSizeCode(apiCode: string): string {
    // API code'unu UI ID'sine çevir (backward compatibility için)
    return apiCode.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private mapGenderCode(apiCode: string): string {
    const genderMap: { [key: string]: string } = {
      'Erkek Bebek': 'erkek',
      'Kız Bebek': 'kız',
      'Unisex': 'unisex',
      'Kadın': 'unisex'
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

  // FİX: Rating value extraction - null safe
  extractRatingValue(ratingName: string | undefined): number {
    if (!ratingName) return 0;
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

  // Getter methods for templates - Return enhanced types
  get sizes(): FilterOptionWithCode[] {
    return this.availableSizes.length > 0 ? this.availableSizes : this.defaultSizes;
  }

  get genders(): FilterOptionWithCode[] {
    return this.availableGenders.length > 0 ? this.availableGenders : this.defaultGenders;
  }

  get colors(): ColorOptionWithCode[] {
    return this.availableColors.length > 0 ? this.availableColors : this.defaultColors;
  }

  get ratingOptions(): FilterOptionWithCode[] {
    return this.availableRatings.length > 0 ? this.availableRatings : this.defaultRatingOptions;
  }

  getFilteredBrands(): Brand[] {
    if (!this.brandSearchTerm) return this.brands;
    
    return this.brands.filter(brand => 
      brand.name.toLowerCase().includes(this.brandSearchTerm.toLowerCase())
    );
  }

  // FİX: isSelected metodu - code değerini kontrol et
  isSelected(filterType: keyof ProductFilters, value: string | number): boolean {
    if (!value) return false;
    
    const filterValue = this.currentFilters[filterType];
    if (Array.isArray(filterValue)) {
      return filterValue.includes(value as never);
    }
    return filterValue === value;
  }

  // Helper methods for template - NULL SAFE
  isColorSelected(color: ColorOptionWithCode): boolean {
    const colorCode = color.code || color.id;
    return colorCode ? this.isSelected('colors', colorCode) : false;
  }

  onColorClick(color: ColorOptionWithCode): void {
    const colorCode = color.code || color.id;
    if (colorCode) {
      this.onColorChange(colorCode);
    }
  }

  isRatingSelected(rating: FilterOptionWithCode): boolean {
    const ratingCode = rating.code || rating.value;
    return ratingCode ? this.isSelected('ratings', ratingCode) : false;
  }

  onRatingClick(rating: FilterOptionWithCode, event: Event): void {
    const ratingCode = rating.code || rating.value;
    if (ratingCode) {
      this.onRatingChange(ratingCode, event);
    }
  }

  onCategoryChange() {
    this.store.dispatch(ProductActions.setFilters({
      filters: { categoryId: this.selectedCategoryId || undefined }
    }));
  }

  onBrandChange(brandId: string, event: Event) {
    if (!brandId) return;
    
    const checked = (event.target as HTMLInputElement).checked;
    const currentBrands = this.currentFilters.brandIds || [];
    
    let newBrands: string[];
    if (checked) {
      newBrands = [...currentBrands, brandId];
    } else {
      newBrands = currentBrands.filter(id => id !== brandId);
    }

    console.log('Brand change:', { brandId, checked, newBrands });

    this.store.dispatch(ProductActions.setFilters({
      filters: { brandIds: newBrands.length > 0 ? newBrands : undefined }
    }));
  }

  // FİX: onSizeChange - API CODE değerini kullan
  onSizeChange(sizeCode: string, event: Event) {
    if (!sizeCode) return;
    
    const checked = (event.target as HTMLInputElement).checked;
    const currentSizes = this.currentFilters.sizes || [];
    
    let newSizes: string[];
    if (checked) {
      newSizes = [...currentSizes, sizeCode];
    } else {
      newSizes = currentSizes.filter(code => code !== sizeCode);
    }

    console.log('Size change with API CODE:', { 
      sizeCode, 
      checked, 
      currentSizes, 
      newSizes 
    });

    this.store.dispatch(ProductActions.setFilters({
      filters: { sizes: newSizes.length > 0 ? newSizes : undefined }
    }));
  }

  // FİX: onGenderChange - API CODE değerini kullan
  onGenderChange(genderCode: string, event: Event) {
    if (!genderCode) return;
    
    const checked = (event.target as HTMLInputElement).checked;
    const currentGenders = this.currentFilters.genders || [];
    
    let newGenders: string[];
    if (checked) {
      newGenders = [...currentGenders, genderCode];
    } else {
      newGenders = currentGenders.filter(code => code !== genderCode);
    }

    console.log('Gender change with API CODE:', { 
      genderCode, 
      checked, 
      currentGenders, 
      newGenders 
    });

    this.store.dispatch(ProductActions.setFilters({
      filters: { genders: newGenders.length > 0 ? newGenders : undefined }
    }));
  }

  // FİX: onColorChange - API CODE değerini kullan
  onColorChange(colorCode: string) {
    if (!colorCode) return;
    
    const currentColors = this.currentFilters.colors || [];
    const isSelected = currentColors.includes(colorCode);
    
    let newColors: string[];
    if (isSelected) {
      newColors = currentColors.filter(code => code !== colorCode);
    } else {
      newColors = [...currentColors, colorCode];
    }

    console.log('Color change with API CODE:', { 
      colorCode, 
      isSelected, 
      currentColors, 
      newColors 
    });

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

  // FİX: onRatingChange - API CODE değerini kullan
  onRatingChange(ratingCode: string | number, event: Event) {
    if (!ratingCode) return;
    
    const checked = (event.target as HTMLInputElement).checked;
    const currentRatings = this.currentFilters.ratings || [];
    
    // String code'u number'a çevir (rating değeri için)
    const ratingValue = typeof ratingCode === 'string' ? 
      this.extractRatingValue(ratingCode) : ratingCode;
    
    let newRatings: number[];
    if (checked) {
      newRatings = [...currentRatings, ratingValue];
    } else {
      newRatings = currentRatings.filter(r => r !== ratingValue);
    }

    console.log('Rating change with API CODE:', { 
      ratingCode, 
      ratingValue, 
      checked, 
      currentRatings, 
      newRatings 
    });

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