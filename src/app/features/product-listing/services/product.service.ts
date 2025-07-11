// src/app/features/product-listing/services/product.service.ts - Fixed Filter Data Flow

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

import { Product, ProductFilters } from '../product/product.model';
import { environment } from '../../../../environments/environment';

// E-bebek API Types
export interface EbebekFacet {
  code: string;
  name: string;
  multiSelect: boolean;
  visible: boolean;
  values: EbebekFacetValue[];
}

export interface EbebekFacetValue {
  code: string;
  name: string;
  count: number;
  selected: boolean;
}

export interface EbebekProduct {
  code: string;
  name: string;
  categoryCodes: string[];
  categoryNames: string[];
  categories?: any[];
  summary: string;
  description?: string;
  price: {
    value: number;
    currencyIso: string;
    formattedValue: string;
  };
  discountedPrice?: {
    value: number;
    currencyIso: string;
    formattedValue: string;
  };
  discountRate: number;
  brandName: string;
  images: any[];
  stock: {
    stockLevelStatus: 'inStock' | 'outOfStock' | 'lowStock';
    stockLevel?: number;
  };
  averageRating: number;
  numberOfReviews: number;
  variantOptions?: any[];
  baseOptions?: any[];
}

export interface EbebekApiResponse {
  products: EbebekProduct[];
  facets: EbebekFacet[];
  breadcrumbs: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalResults: number;
  };
}

// Interface tanımlamaları
export interface ProductQueryParams {
  filters?: ProductFilters;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface ProductResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  facets?: any[];
  breadcrumbs?: any[];
  availableColors?: any[];
  availableSizes?: any[];
  availableGenders?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = environment.ebebekApi?.baseUrl || 'https://www.e-bebek.com/apps/services/rest/ebebek';
  private readonly requestTimeout = environment.ebebekApi?.timeout || 30000;

  // E-bebek kategori mapping
  private readonly categoryMapping: { [key: string]: string } = {
    'strollers': '0002',
    'food': '0003',
    'toys': '0004',
    'feeding': '0005',
    'safety': '0006',
    'care': '0007',
    'car-seats': '0008',
    'diapers': '0009',
    'bath': '0010',
    'sleep': '0011'
  };

  constructor(private http: HttpClient) {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.baseUrl) {
      throw new Error('E-bebek API base URL is not configured');
    }

    if (environment.features?.enableLogging) {
      console.log('ProductService configured with:', {
        baseUrl: this.baseUrl,
        timeout: this.requestTimeout
      });
    }
  }

  getProducts(params: ProductQueryParams = {}): Observable<ProductResponse> {
    // Debug: Log received parameters
    console.log('getProducts received:', params);
    console.log('getProducts filters:', params.filters);
    
    const url = `${this.baseUrl}/products/search`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.getHeaders();

    console.log('Final HTTP params:', httpParams.toString());

    return this.http.get<EbebekApiResponse>(url, { params: httpParams, headers })
      .pipe(
        timeout(this.requestTimeout),
        map((response: EbebekApiResponse) => {
          console.log('[API RESPONSE] /products/search', response);
          return this.mapApiResponse(response, params);
        }),
        catchError((error: any) => {
          this.logError('getProducts', error, params);
          return throwError(() => new Error(this.getErrorMessage(error)));
        })
      );
  }

  private buildHttpParams(params: ProductQueryParams): HttpParams {
    console.log('buildHttpParams called with:', params);
    
    let httpParams = new HttpParams();

    // Sayfalama
    const page = params.page || 1;
    const pageSize = params.pageSize || 12;
    httpParams = httpParams.set('pageSize', pageSize.toString());
    httpParams = httpParams.set('currentPage', (page - 1).toString());

    // Dil ve para birimi
    httpParams = httpParams.set('lang', 'tr');
    httpParams = httpParams.set('curr', 'TRY');

    // Geliştirilmiş alan seçimi
    const fields = this.getEnhancedFieldsParameter();
    httpParams = httpParams.set('fields', fields);

    // Query oluşturma - BURADA SORUN VAR!
    const query = this.buildQuery(params.filters, params.sortBy);
    httpParams = httpParams.set('query', query);

    console.log('Built HTTP params:', httpParams.toString());
    return httpParams;
  }

  // KRITIK FİX: buildQuery fonksiyonu - API CODE değerlerini doğru işle
  private buildQuery(filters?: ProductFilters, sortBy?: string): string {
  console.log('[PRODUCT SERVICE] Building query with filters:', filters);
  console.log('[PRODUCT SERVICE] Filter type:', typeof filters);
  console.log('[PRODUCT SERVICE] Filter keys:', filters ? Object.keys(filters) : 'no filters');
  
  let queryParts: string[] = [];

  // Sıralama (her zaman ilk sırada)
  const sort = this.mapSortBy(sortBy);
  queryParts.push(`:${sort}`);

  // Eğer filters undefined, null veya empty object ise
  if (!filters || Object.keys(filters).length === 0) {
    console.log('[PRODUCT SERVICE] No filters provided, returning basic query');
    const basicQuery = queryParts.join(':');
    console.log('[PRODUCT SERVICE] Basic query:', basicQuery);
    return basicQuery;
  }

  // KATEGORI FİLTRESİ
  if (filters.categoryId) {
    console.log('[PRODUCT SERVICE] Adding category filter:', filters.categoryId);
    const ebebekCategoryCode = this.categoryMapping[filters.categoryId];
    if (ebebekCategoryCode) {
      queryParts.push(`allCategories:${ebebekCategoryCode}`);
      console.log('[PRODUCT SERVICE] Category query part added:', `allCategories:${ebebekCategoryCode}`);
    }
  }

  // MARKA FİLTRESİ - E-BEBEK API FORMAT: brand:id1:id2:id3 (birleşik)
  if (filters.brandIds && Array.isArray(filters.brandIds) && filters.brandIds.length > 0) {
    console.log('[PRODUCT SERVICE] Adding brand filter:', filters.brandIds);
    
    const validBrandIds = filters.brandIds
      .filter(brandId => brandId && brandId.trim())
      .map(brandId => brandId.trim());
    
    if (validBrandIds.length > 0) {
      // CRITICAL FIX: Birden fazla brand için tek parametre kullan
      const brandsQuery = validBrandIds.join(':');
      queryParts.push(`brand:${brandsQuery}`);
      console.log('[PRODUCT SERVICE] Combined brand query part added:', `brand:${brandsQuery}`);
    }
  }

  // CRITICAL FIX: BEDEN FİLTRESİ - Tek size parametresi ile doğru format
  if (filters.sizes && Array.isArray(filters.sizes) && filters.sizes.length > 0) {
    console.log('[PRODUCT SERVICE] Adding size filter with EXACT API CODES:', filters.sizes);
    
    const validSizes = filters.sizes
      .filter(size => size && size.trim())
      .map(size => size.trim());
    
    if (validSizes.length > 0) {
      // CRITICAL FIX: Birden fazla size için tek parametre kullan
      // E-bebek API format: size:"2-3 Yaş":"1-2 Yaş" (birleşik)
      const sizesQuery = validSizes
        .map(sizeCode => `"${sizeCode}"`)
        .join(':');
      
      queryParts.push(`size:${sizesQuery}`);
      console.log('[PRODUCT SERVICE] Combined size query part added:', `size:${sizesQuery}`);
      console.log('[PRODUCT SERVICE] Individual sizes used:', validSizes);
    }
  }

  // CRITICAL FIX: CİNSİYET FİLTRESİ - Birleşik format
  if (filters.genders && Array.isArray(filters.genders) && filters.genders.length > 0) {
    console.log('[PRODUCT SERVICE] Adding gender filter with EXACT API CODES:', filters.genders);
    
    const validGenders = filters.genders
      .filter(gender => gender && gender.trim())
      .map(gender => gender.trim());
    
    if (validGenders.length > 0) {
      // CRITICAL FIX: Birden fazla gender için tek parametre kullan
      const gendersQuery = validGenders
        .map(genderCode => `"${genderCode}"`)
        .join(':');
      
      queryParts.push(`gender:${gendersQuery}`);
      console.log('[PRODUCT SERVICE] Combined gender query part added:', `gender:${gendersQuery}`);
      console.log('[PRODUCT SERVICE] Individual genders used:', validGenders);
    }
  }

  // CRITICAL FIX: RENK FİLTRESİ - Birleşik format
  if (filters.colors && Array.isArray(filters.colors) && filters.colors.length > 0) {
    console.log('[PRODUCT SERVICE] Adding color filter with EXACT API CODES:', filters.colors);
    
    const validColors = filters.colors
      .filter(color => color && color.trim())
      .map(color => color.trim());
    
    if (validColors.length > 0) {
      // CRITICAL FIX: Birden fazla color için tek parametre kullan
      const colorsQuery = validColors
        .map(colorCode => `"${colorCode}"`)
        .join(':');
      
      queryParts.push(`color:${colorsQuery}`);
      console.log('[PRODUCT SERVICE] Combined color query part added:', `color:${colorsQuery}`);
      console.log('[PRODUCT SERVICE] Individual colors used:', validColors);
    }
  }

  // DEĞERLENDİRME FİLTRESİ - Birleşik format
  if (filters.ratings && Array.isArray(filters.ratings) && filters.ratings.length > 0) {
    console.log('[PRODUCT SERVICE] Adding rating filter:', filters.ratings);
    
    const validRatings = filters.ratings
      .filter(rating => rating && rating > 0)
      .map(rating => `"${rating}* ve üzeri"`);
    
    if (validRatings.length > 0) {
      // CRITICAL FIX: Birden fazla rating için tek parametre kullan
      const ratingsQuery = validRatings.join(':');
      queryParts.push(`review_rating_star:${ratingsQuery}`);
      console.log('[PRODUCT SERVICE] Combined rating query part added:', `review_rating_star:${ratingsQuery}`);
    }
  }

  // ARAMA TERİMİ
  if (filters.searchTerm && filters.searchTerm.trim()) {
    console.log('[PRODUCT SERVICE] Adding search term:', filters.searchTerm);
    const searchPart = `text:${encodeURIComponent(filters.searchTerm.trim())}`;
    queryParts.push(searchPart);
    console.log('[PRODUCT SERVICE] Search query part added:', searchPart);
  }

  // FİYAT ARALIĞI - E-BEBEK API FORMAT: price:[min TO max]
  if (filters.priceRange && filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
    console.log('[PRODUCT SERVICE] Adding price range:', filters.priceRange);
    const pricePart = `price:[${filters.priceRange.min} TO ${filters.priceRange.max}]`;
    queryParts.push(pricePart);
    console.log('[PRODUCT SERVICE] Price query part added:', pricePart);
  }

  // STOK DURUMU
  if (filters.inStockOnly === true) {
    console.log('[PRODUCT SERVICE] Adding stock filter: inStock only');
    queryParts.push('stockLevelStatus:inStock');
  }

  // İNDİRİMLİ ÜRÜNLER
  if (filters.onSaleOnly === true) {
    console.log('[PRODUCT SERVICE] Adding sale filter: on sale only');
    queryParts.push('discountRate:[1 TO *]');
  }

  const finalQuery = queryParts.join(':');
  console.log('[PRODUCT SERVICE] ===== FINAL QUERY CONSTRUCTION =====');
  console.log('[PRODUCT SERVICE] Query parts:', queryParts);
  console.log('[PRODUCT SERVICE] Final built query:', finalQuery);
  console.log('[PRODUCT SERVICE] =========================================');

  return finalQuery;
  }

  // HELPER: Tırnak gereksinimi kontrolü
  private needsQuotes(value: string): boolean {
    // Boşluk, virgül, nokta veya özel karakter içeriyorsa tırnak gerekli
    return /[\s,.\-;:]/.test(value);
  }

  // Yardımcı fonksiyon - Beden değerlerini formatla
  private formatSizeValue(size: string): string {
    // Eğer boşluk içeriyorsa tırnak içine al
    if (size.includes(' ') || size.includes('-')) {
      return `"${size}"`;
    }
    return size;
    }

  private mapSortBy(sortBy?: string): string {
      const sortMap: { [key: string]: string } = {
        'name': 'name-asc',
        'price-asc': 'price-asc',
        'price-desc': 'price-desc',
        'rating': 'rating-desc',
        'newest': 'creationtime-desc',
        'popularity': 'relevance'
      };

      return sortMap[sortBy || 'relevance'] || 'relevance';
    }

  private getEnhancedFieldsParameter(): string {
    return [
      'products(',
      'code,name,categoryCodes,bestSellerProduct,starProduct,minOrderQuantity',
      ',newProduct,freeShipment,categoryNames,summary,description,discountedPrice(FULL)',
      ',potentialPromotions(FULL),discountRate,brandName,hasOwnPackage',
      ',internetProduct,configuratorType,price(FULL),images(DEFAULT)',
      ',stock(FULL),numberOfReviews,averageRating,baseOptions(FULL)',
      ',variantOptions(FULL),url,categories(FULL),baseProduct',
      ',isVideoActive,isArActive,vendor',
      ')',
      ',facets(FULL),breadcrumbs,pagination(DEFAULT),sorts(DEFAULT)',
      ',freeTextSearch,currentQuery,keywordRedirectUrl'
    ].join('');
    }

  private getHeaders(): HttpHeaders {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'platform': 'web',
      'Referer': 'https://www.e-bebek.com/',
      'sec-ch-ua-platform': '"macOS"',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    };

    return new HttpHeaders(headers);
  }

  private mapApiResponse(response: EbebekApiResponse, params: ProductQueryParams): ProductResponse {
    if (!response) {
      throw new Error('Invalid API response');
    }

    const products = (response.products || []).map(ebebekProduct => 
      EbebekProductMapper.mapToProduct(ebebekProduct, response.facets)
    );

    const result: ProductResponse = {
      products,
      totalCount: response.pagination?.totalResults || 0,
      currentPage: (response.pagination?.currentPage || 0) + 1,
      pageSize: response.pagination?.pageSize || 12,
      facets: response.facets,
      breadcrumbs: response.breadcrumbs,
      availableColors: this.extractAvailableColors(response.facets),
      availableSizes: this.extractAvailableSizes(response.facets),
      availableGenders: this.extractAvailableGenders(response.facets)
    };

    console.log('Mapped API response:', {
      productsCount: result.products.length,
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      facetsCount: response.facets?.length || 0
    });

    return result;
  }

  private extractAvailableColors(facets?: EbebekFacet[]): any[] {
    if (!facets) return [];
    
    const colorFacet = facets.find(f => f.code === 'color');
    if (!colorFacet?.values) return [];

    return colorFacet.values.map(value => ({
      id: this.mapRgbToColorId(value.code),
      name: value.name,
      rgbCode: value.code,
      count: value.count
    }));
  }

  private extractAvailableSizes(facets?: EbebekFacet[]): any[] {
    if (!facets) return [];
    
    const sizeFacet = facets.find(f => f.code === 'size');
    if (!sizeFacet || !sizeFacet.values) return [];

    return sizeFacet.values.map(value => ({
      id: value.code,
      name: value.name,
      count: value.count
    }));
  }

  private extractAvailableGenders(facets?: EbebekFacet[]): any[] {
    if (!facets) return [];
    
    const genderFacet = facets.find(f => f.code === 'gender');
    if (!genderFacet?.values) return [];

    return genderFacet.values.map(value => ({
      id: this.mapGenderApiToInternal(value.code),
      name: value.name,
      apiCode: value.code,
      count: value.count
    }));
  }

  private mapRgbToColorId(rgbCode: string): string {
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

  private mapGenderApiToInternal(apiCode: string): string {
    const genderMap: { [key: string]: string } = {
      'Erkek Bebek': 'erkek',
      'Kız Bebek': 'kız',
      'Unisex': 'unisex',
      'Kadın': 'unisex'
    };
    return genderMap[apiCode] || 'unisex';
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'API yetkilendirme hatası. Lütfen bağlantınızı kontrol ediniz.';
    } else if (error.status === 403) {
      return 'Bu işlem için yetki gerekiyor.';
    } else if (error.status === 404) {
      return 'Aradığınız ürün bulunamadı.';
    } else if (error.status === 429) {
      return 'Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyiniz.';
    } else if (error.status >= 500) {
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.';
    } else if (error.name === 'TimeoutError') {
      return `İstek zaman aşımına uğradı (${this.requestTimeout}ms). Lütfen tekrar deneyiniz.`;
    } else if (!navigator.onLine) {
      return 'İnternet bağlantınızı kontrol ediniz.';
    } else {
      return 'Bir hata oluştu. Lütfen tekrar deneyiniz.';
    }
  }

  private logError(method: string, error: any, params?: any): void {
    console.error(`ProductService.${method} error:`, {
      error,
      params,
      timestamp: new Date().toISOString()
    });
  }

  // Diğer metodlar...
  getProductById(id: string): Observable<Product> {
    const url = `${this.baseUrl}/products/${id}`;
    const headers = this.getHeaders();

    return this.http.get<EbebekProduct>(url, { headers })
      .pipe(
        timeout(this.requestTimeout),
        map(ebebekProduct => EbebekProductMapper.mapToProduct(ebebekProduct)),
        catchError(error => {
          this.logError('getProductById', error, { id });
          return throwError(() => new Error(this.getErrorMessage(error)));
        })
      );
  }

  searchProducts(searchTerm: string, params: ProductQueryParams = {}): Observable<ProductResponse> {
    const searchParams = {
      ...params,
      filters: {
        ...params.filters,
        searchTerm
      }
    };

    return this.getProducts(searchParams);
  }

  getCategories(): Observable<any[]> {
    const url = `${this.baseUrl}/categories`;
    const headers = this.getHeaders();

    return this.http.get<any>(url, { headers })
      .pipe(
        timeout(this.requestTimeout),
        catchError(error => {
          this.logError('getCategories', error);
          return throwError(() => new Error('Kategoriler yüklenirken hata oluştu.'));
        })
      );
  }

  getBrands(): Observable<any[]> {
    const url = `${this.baseUrl}/brands`;
    const headers = this.getHeaders();

    return this.http.get<any>(url, { headers })
      .pipe(
        timeout(this.requestTimeout),
        catchError(error => {
          this.logError('getBrands', error);
          return throwError(() => new Error('Markalar yüklenirken hata oluştu.'));
        })
      );
  }
}

// Güncellenmiş EbebekProductMapper
export class EbebekProductMapper {
  static mapToProduct(ebebekProduct: EbebekProduct, facets?: EbebekFacet[]): Product {
    return {
      id: ebebekProduct.code,
      name: ebebekProduct.name,
      price: ebebekProduct.price.value,
      originalPrice: ebebekProduct.discountedPrice?.value && 
                     ebebekProduct.discountedPrice.value !== ebebekProduct.price.value 
        ? ebebekProduct.price.value 
        : undefined,
      description: ebebekProduct.summary || ebebekProduct.description || '',
      imageUrl: this.getMainImageUrl(ebebekProduct.images || []),
      categoryId: ebebekProduct.categoryCodes?.[0] || '',
      brandId: this.createBrandId(ebebekProduct.brandName),
      inStock: ebebekProduct.stock.stockLevelStatus === 'inStock',
      rating: ebebekProduct.averageRating,
      reviewCount: ebebekProduct.numberOfReviews,
      colors: this.extractColors(ebebekProduct.variantOptions || []) || 
              this.extractColorsFromFacets(facets),
      sizes: this.extractSizes(ebebekProduct.variantOptions || []) || 
             this.extractSizesFromFacets(facets),
      gender: this.extractGender(ebebekProduct.categories || []) || 
              this.extractGenderFromCategories(ebebekProduct.categoryNames || []),
      isOnSale: ebebekProduct.discountRate > 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static getMainImageUrl(images: any[]): string {
    if (!images || images.length === 0) return '';
    const mainImage = images.find(img => img.imageType === 'PRIMARY') || images[0];
    return mainImage?.url || '';
  }

  private static createBrandId(brandName: string): string {
    if (!brandName) return '';
    return brandName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private static extractColors(variantOptions: any[]): string[] | null {
    if (!variantOptions) return null;
    
    const colorOption = variantOptions.find(option => 
      option.code.toLowerCase().includes('color') || 
      option.code.toLowerCase().includes('renk')
    );
    
    if (colorOption?.variantOptionQualifiers) {
      return colorOption.variantOptionQualifiers.map((qualifier: { value: string }) => 
        this.mapColorName(qualifier.value)
      );
    }
    
    return null;
  }

  private static extractSizes(variantOptions: any[]): string[] | null {
    if (!variantOptions) return null;
    
    const sizeOption = variantOptions.find(option => 
      option.code.toLowerCase().includes('size') || 
      option.code.toLowerCase().includes('beden') ||
      option.code.toLowerCase().includes('yas') ||
      option.code.toLowerCase().includes('ay')
    );
    
    if (sizeOption?.variantOptionQualifiers) {
      return sizeOption.variantOptionQualifiers.map((qualifier: { value: string }) => qualifier.value);
    }
    
    return null;
  }

  private static extractGender(categories: any[]): 'erkek' | 'kız' | 'unisex' | null {
    if (!categories) return null;
    
    const categoryNames = categories.map(cat => cat.name.toLowerCase()).join(' ');
    
    if (categoryNames.includes('erkek') || categoryNames.includes('boy')) {
      return 'erkek';
    } else if (categoryNames.includes('kız') || categoryNames.includes('girl')) {
      return 'kız';
    }
    
    return 'unisex';
  }

  private static extractGenderFromCategories(categoryNames: string[]): 'erkek' | 'kız' | 'unisex' {
    if (!categoryNames) return 'unisex';
    
    const categories = categoryNames.join(' ').toLowerCase();
    
    if (categories.includes('erkek')) {
      return 'erkek';
    } else if (categories.includes('kız')) {
      return 'kız';
    }
    
    return 'unisex';
  }

  private static extractColorsFromFacets(facets?: EbebekFacet[]): string[] {
    if (!facets) return [];
    
    const colorFacet = facets.find(facet => facet.code === 'color');
    if (!colorFacet || !colorFacet.values) return [];

    return colorFacet.values.slice(0, 3).map(colorValue => {
      return this.mapRgbToColorName(colorValue.code, colorValue.name);
    });
  }

  private static extractSizesFromFacets(facets?: EbebekFacet[]): string[] {
    if (!facets) return [];
    
    const sizeFacet = facets.find(facet => facet.code === 'size');
    if (!sizeFacet || !sizeFacet.values) return [];

    return sizeFacet.values.slice(0, 3).map(sizeValue => sizeValue.name);
  }

  private static mapRgbToColorName(rgbCode: string, apiName: string): string {
    if (apiName && apiName !== rgbCode) {
      return this.mapColorName(apiName);
    }

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

  private static mapColorName(colorValue: string): string {
    const colorMap: { [key: string]: string } = {
      'Mavi': 'mavi',
      'Kırmızı': 'kirmizi',
      'Yeşil': 'yesil',
      'Sarı': 'sari',
      'Pembe': 'pembe',
      'Mor': 'mor',
      'Turuncu': 'turuncu',
      'Kahverengi': 'kahverengi',
      'Gri': 'gri',
      'Siyah': 'siyah',
      'Beyaz': 'beyaz',
      'Lacivert': 'lacivert',
      'Turkuaz': 'turkuaz',
      'Krem': 'krem',
      'Ekru': 'krem',
      'Karışık Renkli': 'karisik'
    };
    
    return colorMap[colorValue] || colorValue.toLowerCase();
  }
}