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
      
      if (filters.brandIds && filters.brandIds.length > 0) {
        httpParams = httpParams.set('brands', filters.brandIds.join(','));
      }
      
      if (filters.sizes && filters.sizes.length > 0) {
        httpParams = httpParams.set('sizes', filters.sizes.join(','));
      }
      
      if (filters.genders && filters.genders.length > 0) {
        httpParams = httpParams.set('genders', filters.genders.join(','));
      }
      
      if (filters.colors && filters.colors.length > 0) {
        httpParams = httpParams.set('colors', filters.colors.join(','));
      }
      
      if (filters.ratings && filters.ratings.length > 0) {
        httpParams = httpParams.set('ratings', filters.ratings.join(','));
      }
      
      if (filters.priceRange) {
        httpParams = httpParams.set('minPrice', filters.priceRange.min.toString());
        httpParams = httpParams.set('maxPrice', filters.priceRange.max.toString());
      }
      
      if (filters.inStockOnly) {
        httpParams = httpParams.set('inStock', 'true');
      }
      
      if (filters.onSaleOnly) {
        httpParams = httpParams.set('onSale', 'true');
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
        originalPrice: 1599.99,
        description: 'Konforlu ve güvenli bebek arabası',
        imageUrl: '',
        categoryId: 'strollers',
        brandId: 'chicco',
        inStock: true,
        rating: 4.5,
        reviewCount: 120,
        colors: ['siyah', 'gri'],
        sizes: ['0-3-ay', '3-6-ay'],
        gender: 'unisex',
        isOnSale: true,
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
        brandId: 'johnson',
        inStock: true,
        rating: 4.8,
        reviewCount: 89,
        colors: ['krem'],
        sizes: ['6-12-ay'],
        gender: 'unisex',
        isOnSale: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Eğitici Bebek Oyuncağı Set',
        price: 89.99,
        originalPrice: 129.99,
        description: 'Eğitici ve eğlenceli oyuncak seti',
        imageUrl: '',
        categoryId: 'toys',
        brandId: 'bebeto',
        inStock: false,
        rating: 4.2,
        reviewCount: 65,
        colors: ['kirmizi', 'mavi', 'yesil'],
        sizes: ['12-18-ay', '18-24-ay'],
        gender: 'erkek',
        isOnSale: true,
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
        brandId: 'philips-avent',
        inStock: true,
        rating: 4.6,
        reviewCount: 156,
        colors: ['pembe', 'mavi'],
        sizes: ['0-3-ay'],
        gender: 'kız',
        isOnSale: false,
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
        brandId: 'mama-papa',
        inStock: true,
        rating: 4.4,
        reviewCount: 78,
        colors: ['beyaz', 'siyah'],
        sizes: ['genel'],
        gender: 'unisex',
        isOnSale: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Organik Bebek Şampuanı',
        price: 25.99,
        originalPrice: 35.99,
        description: 'Doğal içerikli bebek şampuanı',
        imageUrl: '',
        categoryId: 'care',
        brandId: 'johnson',
        inStock: true,
        rating: 4.7,
        reviewCount: 234,
        colors: ['sari'],
        sizes: ['genel'],
        gender: 'unisex',
        isOnSale: true,
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
        brandId: 'chicco',
        inStock: false,
        rating: 4.9,
        reviewCount: 445,
        colors: ['siyah', 'gri', 'lacivert'],
        sizes: ['0-3-ay', '3-6-ay', '6-12-ay'],
        gender: 'unisex',
        isOnSale: false,
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
        brandId: 'nuby',
        inStock: true,
        rating: 4.3,
        reviewCount: 189,
        colors: ['kahverengi', 'pembe', 'mavi'],
        sizes: ['12-18-ay', '18-24-ay', '2-3-yas'],
        gender: 'kız',
        isOnSale: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '9',
        name: 'Bebek Bezi Paketi (64 Adet)',
        price: 85.99,
        originalPrice: 99.99,
        description: 'Ultra emici bebek bezleri',
        imageUrl: '',
        categoryId: 'diapers',
        brandId: 'bebeto',
        inStock: true,
        rating: 4.1,
        reviewCount: 567,
        colors: ['beyaz'],
        sizes: ['3-6-ay', '6-12-ay'],
        gender: 'unisex',
        isOnSale: true,
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
        brandId: 'tommee-tippee',
        inStock: true,
        rating: 4.5,
        reviewCount: 134,
        colors: ['mavi', 'pembe', 'yesil'],
        sizes: ['0-3-ay', '3-6-ay'],
        gender: 'unisex',
        isOnSale: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '11',
        name: 'Bebek Mama Sandalyesi',
        price: 180.75,
        originalPrice: 220.75,
        description: 'Ayarlanabilir mama sandalyesi',
        imageUrl: '',
        categoryId: 'feeding',
        brandId: 'chicco',
        inStock: false,
        rating: 4.6,
        reviewCount: 298,
        colors: ['gri', 'turkuaz'],
        sizes: ['6-12-ay', '12-18-ay', '18-24-ay'],
        gender: 'unisex',
        isOnSale: true,
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
        brandId: 'mam',
        inStock: true,
        rating: 4.4,
        reviewCount: 89,
        colors: ['mor', 'pastel-mavi', 'krem'],
        sizes: ['0-3-ay', '3-6-ay', '6-12-ay'],
        gender: 'kız',
        isOnSale: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Daha fazla mock data
      {
        id: '13',
        name: 'Erkek Bebek Tişört Seti',
        price: 75.99,
        originalPrice: 89.99,
        description: '3\'lü erkek bebek tişört seti',
        imageUrl: '',
        categoryId: 'toys',
        brandId: 'bebeto',
        inStock: true,
        rating: 4.2,
        reviewCount: 45,
        colors: ['mavi', 'yesil', 'turuncu'],
        sizes: ['6-12-ay', '12-18-ay'],
        gender: 'erkek',
        isOnSale: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '14',
        name: 'Kız Bebek Elbise',
        price: 55.50,
        description: 'Şık kız bebek elbise',
        imageUrl: '',
        categoryId: 'toys',
        brandId: 'mama-papa',
        inStock: true,
        rating: 4.8,
        reviewCount: 67,
        colors: ['pembe', 'mor', 'gold'],
        sizes: ['12-18-ay', '18-24-ay', '2-3-yas'],
        gender: 'kız',
        isOnSale: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '15',
        name: 'Antibakteriyel Islak Mendil',
        price: 15.99,
        originalPrice: 19.99,
        description: 'Hassas ciltler için antibakteriyel mendil',
        imageUrl: '',
        categoryId: 'diapers',
        brandId: 'johnson',
        inStock: true,
        rating: 4.3,
        reviewCount: 789,
        colors: ['beyaz'],
        sizes: ['genel'],
        gender: 'unisex',
        isOnSale: true,
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
      
      if (filters.brandIds && filters.brandIds.length > 0) {
        filteredProducts = filteredProducts.filter(p => filters.brandIds!.includes(p.brandId));
      }
      
      if (filters.sizes && filters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          p.sizes && p.sizes.some(size => filters.sizes!.includes(size))
        );
      }
      
      if (filters.genders && filters.genders.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          p.gender && filters.genders!.includes(p.gender)
        );
      }
      
      if (filters.colors && filters.colors.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          p.colors && p.colors.some(color => filters.colors!.includes(color))
        );
      }
      
      if (filters.ratings && filters.ratings.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          p.rating && filters.ratings!.some(rating => p.rating! >= rating)
        );
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
      
      if (filters.onSaleOnly) {
        filteredProducts = filteredProducts.filter(p => p.isOnSale);
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
      brandId: 'chicco',
      inStock: true,
      rating: 4.0,
      reviewCount: 25,
      colors: ['mavi'],
      sizes: ['genel'],
      gender: 'unisex',
      isOnSale: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(mockProduct).pipe(delay(300));
  }
}