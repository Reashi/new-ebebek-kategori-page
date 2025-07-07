// src/app/features/product-listing/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

import { Product, ProductFilters } from '../product/product.model';
import { EbebekApiResponse, EbebekProduct, EbebekProductMapper } from '../services/ebebek-api.model';
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
  private readonly authToken = environment.ebebekApi.authToken;
  private readonly requestTimeout = environment.ebebekApi.timeout;

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
    
    if (!this.authToken) {
      console.warn('E-bebek API auth token is not configured. API calls may fail.');
    }

    if (environment.features.enableLogging) {
      console.log('ProductService configured with:', {
        baseUrl: this.baseUrl,
        hasAuthToken: !!this.authToken,
        timeout: this.requestTimeout
      });
    }
  }

  getProducts(params: ProductQueryParams = {}): Observable<ProductResponse> {
    const url = `${this.baseUrl}/products/search`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.getHeaders();

    return this.http.get<EbebekApiResponse>(url, { params: httpParams, headers })
      .pipe(
        timeout(this.requestTimeout),
        map((response: EbebekApiResponse) => this.mapApiResponse(response, params)),
        catchError((error: any) => {
          this.logError('getProducts', error, params);
          return throwError(() => new Error(this.getErrorMessage(error)));
        })
      );
  }

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

  private buildHttpParams(params: ProductQueryParams): HttpParams {
    let httpParams = new HttpParams();

    // Sayfalama
    const page = params.page || 1;
    const pageSize = params.pageSize || 12;
    httpParams = httpParams.set('pageSize', pageSize.toString());
    httpParams = httpParams.set('currentPage', (page - 1).toString()); // E-bebek 0-based indexing kullanıyor

    // Dil ve para birimi
    httpParams = httpParams.set('lang', 'tr');
    httpParams = httpParams.set('curr', 'TRY');

    // Alan seçimi (fields parameter)
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

    // Sıralama
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
      const brandQuery = filters.brandIds.map(brandId => `brand:${brandId}`).join(' OR ');
      queryParts.push(`(${brandQuery})`);
    }

    // Arama terimi
    if (filters?.searchTerm) {
      queryParts.push(`text:${encodeURIComponent(filters.searchTerm)}`);
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

    const finalQuery = queryParts.join(':');
    
    if (environment.features.enableLogging) {
      console.log('Built query:', finalQuery);
    }

    return finalQuery;
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

  private getHeaders(): HttpHeaders {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'platform': 'web',
      'Referer': 'https://www.e-bebek.com/',
      'sec-ch-ua-platform': '"macOS"',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    };

    // Auth token varsa ekle
    if (this.authToken) {
      headers['Authorization'] = `bearer ${this.authToken}`;
    }

    return new HttpHeaders(headers);
  }

  private mapApiResponse(response: EbebekApiResponse, params: ProductQueryParams): ProductResponse {
    if (!response) {
      throw new Error('Invalid API response');
    }

    const products = (response.products || []).map(ebebekProduct => 
      EbebekProductMapper.mapToProduct(ebebekProduct)
    );

    const result = {
      products,
      totalCount: response.pagination?.totalResults || 0,
      currentPage: (response.pagination?.currentPage || 0) + 1, // 0-based'den 1-based'e çeviriyoruz
      pageSize: response.pagination?.pageSize || 12,
      facets: response.facets,
      breadcrumbs: response.breadcrumbs
    };

    if (environment.features.enableLogging) {
      console.log('Mapped API response:', {
        productsCount: result.products.length,
        totalCount: result.totalCount,
        currentPage: result.currentPage
      });
    }

    return result;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'API yetkilendirme hatası. Lütfen API anahtarınızı kontrol ediniz.';
    } else if (error.status === 403) {
      return 'Bu işlem için yetkiniz bulunmuyor.';
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
    if (environment.features.enableLogging) {
      console.error(`ProductService.${method} error:`, {
        error,
        params,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Kategori listesi alma
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

  // Marka listesi alma
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