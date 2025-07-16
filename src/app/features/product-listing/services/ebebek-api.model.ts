// src/app/features/product-listing/services/ebebek-api.model.ts

// E-bebek API Response Interfaces (gerçek API yanıtlarına göre güncellenmiş)
export interface EbebekApiResponse {
  products: EbebekProduct[];
  facets: EbebekFacet[];
  breadcrumbs: EbebekBreadcrumb[];
  pagination: EbebekPagination;
  sorts: EbebekSort[];
  freeTextSearch: string;
  currentQuery: EbebekQuery;
  keywordRedirectUrl?: string;
}

export interface EbebekProduct {
  description: string;
  code: string;
  name: string;
  categoryCodes: string[];
  bestSellerProduct: boolean;
  starProduct: boolean;
  minOrderQuantity: number;
  newProduct: boolean;
  freeShipment: boolean;
  categoryNames: string[];
  summary: string;
  discountedPrice: EbebekPrice;
  potentialPromotions: EbebekPromotion[];
  discountRate: number;
  brandName: string;
  hasOwnPackage: boolean;
  internetProduct: boolean;
  configuratorType: string;
  price: EbebekPrice;
  images: EbebekImage[];
  stock: EbebekStock;
  numberOfReviews: number;
  averageRating: number;
  baseOptions: EbebekOption[];
  variantOptions: EbebekOption[];
  url: string;
  categories: EbebekCategory[];
  baseProduct: string;
  isVideoActive: boolean;
  isArActive: boolean;
  vendor: string;
}

export interface EbebekPrice {
  currencyIso: string;
  value: number;
  priceType: string;
  formattedValue: string;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface EbebekImage {
  imageType: string;
  format: string;
  url: string;
  altText?: string;
  galleryIndex?: number;
  width?: number;
  height?: number;
}

export interface EbebekStock {
  stockLevelStatus: 'inStock' | 'outOfStock' | 'lowStock';
  stockLevel?: number;
  isValueRounded?: boolean;
}

export interface EbebekPromotion {
  code: string;
  title: string;
  description: string;
  promotionType: string;
  priority: number;
  startDate?: string;
  endDate?: string;
}

export interface EbebekOption {
  code: string;
  displayName: string;
  selected: boolean;
  url: string;
  variantOptionQualifiers?: EbebekOptionQualifier[];
}

export interface EbebekOptionQualifier {
  qualifier: string;
  name: string;
  value: string;
  image?: EbebekImage;
}

export interface EbebekCategory {
  code: string;
  name: string;
  url?: string;
  image?: EbebekImage;
}

export interface EbebekFacet {
  code: string;
  name: string;
  priority: number;
  category: boolean;
  multiSelect: boolean;
  visible: boolean;
  values: EbebekFacetValue[];
}

export interface EbebekFacetValue {
  code: string;
  name: string;
  count: number;
  selected: boolean;
  query: EbebekQuery;
}

export interface EbebekBreadcrumb {
  facetCode: string;
  facetName: string;
  facetValueCode: string;
  facetValueName: string;
  removeQuery: EbebekQuery;
  truncateQuery: EbebekQuery;
}

export interface EbebekPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalResults: number;
  sort: string;
}

export interface EbebekSort {
  code: string;
  name: string;
  selected: boolean;
}

export interface EbebekQuery {
  query: {
    value: string;
    url: string;
  };
  url: string;
}

// Product Mapper - E-bebek API'den gelen veriyi internal Product modeline çevirir
import { Product } from '../product/product.model';

export class EbebekProductMapper {
  static mapToProduct(ebebekProduct: EbebekProduct): Product {
    return {
      id: ebebekProduct.code,
      name: ebebekProduct.name,
      price: ebebekProduct.discountedPrice?.value || ebebekProduct.price?.value || 0,
      originalPrice: this.calculateOriginalPrice(ebebekProduct),
      description: ebebekProduct.summary || '',
      imageUrl: this.getMainImageUrl(ebebekProduct.images),
      categoryId: this.mapCategoryCode(ebebekProduct.categoryCodes?.[0] || ''),
      brandId: this.createBrandId(ebebekProduct.brandName),
      inStock: ebebekProduct.stock?.stockLevelStatus === 'inStock',
      rating: ebebekProduct.averageRating || 0,
      reviewCount: ebebekProduct.numberOfReviews || 0,
      colors: this.extractColors(ebebekProduct.variantOptions || []),
      sizes: this.extractSizes(ebebekProduct.variantOptions || []),
      gender: this.extractGender(ebebekProduct.categories || []),
      isOnSale: ebebekProduct.discountRate > 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static calculateOriginalPrice(ebebekProduct: EbebekProduct): number | undefined {
    if (ebebekProduct.discountRate > 0 && ebebekProduct.price && ebebekProduct.discountedPrice) {
      return ebebekProduct.price.value;
    }
    return undefined;
  }

  private static getMainImageUrl(images: EbebekImage[]): string {
    if (!images || images.length === 0) {
      return '';
    }

    // PRIMARY tipinde görsel ara
    const primaryImage = images.find(img => img.imageType === 'PRIMARY');
    if (primaryImage) {
      return this.buildFullImageUrl(primaryImage.url);
    }

    // GALLERY tipinde görsel ara
    const galleryImage = images.find(img => img.imageType === 'GALLERY');
    if (galleryImage) {
      return this.buildFullImageUrl(galleryImage.url);
    }

    // İlk görseli al
    if (images[0]) {
      return this.buildFullImageUrl(images[0].url);
    }

    return '';
  }

  private static buildFullImageUrl(url: string): string {
    if (!url) return '';
    
    // Eğer URL tam değilse, E-bebek'in CDN URL'ini ekle
    if (url.startsWith('/')) {
      return `https://cdn1.e-bebek.com${url}`;
    }
    
    // Eğer protokol eksikse ekle
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    
    return url;
  }

  private static mapCategoryCode(ebebekCategoryCode: string): string {
    // E-bebek kategori kodlarını internal kodlara çevir - UPDATED: Use actual e-bebek category codes
    const categoryMapping: { [key: string]: string } = {
      '2 Kapılı Dolaplar': '2-kapili-dolaplar',
      '3 Kapılı Dolap': '3-kapili-dolap',
      '3 Tekerlekli Bebek Bisikletleri': '3-tekerlekli-bebek-bisikletleri',
      '4 Tekerlekli Bebek Bisikletleri': '4-tekerlekli-bebek-bisikletleri',
      'Ahşap Beşik': 'ahsap-besik',
      'Ahşap Sandalye': 'ahsap-sandalye',
      'Ahşap Çocuk Masaları': 'ahsap-cocuk-masalari',
      'Akülü Araba': 'akulu-araba',
      'Alt Değiştirme Masaları': 'alt-degistirme-masalari',
      'Altın Kitaplar': 'altin-kitaplar',
      'Anne Baba Eğitim Kitapları': 'anne-baba-egitim-kitaplari',
      'Anne Bakım Ürünleri': 'anne-bakim-urunleri',
      'Anne Bebek Bakım Çantası': 'anne-bebek-bakim-cantasi',
      'Anne Yanı Beşiği': 'anne-yani-besigi',
      'Ara Katlı Park Yatak': 'ara-katli-park-yatak',
      'Ara Katsız Park Yatak': 'ara-katsiz-park-yatak',
      'Atıştırmalık Mama': 'atistirmalik-mama',
      'Bal Oyuncak': 'bal-oyuncak',
      'Baston Puset': 'baston-puset',
      'Bavul': 'bavul',
      'Bebek': 'bebek',
      'Bebek Ahşap Bloklar': 'bebek-ahsap-bloklar',
      'Bebek Aktivite Masası': 'bebek-aktivite-masasi',
      'Bebek Aktiviteli Oyuncak': 'bebek-aktiviteli-oyuncak',
      'Bebek Alt Açma Örtüsü': 'bebek-alt-acma-ortusu',
      'Bebek Alt Üst Takım': 'bebek-alt-ust-takim',
      'Bebek Alından Ateş Ölçer': 'bebek-alindan-ates-olcer',
      'Bebek Alıştırma Bardağı': 'bebek-alistirma-bardagi',
      'Bebek Alıştırma Külodu': 'bebek-alistirma-kulodu',
      'Bebek Araba Aynası': 'bebek-araba-aynasi',
      'Bebek Araba Güneşliği': 'bebek-araba-gunesligi',
      'Bebek Arabası': 'bebek-arabasi',
      'Bebek Arabası Minderi': 'bebek-arabasi-minderi',
      'Bebek Arabası Organizatörü': 'bebek-arabasi-organizatoru',
      'Bebek Arabası Tentesi': 'bebek-arabasi-tentesi',
      'Bebek Arabası Yağmurluğu': 'bebek-arabasi-yagmurlugu',
      'Bebek Astronot Tulum': 'bebek-astronot-tulum',
      'Bebek Ateş Düşürücü': 'bebek-ates-dusurucu',
      'Bebek Atletleri': 'bebek-atletleri',
      'Bebek Bakım Ürünleri': 'bebek-bakim-urunleri',
      'Bebek Banyo Köpüğü': 'bebek-banyo-kopugu',
      'Bebek Banyo Küvet Ayağı': 'bebek-banyo-kuvet-ayagi',
      'Bebek Banyo Küvet Filesi': 'bebek-banyo-kuvet-filesi',
      'Bebek Banyo Oyuncakları': 'bebek-banyo-oyuncaklari',
      'Bebek Banyo Süngeri': 'bebek-banyo-sungeri',
      'Bebek Banyo Termometresi': 'bebek-banyo-termometresi',
      'Bebek Banyo Ürünleri': 'bebek-banyo-urunleri',
      'Bebek Banyo Şapkası': 'bebek-banyo-sapkasi',
      'Bebek Bardak Uçları': 'bebek-bardak-uclari',
      'Bebek Basket Potası': 'bebek-basket-potasi',
      'Bebek Battaniyeleri': 'bebek-battaniyeleri',
      'Bebek Bere-Eldiven-Atkı': 'bebek-bere-eldiven-atki',
      'Bebek Bilek Çorap': 'bebek-bilek-corap'
    };

    return categoryMapping[ebebekCategoryCode] || ebebekCategoryCode;
  }

  private static createBrandId(brandName: string): string {
    if (!brandName) return '';
    
    return brandName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private static extractColors(variantOptions: EbebekOption[]): string[] {
    const colorOption = variantOptions.find(option => 
      option.code.toLowerCase().includes('color') || 
      option.code.toLowerCase().includes('renk') ||
      option.code.toLowerCase().includes('colour')
    );
    
    if (colorOption && colorOption.variantOptionQualifiers) {
      return colorOption.variantOptionQualifiers
        .map(qualifier => this.mapColorName(qualifier.value))
        .filter(color => color); // Boş değerleri filtrele
    }
    
    return [];
  }

  private static extractSizes(variantOptions: EbebekOption[]): string[] {
    const sizeOption = variantOptions.find(option => 
      option.code.toLowerCase().includes('size') || 
      option.code.toLowerCase().includes('beden') ||
      option.code.toLowerCase().includes('yas') ||
      option.code.toLowerCase().includes('ay') ||
      option.code.toLowerCase().includes('age')
    );
    
    if (sizeOption && sizeOption.variantOptionQualifiers) {
      return sizeOption.variantOptionQualifiers
        .map(qualifier => qualifier.value)
        .filter(size => size); // Boş değerleri filtrele
    }
    
    return [];
  }

  private static extractGender(categories: EbebekCategory[]): 'erkek' | 'kız' | 'unisex' {
    const categoryNames = categories
      .map(cat => cat.name.toLowerCase())
      .join(' ');
    
    if (categoryNames.includes('erkek') || 
        categoryNames.includes('boy') || 
        categoryNames.includes('oğlan')) {
      return 'erkek';
    } else if (categoryNames.includes('kız') || 
               categoryNames.includes('girl') || 
               categoryNames.includes('kızlar')) {
      return 'kız';
    }
    
    return 'unisex';
  }

  private static mapColorName(colorValue: string): string {
    if (!colorValue) return '';
    
    const colorMap: { [key: string]: string } = {
      // İngilizce renkler
      'red': 'kirmizi',
      'blue': 'mavi',
      'green': 'yesil',
      'yellow': 'sari',
      'pink': 'pembe',
      'purple': 'mor',
      'orange': 'turuncu',
      'brown': 'kahverengi',
      'gray': 'gri',
      'grey': 'gri',
      'black': 'siyah',
      'white': 'beyaz',
      'navy': 'lacivert',
      'turquoise': 'turkuaz',
      'cream': 'krem',
      'gold': 'gold',
      'silver': 'gumush',
      'beige': 'bej',
      'coral': 'mercan',
      'mint': 'nane',
      'lavender': 'lavanta',
      
      // Türkçe renkler
      'kırmızı': 'kirmizi',
      'mavi': 'mavi',
      'yeşil': 'yesil',
      'sarı': 'sari',
      'pembe': 'pembe',
      'mor': 'mor',
      'turuncu': 'turuncu',
      'kahverengi': 'kahverengi',
      'gri': 'gri',
      'siyah': 'siyah',
      'beyaz': 'beyaz',
      'lacivert': 'lacivert',
      'turkuaz': 'turkuaz',
      'krem': 'krem',
      'bej': 'bej',
      'mercan': 'mercan',
      'nane': 'nane',
      'lavanta': 'lavanta'
    };
    
    const lowerColor = colorValue.toLowerCase().trim();
    return colorMap[lowerColor] || lowerColor;
  }

  // Facet'lerden kategori bilgilerini çıkar
  static extractCategoriesFromFacets(facets: EbebekFacet[]): any[] {
    const categoryFacet = facets.find(facet => 
      facet.code === 'allCategories' || 
      facet.code === 'category' ||
      facet.category === true
    );
    
    if (categoryFacet && categoryFacet.values) {
      return categoryFacet.values.map(value => ({
        code: value.code,
        name: value.name,
        count: value.count
      }));
    }
    
    return [];
  }

  // Facet'lerden marka bilgilerini çıkar
  static extractBrandsFromFacets(facets: EbebekFacet[]): any[] {
    const brandFacet = facets.find(facet => 
      facet.code === 'brand' || 
      facet.code === 'brandName'
    );
    
    if (brandFacet && brandFacet.values) {
      return brandFacet.values.map(value => ({
        code: value.code,
        name: value.name,
        count: value.count
      }));
    }
    
    return [];
  }

  // Fiyat aralığı bilgilerini çıkar
  static extractPriceRanges(products: EbebekProduct[]): any[] {
    if (!products || products.length === 0) return [];
    
    const prices = products
      .map(p => p.discountedPrice?.value || p.price?.value || 0)
      .filter(price => price > 0)
      .sort((a, b) => a - b);
    
    if (prices.length === 0) return [];
    
    const min = prices[0];
    const max = prices[prices.length - 1];
    
    // Dinamik fiyat aralıkları oluştur
    const ranges = [
      { min: 0, max: 50, label: '0-50 TL' },
      { min: 50, max: 100, label: '50-100 TL' },
      { min: 100, max: 250, label: '100-250 TL' },
      { min: 250, max: 500, label: '250-500 TL' },
      { min: 500, max: 1000, label: '500-1000 TL' },
      { min: 1000, max: Math.ceil(max), label: '1000+ TL' }
    ];
    
    return ranges.filter(range => range.max <= max || range.min <= max);
  }

  // Renk seçeneklerini çıkar
  static extractColorOptions(products: EbebekProduct[]): any[] {
    const colorSet = new Set<string>();
    
    products.forEach(product => {
      const colors = this.extractColors(product.variantOptions || []);
      colors.forEach(color => colorSet.add(color));
    });
    
    return Array.from(colorSet).map(color => ({
      id: color,
      name: this.getColorDisplayName(color),
      hexCode: this.getColorHex(color)
    }));
  }

  // Beden seçeneklerini çıkar
  static extractSizeOptions(products: EbebekProduct[]): any[] {
    const sizeSet = new Set<string>();
    
    products.forEach(product => {
      const sizes = this.extractSizes(product.variantOptions || []);
      sizes.forEach(size => sizeSet.add(size));
    });
    
    return Array.from(sizeSet)
      .sort(this.sortSizes)
      .map(size => ({
        id: size,
        name: size,
        count: this.countProductsWithSize(products, size)
      }));
  }

  private static getColorDisplayName(colorId: string): string {
    const displayNames: { [key: string]: string } = {
      'kirmizi': 'Kırmızı',
      'mavi': 'Mavi',
      'yesil': 'Yeşil',
      'sari': 'Sarı',
      'pembe': 'Pembe',
      'mor': 'Mor',
      'turuncu': 'Turuncu',
      'kahverengi': 'Kahverengi',
      'gri': 'Gri',
      'siyah': 'Siyah',
      'beyaz': 'Beyaz',
      'lacivert': 'Lacivert',
      'turkuaz': 'Turkuaz',
      'krem': 'Krem',
      'bej': 'Bej',
      'mercan': 'Mercan',
      'nane': 'Nane',
      'lavanta': 'Lavanta',
      'gold': 'Gold',
      'gumush': 'Gümüş'
    };
    
    return displayNames[colorId] || colorId.charAt(0).toUpperCase() + colorId.slice(1);
  }

  private static getColorHex(colorId: string): string {
    const colorHexMap: { [key: string]: string } = {
      'kirmizi': '#e74c3c',
      'mavi': '#3498db',
      'yesil': '#27ae60',
      'sari': '#f1c40f',
      'pembe': '#e91e63',
      'mor': '#9b59b6',
      'turuncu': '#e67e22',
      'kahverengi': '#8d6e63',
      'gri': '#95a5a6',
      'siyah': '#2c3e50',
      'beyaz': '#ecf0f1',
      'lacivert': '#2c3e50',
      'turkuaz': '#1abc9c',
      'krem': '#f5f5dc',
      'bej': '#f5f5dc',
      'mercan': '#ff7f50',
      'nane': '#98fb98',
      'lavanta': '#e6e6fa',
      'gold': '#ffd700',
      'gumush': '#c0c0c0'
    };
    
    return colorHexMap[colorId] || '#cccccc';
  }

  private static sortSizes(a: string, b: string): number {
    // Yaş gruplarını sırala
    const ageOrder = ['0-3-ay', '3-6-ay', '6-12-ay', '12-18-ay', '18-24-ay', '2-3-yas'];
    const aIndex = ageOrder.indexOf(a);
    const bIndex = ageOrder.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    }
    
    // Alfabetik sıralama
    return a.localeCompare(b, 'tr');
  }

  private static countProductsWithSize(products: EbebekProduct[], size: string): number {
    return products.filter(product => 
      this.extractSizes(product.variantOptions || []).includes(size)
    ).length;
  }

  // Error handling için mapper
  static createErrorProduct(error: any): Product {
    return {
      id: 'error',
      name: 'Ürün yüklenemedi',
      price: 0,
      description: 'Bu ürün şu anda yüklenemiyor.',
      imageUrl: '',
      categoryId: '',
      brandId: '',
      inStock: false,
      rating: 0,
      reviewCount: 0,
      isOnSale: false
    };
  }

  // Debug için
  static logProductMappingDetails(ebebekProduct: EbebekProduct): void {
    console.log('Product mapping details:', {
      code: ebebekProduct.code,
      name: ebebekProduct.name,
      price: ebebekProduct.price?.value,
      discountedPrice: ebebekProduct.discountedPrice?.value,
      discountRate: ebebekProduct.discountRate,
      stock: ebebekProduct.stock?.stockLevelStatus,
      images: ebebekProduct.images?.length || 0,
      variantOptions: ebebekProduct.variantOptions?.length || 0,
      categories: ebebekProduct.categories?.map(c => c.name) || []
    });
  }
}