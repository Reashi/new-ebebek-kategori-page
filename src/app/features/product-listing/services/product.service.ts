// src/app/features/product-listing/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, timer } from 'rxjs';
import { map, catchError, timeout, retry, switchMap } from 'rxjs/operators';

import { Product, ProductFilters } from '../product/product.model';
import { EbebekApiResponse, EbebekProduct, EbebekProductMapper } from './ebebek-api.model';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../../environments/environment';

export interface ProductResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  facets?: any[];
  breadcrumbs?: any[];
}

export interface ProductQueryParams {
  filters?: ProductFilters;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = environment.ebebekApi.baseUrl;
  private readonly requestTimeout = environment.ebebekApi.timeout;
  private readonly retryAttempts = environment.ebebekApi.retryAttempts;
  private readonly retryDelay = environment.ebebekApi.retryDelay;

  // E-bebek kategori mapping (gerçek E-bebek kategori kodları)
  private readonly categoryMapping: { [key: string]: string } = {
    'strollers': '0002',          // Bebek Arabaları
    'food': '0003',               // Mama & Beslenme
    'toys': '0004',               // Oyuncaklar
    'feeding': '0005',            // Emzirme & Beslenme
    'safety': '0006',             // Güvenlik
    'care': '0007',               // Bakım & Hijyen
    'car-seats': '0008',          // Oto Koltuğu
    'diapers': '0009',            // Bez & Islak Mendil
    'bath': '0010',               // Banyo
    'sleep': '0011'               // Uyku
  };

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.baseUrl && !environment.features.enableApiMocking) {
      throw new Error('E-bebek API base URL is not configured and API mocking is disabled');
    }

    if (environment.features.enableLogging) {
      console.log('ProductService configured with:', {
        baseUrl: this.baseUrl,
        timeout: this.requestTimeout,
        retryAttempts: this.retryAttempts,
        apiMocking: environment.features.enableApiMocking
      });
    }
  }

  getProducts(params: ProductQueryParams = {}): Observable<ProductResponse> {
    // Development modunda mock data kullan
    if (environment.features.enableApiMocking) {
      if (environment.features.enableLogging) {
        console.log('Using mock data service for products');
      }
      return this.mockDataService.getProducts(params);
    }

    // Gerçek API çağrısı
    return this.callRealApi(params);
  }

  private callRealApi(params: ProductQueryParams): Observable<ProductResponse> {
    const url = `${this.baseUrl}/products/search`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.getHeaders();

    if (environment.features.enableLogging) {
      console.log('Making real API request:', {
        url,
        params: httpParams.toString(),
        headers: headers.keys()
      });
    }

    return this.http.get<EbebekApiResponse>(url, { params: httpParams, headers })
      .pipe(
        timeout(this.requestTimeout),
        retry({
          count: this.retryAttempts,
          delay: (error, retryCount) => {
            if (environment.features.enableLogging) {
              console.log(`API retry attempt ${retryCount} after error:`, error);
            }
            return timer(this.retryDelay * retryCount);
          }
        }),
        map((response: EbebekApiResponse) => this.mapApiResponse(response, params)),
        catchError((error: any) => {
          this.logError('getProducts', error, params);
          
          // Production'da fallback olarak mock data kullan
          if (environment.production && error.status >= 500) {
            console.warn('API failed, falling back to mock data');
            return this.mockDataService.getProducts(params);
          }
          
          return throwError(() => new Error(this.getErrorMessage(error)));
        })
      );
  }

  getProductById(id: string): Observable<Product> {
    // Mock data kullan
    if (environment.features.enableApiMocking) {
      return this.mockDataService.getProductById(id);
    }

    const url = `${this.baseUrl}/products/${id}`;
    const headers = this.getHeaders();

    return this.http.get<EbebekProduct>(url, { headers })
      .pipe(
        timeout(this.requestTimeout),
        retry({
          count: this.retryAttempts,
          delay: this.retryDelay
        }),
        map(ebebekProduct => EbebekProductMapper.mapToProduct(ebebekProduct)),
        catchError(error => {
          this.logError('getProductById', error, { id });
          
          // Fallback
          if (environment.production && error.status >= 500) {
            return this.mockDataService.getProductById(id);
          }
          
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

  private buildHttpParams(params: ProductQueryParams): HttpParams {
    let httpParams = new HttpParams();

    // Sayfalama
    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || environment.app.defaultPageSize, environment.app.maxPageSize);
    httpParams = httpParams.set('pageSize', pageSize.toString());
    httpParams = httpParams.set('currentPage', (page - 1).toString());

    // Dil ve para birimi
    httpParams = httpParams.set('lang', 'tr');
    httpParams = httpParams.set('curr', 'TRY');

    // Alan seçimi (fields parameter) - curl komutundan alınan
    const fields = this.getFieldsParameter();
    httpParams = httpParams.set('fields', fields);

    // Query oluşturma
    const query = this.buildQuery(params.filters, params.sortBy);
    httpParams = httpParams.set('query', query);

    if (environment.features.enableLogging) {
      console.log('Built HTTP params:', httpParams.toString());
    }

    return httpParams;
  }

  private getFieldsParameter(): string {
    // Curl komutundan alınan gerçek fields parametresi
    return [
      'products(',
      'code,name,categoryCodes,bestSellerProduct,starProduct,minOrderQuantity',
      ',newProduct,freeShipment,categoryNames,summary,discountedPrice(FULL)',
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

  private buildQuery(filters?: ProductFilters, sortBy?: string): string {
    let queryParts: string[] = [];

    // Sıralama (curl komutundan alınan format)
    const sort = this.mapSortBy(sortBy);
    queryParts.push(`:${sort}`);

    // Kategori filtresi
    if (filters?.categoryId) {
      const ebebekCategoryCode = this.categoryMapping[filters.categoryId];
      if (ebebekCategoryCode) {
        queryParts.push(`allCategories:${ebebekCategoryCode}`);
      }
    }

    // Marka filtresi
    if (filters?.brandIds && filters.brandIds.length > 0) {
      const brandQueries = filters.brandIds.map(brandId => `brand:${encodeURIComponent(brandId)}`);
      if (brandQueries.length === 1) {
        queryParts.push(brandQueries[0]);
      } else {
        queryParts.push(`(${brandQueries.join(' OR ')})`);
      }
    }

    // Arama terimi
    if (filters?.searchTerm && filters.searchTerm.trim()) {
      const cleanSearchTerm = filters.searchTerm.trim().replace(/[^\w\s]/g, '');
      queryParts.push(`text:${encodeURIComponent(cleanSearchTerm)}`);
    }

    // Fiyat aralığı
    if (filters?.priceRange) {
      queryParts.push(`price:[${filters.priceRange.min} TO ${filters.priceRange.max}]`);
    }

    // Stok durumu
    if (filters?.inStockOnly) {
      queryParts.push('stockLevelStatus:inStock');
    }

    // İndirimli ürünler
    if (filters?.onSaleOnly) {
      queryParts.push('discountRate:[1 TO *]');
    }

    // Yeni ürünler
    if (filters?.isNew) {
      queryParts.push('newProduct:true');
    }

    const finalQuery = queryParts.join(':');
    
    if (environment.features.enableLogging) {
      console.log('Built query:', finalQuery);
    }

    return finalQuery || ':relevance';
  }

  private mapSortBy(sortBy?: string): string {
    const sortMap: { [key: string]: string } = {
      'name': 'name-asc',
      'price-asc': 'price-asc',
      'price-desc': 'price-desc',
      'rating': 'topRated',
      'newest': 'creationtime-desc',
      'popularity': 'relevance',
      'relevance': 'relevance'
    };

    return sortMap[sortBy || 'relevance'] || 'relevance';
  }

  private getHeaders(): HttpHeaders {
    // Curl komutundan alınan gerçek headers
    const headers: { [key: string]: string } = {
      'Accept': 'application/json, text/plain',
      'platform': 'web',
      'Referer': 'https://www.e-bebek.com/',
      'sec-ch-ua-platform': '"macOS"',
      'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    };

    return new HttpHeaders(headers);
  }

  private mapApiResponse(response: EbebekApiResponse, params: ProductQueryParams): ProductResponse {
    if (!response) {
      throw new Error('Invalid API response');
    }

    if (environment.features.enableLogging) {
      console.log('Raw API response structure:', {
        hasProducts: !!response.products,
        productsCount: response.products?.length || 0,
        hasPagination: !!response.pagination,
        hasFacets: !!response.facets,
        facetsCount: response.facets?.length || 0
      });
    }

    const products = (response.products || [])
      .map(ebebekProduct => {
        try {
          return EbebekProductMapper.mapToProduct(ebebekProduct);
        } catch (error) {
          if (environment.features.enableLogging) {
            console.warn('Failed to map product:', ebebekProduct.code, error);
          }
          return null;
        }
      })
      .filter((product): product is Product => product !== null);

    const result = {
      products,
      totalCount: response.pagination?.totalResults || 0,
      currentPage: (response.pagination?.currentPage || 0) + 1,
      pageSize: response.pagination?.pageSize || environment.app.defaultPageSize,
      facets: response.facets,
      breadcrumbs: response.breadcrumbs
    };

    if (environment.features.enableLogging) {
      console.log('Mapped API response:', {
        productsCount: result.products.length,
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        hasValidProducts: result.products.every(p => p.id && p.name)
      });
    }

    return result;
  }

  private getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return 'İnternet bağlantınızı kontrol ediniz.';
        case 400:
          return 'Geçersiz istek parametreleri.';
        case 401:
          return 'API yetkilendirme hatası.';
        case 403:
          return 'Bu işlem için yetkiniz bulunmuyor.';
        case 404:
          return 'Aradığınız ürün bulunamadı.';
        case 429:
          return 'Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyiniz.';
        case 500:
        case 502:
        case 503:
          return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.';
        default:
          return `Beklenmeyen hata oluştu (${error.status}). Lütfen tekrar deneyiniz.`;
      }
    } else if (error.name === 'TimeoutError') {
      return `İstek zaman aşımına uğradı (${this.requestTimeout}ms). Lütfen tekrar deneyiniz.`;
    } else if (!navigator.onLine) {
      return 'İnternet bağlantınızı kontrol ediniz.';
    } else {
      return 'Bir hata oluştu. Lütfen tekrar deneyiniz.';
    }
  }

  private logError(method: string, error: any, params?: any): void {
    if (environment.features.enableLogging) {
      console.error(`ProductService.${method} error:`, {
        error: error.message || error,
        status: error.status,
        params,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  // Kategori listesi alma
  getCategories(): Observable<any[]> {
    if (environment.features.enableApiMocking) {
      return this.mockDataService.getCategories();
    }

    const url = `${this.baseUrl}/categories`;
    const headers = this.getHeaders();

    return this.http.get<any>(url, { headers })
      .pipe(
        timeout(this.requestTimeout),
        retry({
          count: this.retryAttempts,
          delay: this.retryDelay
        }),
        catchError(error => {
          this.logError('getCategories', error);
          // Fallback kategoriler
          return this.mockDataService.getCategories();
        })
      );
  }

  // Marka listesi alma
  getBrands(): Observable<any[]> {
    if (environment.features.enableApiMocking) {
      return this.mockDataService.getBrands();
    }

    const url = `${this.baseUrl}/brands`;
    const headers = this.getHeaders();

    return this.http.get<any>(url, { headers })
      .pipe(
        timeout(this.requestTimeout),
        retry({
          count: this.retryAttempts,
          delay: this.retryDelay
        }),
        catchError(error => {
          this.logError('getBrands', error);
          // Fallback markalar
          return this.mockDataService.getBrands();
        })
      );
  }

  // Health check
  healthCheck(): Observable<boolean> {
    if (environment.features.enableApiMocking) {
      return this.mockDataService.healthCheck();
    }

    const url = `${this.baseUrl}/health`;
    const headers = this.getHeaders();

    return this.http.get(url, { headers })
      .pipe(
        timeout(5000),
        map(() => true),
        catchError(() => of(false))
      );
  }

  // Cache yönetimi için gelecekte kullanılabilir
  private cacheKey(params: ProductQueryParams): string {
    return `products_${JSON.stringify(params)}_${Date.now()}`;
  }

  // Performance monitoring
  private startTimer(): number {
    return performance.now();
  }

  private endTimer(startTime: number, operation: string): void {
    if (environment.features.enableLogging) {
      const duration = performance.now() - startTime;
      console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
    }
  }

  // API durumunu kontrol et
  getApiStatus(): Observable<{ healthy: boolean; responseTime: number }> {
    const startTime = this.startTimer();
    
    return this.healthCheck().pipe(
      map(healthy => ({
        healthy,
        responseTime: performance.now() - startTime
      }))
    );
  }
}