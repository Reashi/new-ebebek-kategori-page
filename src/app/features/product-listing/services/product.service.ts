// src/app/features/product-listing/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Product, ProductFilters } from '../product/product.model';

export interface ProductResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductQueryParams {
  filters?: ProductFilters;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://api.ebebek.com/products'; // Gerçek API URL'ini buraya yaz

  constructor(private http: HttpClient) {}

  getProducts(params: ProductQueryParams = {}): Observable<ProductResponse> {
    // Geçici olarak mock data kullanıyoruz
    // Gerçek API entegrasyonu için bu kısmı değiştir
    return this.getMockProducts(params);
    
    // Gerçek API için bu kodu kullan:
    /*
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ProductResponse>(this.apiUrl, { params: httpParams });
    */
  }

  getProductById(id: string): Observable<Product> {
    // Geçici olarak mock data kullanıyoruz
    return this.getMockProductById(id);
    
    // Gerçek API için bu kodu kullan:
    /*
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
    */
  }

  private buildHttpParams(params: ProductQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    if (params.filters) {
      const { filters } = params;
      
      if (filters.categoryId) {
        httpParams = httpParams.set('categoryId', filters.categoryId);
      }
      
      if (filters.searchTerm) {
        httpParams = httpParams.set('search', filters.searchTerm);
      }
      
      if (filters.priceRange) {
        httpParams = httpParams.set('minPrice', filters.priceRange.min.toString());
        httpParams = httpParams.set('maxPrice', filters.priceRange.max.toString());
      }
      
      if (filters.inStockOnly) {
        httpParams = httpParams.set('inStock', 'true');
      }
    }

    return httpParams;
  }

  // Mock data methods (gerçek API entegrasyonunda kaldır)
  private getMockProducts(params: ProductQueryParams): Observable<ProductResponse> {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Bebek Arabası Premium Comfort',
        price: 1299.99,
        description: 'Konforlu ve güvenli bebek arabası',
        imageUrl: '',
        categoryId: 'strollers',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Organik Bebek Maması 6 Aylık',
        price: 45.50,
        description: 'Doğal ve organik bebek maması',
        imageUrl: '',
        categoryId: 'food',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Eğitici Bebek Oyuncağı Set',
        price: 89.99,
        description: 'Eğitici ve eğlenceli oyuncak seti',
        imageUrl: '',
        categoryId: 'toys',
        inStock: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Bebek Emzirme Yastığı',
        price: 125.00,
        description: 'Ergonomik emzirme yastığı',
        imageUrl: '',
        categoryId: 'feeding',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Bebek Güvenlik Kamerası',
        price: 350.75,
        description: 'WiFi destekli bebek monitörü',
        imageUrl: '',
        categoryId: 'safety',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Organik Bebek Şampuanı',
        price: 25.99,
        description: 'Doğal içerikli bebek şampuanı',
        imageUrl: '',
        categoryId: 'care',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '7',
        name: 'Bebek Oto Koltuğu',
        price: 750.00,
        description: 'ECE sertifikalı güvenli oto koltuğu',
        imageUrl: '',
        categoryId: 'car-seats',
        inStock: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '8',
        name: 'Yumuşak Peluş Ayıcık',
        price: 35.50,
        description: 'Yumuşak ve güvenli peluş oyuncak',
        imageUrl: '',
        categoryId: 'toys',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '9',
        name: 'Bebek Bezi Paketi (64 Adet)',
        price: 85.99,
        description: 'Ultra emici bebek bezleri',
        imageUrl: '',
        categoryId: 'diapers',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '10',
        name: 'Bebek Banyo Küveti',
        price: 95.00,
        description: 'Ergonomik tasarım banyo küveti',
        imageUrl: '',
        categoryId: 'bath',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '11',
        name: 'Bebek Mama Sandalyesi',
        price: 180.75,
        description: 'Ayarlanabilir mama sandalyesi',
        imageUrl: '',
        categoryId: 'feeding',
        inStock: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '12',
        name: 'Bebek Uyku Tulumu',
        price: 65.99,
        description: 'Rahat ve güvenli uyku tulumu',
        imageUrl: '',
        categoryId: 'sleep',
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Filtreleme simülasyonu
    let filteredProducts = [...mockProducts];
    
    if (params.filters) {
      const { filters } = params;
      
      if (filters.categoryId) {
        filteredProducts = filteredProducts.filter(p => p.categoryId === filters.categoryId);
      }
      
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.priceRange) {
        filteredProducts = filteredProducts.filter(p => 
          p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
        );
      }
      
      if (filters.inStockOnly) {
        filteredProducts = filteredProducts.filter(p => p.inStock);
      }
    }

    // Pagination simülasyonu
    const page = params.page || 1;
    const pageSize = params.pageSize || 12;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response: ProductResponse = {
      products: paginatedProducts,
      totalCount: filteredProducts.length,
      currentPage: page,
      pageSize: pageSize
    };

    // API çağrısı simülasyonu için delay
    return of(response).pipe(delay(500));
  }

  private getMockProductById(id: string): Observable<Product> {
    const mockProduct: Product = {
      id,
      name: `Ürün ${id}`,
      price: 99.99,
      description: `Ürün ${id} detaylı açıklaması`,
      imageUrl: `https://via.placeholder.com/300x200?text=Ürün+${id}`,
      categoryId: 'general',
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(mockProduct).pipe(delay(300));
  }
}