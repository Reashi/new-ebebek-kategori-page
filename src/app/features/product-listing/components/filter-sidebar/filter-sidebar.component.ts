// src/app/features/product-listing/components/filter-sidebar/filter-sidebar.component.ts - FIXED API Code Usage

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductFilters, Category, Brand } from '../../product/product.model';
import * as ProductActions from '../../product/product.actions';
import * as ProductSelectors from '../../product/product.selectors';

// API Facet interfaces - ENHANCED
interface ApiFacetValue {
  code: string;    // API'nin kullandığı değer (örn: "1,5 Yaş") - BU DEĞERİ KULLANACAğIZ
  name: string;    // Kullanıcıya gösterilen değer (örn: "1.5 Yaş") 
  count: number;
  selected?: boolean;
}

interface FilterOptionWithCode {
  id?: string;      // Fallback için
  code?: string;    // API code - ÖNCELIK - Bu değer API'ye gönderilecek
  name: string;     // Display name - Bu değer UI'da gösterilecek
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

  // Filter data - Gerçek e-bebek kategorileri
  categories: Category[] = [
    { id: '2-kapili-dolaplar', name: '2 Kapılı Dolaplar' },
    { id: '3-kapili-dolap', name: '3 Kapılı Dolap' },
    { id: '3-tekerlekli-bebek-bisikletleri', name: '3 Tekerlekli Bebek Bisikletleri' },
    { id: '4-tekerlekli-bebek-bisikletleri', name: '4 Tekerlekli Bebek Bisikletleri' },
    { id: 'ahsap-besik', name: 'Ahşap Beşik' },
    { id: 'ahsap-sandalye', name: 'Ahşap Sandalye' },
    { id: 'ahsap-cocuk-masalari', name: 'Ahşap Çocuk Masaları' },
    { id: 'akulu-araba', name: 'Akülü Araba' },
    { id: 'alt-degistirme-masalari', name: 'Alt Değiştirme Masaları' },
    { id: 'altin-kitaplar', name: 'Altın Kitaplar' },
    { id: 'anne-baba-egitim-kitaplari', name: 'Anne Baba Eğitim Kitapları' },
    { id: 'anne-bakim-urunleri', name: 'Anne Bakım Ürünleri' },
    { id: 'anne-bebek-bakim-cantasi', name: 'Anne Bebek Bakım Çantası' },
    { id: 'anne-yani-besigi', name: 'Anne Yanı Beşiği' },
    { id: 'ara-katli-park-yatak', name: 'Ara Katlı Park Yatak' },
    { id: 'ara-katsiz-park-yatak', name: 'Ara Katsız Park Yatak' },
    { id: 'atistirmalik-mama', name: 'Atıştırmalık Mama' },
    { id: 'bal-oyuncak', name: 'Bal Oyuncak' },
    { id: 'baston-puset', name: 'Baston Puset' },
    { id: 'bavul', name: 'Bavul' },
    { id: 'bebek', name: 'Bebek' },
    { id: 'bebek-ahsap-bloklar', name: 'Bebek Ahşap Bloklar' },
    { id: 'bebek-aktivite-masasi', name: 'Bebek Aktivite Masası' },
    { id: 'bebek-aktiviteli-oyuncak', name: 'Bebek Aktiviteli Oyuncak' },
    { id: 'bebek-alt-acma-ortusu', name: 'Bebek Alt Açma Örtüsü' },
    { id: 'bebek-alt-ust-takim', name: 'Bebek Alt Üst Takım' },
    { id: 'bebek-alindan-ates-olcer', name: 'Bebek Alından Ateş Ölçer' },
    { id: 'bebek-alistirma-bardagi', name: 'Bebek Alıştırma Bardağı' },
    { id: 'bebek-alistirma-kulodu', name: 'Bebek Alıştırma Külodu' },
    { id: 'bebek-araba-aynasi', name: 'Bebek Araba Aynası' },
    { id: 'bebek-araba-gunesligi', name: 'Bebek Araba Güneşliği' },
    { id: 'bebek-arabasi', name: 'Bebek Arabası' },
    { id: 'bebek-arabasi-minderi', name: 'Bebek Arabası Minderi' },
    { id: 'bebek-arabasi-organizatoru', name: 'Bebek Arabası Organizatörü' },
    { id: 'bebek-arabasi-tentesi', name: 'Bebek Arabası Tentesi' },
    { id: 'bebek-arabasi-yagmurlugu', name: 'Bebek Arabası Yağmurluğu' },
    { id: 'bebek-astronot-tulum', name: 'Bebek Astronot Tulum' },
    { id: 'bebek-ates-dusurucu', name: 'Bebek Ateş Düşürücü' },
    { id: 'bebek-atletleri', name: 'Bebek Atletleri' },
    { id: 'bebek-bakim-urunleri', name: 'Bebek Bakım Ürünleri' },
    { id: 'bebek-banyo-kopugu', name: 'Bebek Banyo Köpüğü' },
    { id: 'bebek-banyo-kuvet-ayagi', name: 'Bebek Banyo Küvet Ayağı' },
    { id: 'bebek-banyo-kuvet-filesi', name: 'Bebek Banyo Küvet Filesi' },
    { id: 'bebek-banyo-oyuncaklari', name: 'Bebek Banyo Oyuncakları' },
    { id: 'bebek-banyo-sungeri', name: 'Bebek Banyo Süngeri' },
    { id: 'bebek-banyo-termometresi', name: 'Bebek Banyo Termometresi' },
    { id: 'bebek-banyo-urunleri', name: 'Bebek Banyo Ürünleri' },
    { id: 'bebek-banyo-sapkasi', name: 'Bebek Banyo Şapkası' },
    { id: 'bebek-bardak-uclari', name: 'Bebek Bardak Uçları' },
    { id: 'bebek-basket-potasi', name: 'Bebek Basket Potası' },
    { id: 'bebek-battaniyeleri', name: 'Bebek Battaniyeleri' },
    { id: 'bebek-bere-eldiven-atki', name: 'Bebek Bere-Eldiven-Atkı' },
    { id: 'bebek-bilek-corap', name: 'Bebek Bilek Çorap' }
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

  // API'den gelecek veriler - ENHANCED with proper code handling
  availableSizes: FilterOptionWithCode[] = [];
  availableGenders: FilterOptionWithCode[] = [];
  availableColors: ColorOptionWithCode[] = [];
  availableRatings: FilterOptionWithCode[] = [];

  // Fallback veriler - FIXED: code değerleri API formatına uygun
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

  // FIXED: API'den gelen facets verisini işleme - CODE odaklı
  updateFilterOptionsFromApi(facets: any[]) {
    if (!facets) return;

    // Size facet'i işle - CODE DEĞERİNİ AYNEN KULLAN
    const sizeFacet = facets.find(f => f.code === 'size');
    if (sizeFacet?.values) {
      // Önce tüm geçerli seçenekleri al
      const filteredSizes = sizeFacet.values
        .filter((value: ApiFacetValue) => {
          // Temel filtreleme
          if (!value.code || !value.name) return false;
          
          // Boyut olan seçenekleri kaldır (cm, x içerenler)
          if (value.code.includes('cm') || value.code.includes('x')) return false;
          
          // Beden numaraları (S, M, L, XL, sayılar) ve yaş gruplarını tut
          const keepPatterns = [
            /^\d+$/, // Sadece sayı (19, 20, 21, vs)
            /^[SMLX]+$/, // Harf bedenleri (S, M, L, XL, 2XL)
            /^\d+[ABC]$/, // Bra bedenleri (80B, 90B, vs)
            /Ya[şs]/, // Yaş içerenler
            /Ay/, // Ay içerenler
            /Yenido[ğg]an/, // Yenidoğan
            /Premat[üu]re/, // Prematüre
            /Standart/, // Standart
            /Beden/ // X Beden formatı
          ];
          
          return keepPatterns.some(pattern => pattern.test(value.code));
        });
      
      // Yaş gruplarını birleştir
      const groupedSizes = this.groupSimilarSizes(filteredSizes);
      
      this.availableSizes = groupedSizes.map((value: ApiFacetValue) => {
        return {
          id: this.normalizeSizeCode(value.code), // Backward compatibility
          code: value.code, // API'nin TAM OLARAK BEKLEDİĞİ DEĞER - HİÇ DEĞİŞTİRME!
          name: value.name, // UI'da gösterilen değer
          count: Number(value.count) || 0
        };
      });
    }

    // Gender facet'i işle - CODE DEĞERİNİ AYNEN KULLAN
    const genderFacet = facets.find(f => f.code === 'gender');
    if (genderFacet?.values) {
      this.availableGenders = genderFacet.values
        .filter((value: ApiFacetValue) => value.code && value.name)
        .map((value: ApiFacetValue) => {
          return {
            id: this.mapGenderCode(value.code), // Backward compatibility
            code: value.code, // API'nin tam olarak beklediği değer - AYNEN KULLAN!
            name: value.name, // UI'da gösterilen değer
            count: Number(value.count) || 0
          };
        });
    }

    // Color facet'i işle - CODE DEĞERİNİ AYNEN KULLAN
    const colorFacet = facets.find(f => f.code === 'color');
    if (colorFacet?.values) {
      this.availableColors = colorFacet.values
        .filter((value: ApiFacetValue) => {
          // Null, undefined, boş string olan seçenekleri çıkar
          if (!value.code || !value.name) return false;
          
          // "null" string'i olan seçenekleri çıkar
          if (value.code === 'null' || value.name === 'null') return false;
          
          // Boş veya geçersiz RGB kodları çıkar
          if (value.code.trim() === '' || value.name.trim() === '') return false;
          
          return true;
        })
        .map((value: ApiFacetValue) => {
          return {
            id: this.mapColorCode(value.code), // Backward compatibility
            code: value.code, // API'nin tam olarak beklediği değer (RGB format) - AYNEN KULLAN!
            name: value.name, // UI'da gösterilen değer
            hexCode: this.rgbToHex(value.code) || this.getDefaultColorHex(value.name)
          };
        });
    }

    // Rating facet'i işle - CODE DEĞERİNİ AYNEN KULLAN
    const ratingFacet = facets.find(f => f.code === 'review_rating_star');
    if (ratingFacet?.values) {
      this.availableRatings = ratingFacet.values
        .filter((value: ApiFacetValue) => value.name && !value.name.includes('Puansız'))
        .map((value: ApiFacetValue) => {
          return {
            id: String(value.code || this.extractRatingValue(value.name)), // Backward compatibility
            code: value.code || value.name, // API'nin tam olarak beklediği değer - AYNEN KULLAN!
            name: value.name, // UI'da gösterilen değer
            count: Number(value.count) || 0,
            value: this.extractRatingValue(value.name)
          };
        })
        .filter((item: FilterOptionWithCode) => (item.value || 0) > 0);
    }

    // Brand facet'i işle - CODE DEĞERİNİ AYNEN KULLAN
    const brandFacet = facets.find(f => f.code === 'brand');
    if (brandFacet?.values) {
      this.brands = brandFacet.values
        .filter((value: ApiFacetValue) => value.code && value.name)
        .map((value: ApiFacetValue) => {
          return {
            id: value.code, // Brand için code değeri direkt kullanılıyor
            name: value.name,
            productCount: Number(value.count) || 0
          };
        });
    }
  }

  // Helper methods for code normalization
  private normalizeSizeCode(apiCode: string): string {
    // API code'unu UI ID'sine çevir (backward compatibility için)
    return apiCode.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private groupSimilarSizes(sizes: ApiFacetValue[]): ApiFacetValue[] {
    const groups: { [key: string]: ApiFacetValue[] } = {};
    const sizeGroups: { [key: string]: string[] } = {
      '0-6 Ay': ['0 Ay+', '0-24 Ay', '0-3 Ay', '0-6 Ay'],
      '1-2 Yaş': ['1 Yaş', '1-2 Yaş', '1-4 Yaş'],
      '12-18 Ay': ['12 Ay+', '12-18 Ay', '12-2 Yaş'],
      '18-24 Ay': ['17', '18', '18 Ay+', '18-24 Ay', '19'],
      '2-3 Yaş': ['2', '2 Yaş', '2-3 Yaş', '2-4 Yaş'],
      '3-4 Yaş': ['3', '3 Yaş', '3-4 Yaş'],
      '4-5 Yaş': ['4', '4 Yaş', '4-5 Yaş', '4 - 5 Yaş'],
      '17-19 Numara': ['17', '18', '19'],
      '20-22 Numara': ['20', '21', '22'],
      '23-25 Numara': ['23', '24', '25'],
      '26-28 Numara': ['26', '27', '28']
    };

    // Önce gruplara ayır
    sizes.forEach(size => {
      let grouped = false;
      
      for (const [groupName, groupItems] of Object.entries(sizeGroups)) {
        if (groupItems.includes(size.code)) {
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(size);
          grouped = true;
          break;
        }
      }
      
      // Gruplara dahil olmayan seçenekleri olduğu gibi tut
      if (!grouped) {
        groups[size.code] = [size];
      }
    });

    // Her gruptan en yüksek count'lu olanı seç ve count'ları topla
    const result: ApiFacetValue[] = [];
    
    for (const [groupName, groupItems] of Object.entries(groups)) {
      if (groupItems.length === 1) {
        // Tek eleman varsa olduğu gibi ekle
        result.push(groupItems[0]);
      } else {
        // Birden fazla eleman varsa en yüksek count'lu olanı seç
        const bestItem = groupItems.reduce((best, current) => 
          (current.count > best.count) ? current : best
        );
        
        // Count'ları topla
        const totalCount = groupItems.reduce((sum, item) => sum + item.count, 0);
        
        result.push({
          ...bestItem,
          count: totalCount,
          name: groupName // Grup adını kullan
        });
      }
    }

    return result;
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

  // Rating value extraction - null safe
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

  // FIXED: isSelected metodu - EXACT API code değerini kontrol et
  isSelected(filterType: keyof ProductFilters, value: string | number): boolean {
    if (!value) return false;
    
    const filterValue = this.currentFilters[filterType];
    if (Array.isArray(filterValue)) {
      // State'de API code değerleri tutulduğu için, direkt karşılaştır
      return filterValue.includes(value as never);
    }
    return filterValue === value;
  }

  // TEMPLATE HELPER METHODS - NULL SAFE ve API CODE odaklı
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

  // EVENT HANDLERS - FIXED: API CODE değerlerini kullan
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

    this.store.dispatch(ProductActions.setFilters({
      filters: { brandIds: newBrands.length > 0 ? newBrands : undefined }
    }));
  }

  // CRITICAL FIX: onSizeChange - API CODE değerini AYNEN kullan
  onSizeChange(sizeCode: string, event: Event) {
    if (!sizeCode) {
      console.warn('onSizeChange called with empty sizeCode');
      return;
    }
    
    const checked = (event.target as HTMLInputElement).checked;
    const currentSizes = this.currentFilters.sizes || [];
    
    // HTML checkbox value'dan da kontrol et
    const checkboxValue = (event.target as HTMLInputElement).value;
    
    // Eğer HTML'den gelen value yanlışsa, parametreyi düzelt
    let correctSizeCode = sizeCode;
    if (checkboxValue.includes('.') && !sizeCode.includes('.')) {
      // HTML'den nokta geliyorsa ama parametre virgül içeriyorsa
      correctSizeCode = checkboxValue.replace('.', ',');
    }
    
    let newSizes: string[];
    if (checked) {
      newSizes = [...currentSizes, correctSizeCode];
    } else {
      newSizes = currentSizes.filter(code => code !== correctSizeCode);
    }

    this.store.dispatch(ProductActions.setFilters({
      filters: { sizes: newSizes.length > 0 ? newSizes : undefined }
    }));
  }

  // CRITICAL FIX: onGenderChange - API CODE değerini AYNEN kullan
  onGenderChange(genderCode: string, event: Event) {
    if (!genderCode) return;
    
    const checked = (event.target as HTMLInputElement).checked;
    const currentGenders = this.currentFilters.genders || [];
    
    // HTML checkbox value'yu da kontrol et
    const checkboxValue = (event.target as HTMLInputElement).value;
    
    // Eğer HTML'den name geliyor ama API code'u bekliyorsa, düzelt
    let correctGenderCode = genderCode;
    if (checkboxValue === 'Kız Bebek') {
      correctGenderCode = 'GIRL';
    } else if (checkboxValue === 'Erkek Bebek') {
      correctGenderCode = 'MALE';
    } else if (checkboxValue === 'Unisex') {
      correctGenderCode = 'UNISEX';
    } else if (checkboxValue === 'Kadın') {
      correctGenderCode = 'FEMALE';
    }
    
    let newGenders: string[];
    if (checked) {
      newGenders = [...currentGenders, correctGenderCode];
    } else {
      newGenders = currentGenders.filter(code => code !== correctGenderCode);
    }

    this.store.dispatch(ProductActions.setFilters({
      filters: { genders: newGenders.length > 0 ? newGenders : undefined }
    }));
  }

  // CRITICAL FIX: onColorChange - API CODE değerini AYNEN kullan
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

  // CRITICAL FIX: onRatingChange - API CODE değerini kullan
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