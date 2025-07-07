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
  updateFacetsFromApiResponse(facets: any[]) {
    throw new Error('Method not implemented.');
  }
  private destroy$ = new Subject<void>();

  // Observables
  filters$: Observable<ProductFilters>;
  hasActiveFilters$: Observable<boolean>;

  // Filter data - API'den gelen kategoriler

  categories: Category[] = [
    { id: '7062', name: '2 Kapılı Dolaplar' },
    { id: '20002', name: '2 Numara' },
    { id: '7061', name: '3 Kapılı Dolap' },
    { id: '20003', name: '3 Numara' },
    { id: '4563', name: '3 Tekerlekli Bebek Bisikletleri' },
    { id: '20004', name: '4 Numara' },
    { id: '20005', name: '5 Numara' },
    { id: '20006', name: '6 Numara' },
    { id: '20007', name: '7 Numara' },
    { id: '7051', name: 'Ahşap Beşik' },
    { id: '7131', name: 'Ahşap Sandalye' },
    { id: '7121', name: 'Ahşap Çocuk Masaları' },
    { id: '4555', name: 'Akülü Araba' },
    { id: '4545', name: 'Anne Baba Eğitim Kitapları' },
    { id: '10117', name: 'Ara Katlı Park Yatak' },
    { id: '4535', name: 'Atıştırmalık Mama' },
    { id: '4464', name: 'Bavul' },
    { id: '4528', name: 'Bebek Aktiviteli Oyuncak' },
    { id: '4525', name: 'Bebek Alıştırma Bardağı' },
    { id: '4450', name: 'Bebek Blokları' },
    { id: '4438', name: 'Bebek Boyama Kitabı' },
    { id: '4352', name: 'Bebek Gelişim Kitabı' },
    { id: '3730', name: 'Bebek Kitapları' },
    { id: '4598', name: 'Bebek Mama Taşıma Kabı' },
    { id: '4263', name: 'Bebek Masal Kitabı' },
    { id: '4108', name: 'Bebek Tabak, Çatal, Kaşık' },
    { id: '4025', name: 'Biberon' },
    { id: '7074', name: 'Büyüyen Bebek Karyolaları' },
    { id: '10115', name: 'Islak Mendil' },
    { id: '3877', name: 'Kavanoz Mama' },
    { id: '3882', name: 'Kaşık Maması' },
    { id: '3875', name: 'Keçi Sütü Maması' },
    { id: '10104', name: 'Külot Bebek Bezi' },
    { id: '7072', name: 'Montessori Karyolalar' },
    { id: '3847', name: 'Organik Bebek Yiyecekleri' },
    { id: '7152', name: 'Oyun Çadırları' },
    { id: '3837', name: 'Oyuncak Araba Seti' },
    { id: '3801', name: 'Sterilizatör' },
    { id: '3796', name: 'Süt Saklama Poşeti ve Kabı' },
    { id: '3731', name: 'Zeka Eğitim Seti Kitabı' }
  ];

  // API'den gelen markalar - güncellenmiş liste
  brands: Brand[] = [
    { id: '7607', name: '59S', productCount: 3 },
    { id: '7645', name: 'Adeda Yayıncılık', productCount: 4 },
    { id: '1037', name: 'Agu Baby', productCount: 1 },
    { id: '9970', name: 'Agubugu Baby', productCount: 1 },
    { id: '1998', name: 'Altın Kitaplar', productCount: 51 },
    { id: '1805', name: 'Aqara', productCount: 1 },
    { id: '689', name: 'Baby Memory Prints', productCount: 2 },
    { id: '1536', name: 'Baby Turco', productCount: 4 },
    { id: '798', name: 'BabyBjörn', productCount: 15 },
    { id: '9974', name: 'Babycim', productCount: 1 },
    { id: '459', name: 'Babyjem', productCount: 27 },
    { id: '1162', name: 'Babywhen', productCount: 4 },
    { id: '2010', name: 'Bal Oyuncak', productCount: 1 },
    { id: '1179', name: 'Bamm Bamm', productCount: 2 },
    { id: '2526', name: 'Barbie', productCount: 10 },
    { id: '6251', name: 'Bebekonfor', productCount: 13 },
    { id: '3624', name: 'BetaKids', productCount: 8 },
    { id: '1619', name: 'Bingo', productCount: 1 },
    { id: '1932', name: 'Birlik Oyuncak', productCount: 4 },
    { id: '1354', name: 'Bondigo', productCount: 2 },
    { id: '1629', name: 'Brita', productCount: 4 },
    { id: '513', name: 'Canbebe', productCount: 6 },
    { id: '185', name: 'Chicco', productCount: 2 },
    { id: '1233', name: 'Chilai Home', productCount: 4 },
    { id: '1688', name: 'Childgen', productCount: 7 },
    { id: '1642', name: 'Circle Toys', productCount: 10 },
    { id: '3022', name: 'Clementoni', productCount: 6 },
    { id: '451', name: 'Dalin', productCount: 2 },
    { id: '1373', name: 'Dede Oyuncak', productCount: 19 },
    { id: '7544', name: 'Deerma', productCount: 2 },
    { id: '1368', name: 'Dolu', productCount: 16 },
    { id: '2015', name: 'Dolu Nuve', productCount: 1 },
    { id: '6010', name: 'Doğan Çocuk', productCount: 73 },
    { id: '1257', name: 'Durubox', productCount: 2 },
    { id: '1067', name: 'Eday', productCount: 2 },
    { id: '7719', name: 'Epsilon Yayınevi', productCount: 10 },
    { id: '9956', name: 'Eyüp Sabri Tuncer', productCount: 4 },
    { id: '270', name: 'Fisher-Price', productCount: 6 },
    { id: '218', name: 'Fodi Safe', productCount: 1 },
    { id: '453', name: 'Galt', productCount: 1 },
    { id: '1694', name: 'Green Mood', productCount: 3 },
    { id: '1223', name: 'Hametol', productCount: 1 },
    { id: '1808', name: 'Hey Clay', productCount: 7 },
    { id: '9937', name: 'Holle', productCount: 3 },
    { id: '7670', name: 'Holmen', productCount: 7 },
    { id: '4402', name: 'Homedius', productCount: 2 },
    { id: '7693', name: 'Hops', productCount: 1 },
    { id: '2517', name: 'Hot Wheels', productCount: 2 },
    { id: '1741', name: 'IMEX', productCount: 1 },
    { id: '1033', name: 'INCIA', productCount: 4 },
    { id: '1063', name: 'Ideal Baby', productCount: 5 },
    { id: '1578', name: 'İndigo Çocuk', productCount: 49 },
    { id: '9939', name: 'İş Kültür Yayınları', productCount: 79 },
    { id: '2509', name: 'Joie', productCount: 1 },
    { id: '1626', name: 'Kayyum', productCount: 2 },
    { id: '259', name: 'Kraft', productCount: 2 },
    { id: '1377', name: 'LEGO', productCount: 3 },
    { id: '1300', name: 'LULUBERE', productCount: 1 },
    { id: '827', name: 'Let\'s Be Child', productCount: 6 },
    { id: '1771', name: 'Ludita', productCount: 5 },
    { id: '1528', name: 'Mamajoo', productCount: 1 },
    { id: '1650', name: 'Mamma Baby Food', productCount: 10 },
    { id: '1011', name: 'Masalperest', productCount: 27 },
    { id: '9959', name: 'Materni', productCount: 3 },
    { id: '1806', name: 'Meross', productCount: 1 },
    { id: '1649', name: 'Milkin', productCount: 1 },
    { id: '7738', name: 'Minera', productCount: 14 },
    { id: '1231', name: 'Minikoioi', productCount: 1 },
    { id: '3198', name: 'Miny Baby', productCount: 6 },
    { id: '821', name: 'Mochi', productCount: 2 },
    { id: '7623', name: 'Molie', productCount: 2 },
    { id: '6291', name: 'Monamoms', productCount: 2 },
    { id: '1493', name: 'Munchkin', productCount: 6 },
    { id: '9949', name: 'Nemesis', productCount: 11 },
    { id: '1329', name: 'Net Çocuk Yayınları', productCount: 2 },
    { id: '6077', name: 'Nuf Kozmetik', productCount: 7 },
    { id: '348', name: 'OKBaby', productCount: 9 },
    { id: '1017', name: 'OTS Organik', productCount: 4 },
    { id: '5978', name: 'OiOi', productCount: 20 },
    { id: '1005', name: 'Orzax', productCount: 3 },
    { id: '1240', name: 'Pandish', productCount: 6 },
    { id: '1007', name: 'Peta Kitap', productCount: 22 },
    { id: '204', name: 'Pilsan Oyuncak', productCount: 9 },
    { id: '1724', name: 'Pol\'s', productCount: 11 },
    { id: '4709', name: 'Pratico', productCount: 6 },
    { id: '430', name: 'Prima', productCount: 5 },
    { id: '1254', name: 'Pure Wipes', productCount: 1 },
    { id: '7702', name: 'SafeMom', productCount: 4 },
    { id: '4707', name: 'Setay Mobilya', productCount: 6 },
    { id: '2006', name: 'Sincap Kitap', productCount: 1 },
    { id: '1746', name: 'Sisbro', productCount: 1 },
    { id: '831', name: 'Siveno', productCount: 2 },
    { id: '4648', name: 'Sleepy', productCount: 21 },
    { id: '1506', name: 'Smarteach', productCount: 31 },
    { id: '2991', name: 'Solo', productCount: 1 },
    { id: '1971', name: 'Sterilisa', productCount: 2 },
    { id: '1380', name: 'Trunki', productCount: 3 },
    { id: '680', name: 'Uni Baby', productCount: 6 },
    { id: '1680', name: 'Uçan Fil Yayınevi', productCount: 3 },
    { id: '1076', name: 'Valens', productCount: 1 },
    { id: '1660', name: 'Vepa', productCount: 3 },
    { id: '3021', name: 'Wee Baby', productCount: 6 },
    { id: '1598', name: 'Wefood', productCount: 3 },
    { id: '1171', name: 'Weleda', productCount: 13 },
    { id: '1927', name: 'Whome', productCount: 1 },
    { id: '7688', name: 'Xiaomi', productCount: 2 },
    { id: '1928', name: 'Yapı Kredi Yayınları', productCount: 42 },
    { id: '1749', name: 'Yeti Kitap', productCount: 9 },
    { id: '1751', name: 'Yomio Drops', productCount: 4 },
    { id: '1804', name: 'Yükselen Zeka', productCount: 18 },
    { id: '4708', name: 'Zooturak', productCount: 6 },
    { id: '1937', name: 'baby me', productCount: 1 },
    { id: '3058', name: 'baby mom', productCount: 1 },
    { id: '1994', name: 'baby plus', productCount: 2 },
    { id: '3008', name: 'baby toys', productCount: 4 },
    { id: '4403', name: 'brush-baby', productCount: 2 },
    { id: '1514', name: 'ebebek', productCount: 1 },
    { id: '1708', name: 'ebebek/Can Yayınları', productCount: 1 },
    { id: '1981', name: 'fufizu', productCount: 3 },
    { id: '1770', name: 'momwell', productCount: 7 },
    { id: '1980', name: 'snugpuff', productCount: 3 },
    { id: '1677', name: 'İlhan Sarı', productCount: 2 }
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