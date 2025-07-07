// src/app/features/product-listing/services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError, switchMap } from 'rxjs';
import { Product } from '../product/product.model';
import { ProductResponse, ProductQueryParams } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockProducts: Product[] = [
    {
      id: 'chicco-london-stroller-1',
      name: 'Chicco London Matrix Bebek Arabası - Light Grey',
      price: 899.99,
      originalPrice: 1199.99,
      description: 'Hafif ve pratik kullanımlı bebek arabası. Tek elle katlanabilen sistem.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/c/h/chicco-london-matrix-bebek-arabasi-light-grey-1.jpg',
      categoryId: 'strollers',
      brandId: 'chicco',
      inStock: true,
      rating: 4.5,
      reviewCount: 124,
      colors: ['gri', 'siyah', 'lacivert'],
      sizes: ['0-3-ay', '3-6-ay', '6-12-ay'],
      gender: 'unisex',
      isOnSale: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: 'bebeto-forza-travel-2',
      name: 'Bebeto Forza Travel Sistem Bebek Arabası - Siyah',
      price: 1299.99,
      description: 'Tam donanımlı travel sistem bebek arabası. Oto koltuğu dahil.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/b/e/bebeto-forza-travel-sistem-bebek-arabasi-siyah-1.jpg',
      categoryId: 'strollers',
      brandId: 'bebeto',
      inStock: true,
      rating: 4.7,
      reviewCount: 89,
      colors: ['siyah', 'kahverengi', 'lacivert'],
      sizes: ['0-3-ay', '3-6-ay', '6-12-ay', '12-18-ay'],
      gender: 'unisex',
      isOnSale: false,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-20')
    },
    {
      id: 'johnson-baby-shampoo-3',
      name: 'Johnson\'s Baby Şampuan 500ml - Klasik',
      price: 24.99,
      originalPrice: 29.99,
      description: 'Bebeklerin hassas saç derisi için özel formül. Göz yakmayan formül.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/j/o/johnsons-baby-sampuan-500ml-klasik-1.jpg',
      categoryId: 'care',
      brandId: 'johnson',
      inStock: true,
      rating: 4.3,
      reviewCount: 256,
      colors: [],
      sizes: ['500ml'],
      gender: 'unisex',
      isOnSale: true,
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-12-05')
    },
    {
      id: 'philips-avent-bottle-4',
      name: 'Philips Avent Natural Biberon 260ml',
      price: 89.99,
      description: 'Doğal emme hissi sağlayan anti-kolik sistem. BPA içermez.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/p/h/philips-avent-natural-biberon-260ml-1.jpg',
      categoryId: 'feeding',
      brandId: 'philips-avent',
      inStock: true,
      rating: 4.6,
      reviewCount: 178,
      colors: ['beyaz', 'pembe', 'mavi'],
      sizes: ['260ml'],
      gender: 'unisex',
      isOnSale: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-11-30')
    },
    {
      id: 'fisher-price-rock-play-5',
      name: 'Fisher Price Rock\'n Play Salıncak',
      price: 299.99,
      originalPrice: 399.99,
      description: 'Müzikli ve titreşimli bebek salıncağı. Rahatlatıcı doğa sesleri.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/f/i/fisher-price-rock-n-play-salincak-1.jpg',
      categoryId: 'toys',
      brandId: 'fisher-price',
      inStock: false,
      rating: 4.4,
      reviewCount: 95,
      colors: ['yesil', 'mavi', 'pembe'],
      sizes: ['0-3-ay', '3-6-ay'],
      gender: 'unisex',
      isOnSale: true,
      createdAt: new Date('2024-04-12'),
      updatedAt: new Date('2024-12-02')
    },
    {
      id: 'chicco-keyfit-carseat-6',
      name: 'Chicco KeyFit 30 Oto Koltuğu - Anthracite',
      price: 1499.99,
      description: 'Yenidoğandan 13 kg\'a kadar güvenli oto koltuğu. Kolay kurulum.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/c/h/chicco-keyfit-30-oto-koltugu-anthracite-1.jpg',
      categoryId: 'car-seats',
      brandId: 'chicco',
      inStock: true,
      rating: 4.8,
      reviewCount: 142,
      colors: ['siyah', 'gri', 'kahverengi'],
      sizes: ['0-13kg'],
      gender: 'unisex',
      isOnSale: false,
      createdAt: new Date('2024-02-28'),
      updatedAt: new Date('2024-11-25')
    },
    {
      id: 'pampers-pants-7',
      name: 'Pampers Pants Mega Pack Bebek Bezi 4 Numara',
      price: 159.99,
      originalPrice: 179.99,
      description: '12 saate kadar koruma sağlayan elastik kemerli bebek bezi.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/p/a/pampers-pants-mega-pack-bebek-bezi-4-numara-1.jpg',
      categoryId: 'diapers',
      brandId: 'pampers',
      inStock: true,
      rating: 4.5,
      reviewCount: 324,
      colors: [],
      sizes: ['4-numara'],
      gender: 'unisex',
      isOnSale: true,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-12-03')
    },
    {
      id: 'tommee-tippee-cup-8',
      name: 'Tommee Tippee First Cup Bardak 190ml',
      price: 39.99,
      description: 'İlk bardak deneyimi için ideal. Döküm önleyici tasarım.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/t/o/tommee-tippee-first-cup-bardak-190ml-1.jpg',
      categoryId: 'feeding',
      brandId: 'tommee-tippee',
      inStock: true,
      rating: 4.2,
      reviewCount: 67,
      colors: ['pembe', 'mavi', 'yesil'],
      sizes: ['190ml'],
      gender: 'unisex',
      isOnSale: false,
      createdAt: new Date('2024-05-08'),
      updatedAt: new Date('2024-11-28')
    },
    {
      id: 'nuby-teether-9',
      name: 'Nuby Soğutmalı Diş Kaşıyıcı - Çok Renkli',
      price: 19.99,
      originalPrice: 24.99,
      description: 'Diş çıkarma döneminde rahatlık sağlar. Buzdolabında saklanabilir.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/n/u/nuby-sogutmali-dis-kasiyici-cok-renkli-1.jpg',
      categoryId: 'toys',
      brandId: 'nuby',
      inStock: true,
      rating: 4.1,
      reviewCount: 43,
      colors: ['kirmizi', 'mavi', 'yesil', 'sari'],
      sizes: ['3-6-ay', '6-12-ay'],
      gender: 'unisex',
      isOnSale: true,
      createdAt: new Date('2024-06-20'),
      updatedAt: new Date('2024-12-04')
    },
    {
      id: 'mam-pacifier-10',
      name: 'MAM Perfect Night Emzik 6+ Ay',
      price: 49.99,
      description: 'Geceleyin parlayan emzik. Ortodontik tasarım.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/m/a/mam-perfect-night-emzik-6-ay-1.jpg',
      categoryId: 'feeding',
      brandId: 'mam',
      inStock: true,
      rating: 4.4,
      reviewCount: 112,
      colors: ['pembe', 'mavi', 'beyaz'],
      sizes: ['6-ay'],
      gender: 'unisex',
      isOnSale: false,
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-11-15')
    },
    {
      id: 'baby-dove-lotion-11',
      name: 'Baby Dove Nemlendirici Losyon 200ml',
      price: 34.99,
      originalPrice: 39.99,
      description: '24 saat nem sağlayan bebek losyonu. Hipoalerjenik formül.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/b/a/baby-dove-nemlendirici-losyon-200ml-1.jpg',
      categoryId: 'care',
      brandId: 'baby-dove',
      inStock: true,
      rating: 4.3,
      reviewCount: 87,
      colors: [],
      sizes: ['200ml'],
      gender: 'unisex',
      isOnSale: true,
      createdAt: new Date('2024-08-05'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: 'chicco-bath-seat-12',
      name: 'Chicco Bubble Nest Banyo Koltuğu',
      price: 199.99,
      description: 'Güvenli banyo keyfi için tasarlanmış banyo koltuğu.',
      imageUrl: 'https://cdn1.e-bebek.com/media/catalog/product/c/h/chicco-bubble-nest-banyo-koltugu-1.jpg',
      categoryId: 'bath',
      brandId: 'chicco',
      inStock: false,
      rating: 4.6,
      reviewCount: 55,
      colors: ['mavi', 'pembe', 'yesil'],
      sizes: ['6-12-ay'],
      gender: 'unisex',
      isOnSale: false,
      createdAt: new Date('2024-09-12'),
      updatedAt: new Date('2024-11-20')
    }
  ];

  getProducts(params: ProductQueryParams = {}): Observable<ProductResponse> {
    // API gecikme simülasyonu
    const delay_ms = Math.random() * 1000 + 500; // 500-1500ms

    return of(null).pipe(
      delay(delay_ms),
      switchMap(() => {
        // Filtrele
        let filteredProducts = this.applyFilters(this.mockProducts, params.filters);
        
        // Sırala
        filteredProducts = this.applySorting(filteredProducts, params.sortBy);
        
        // Sayfalama
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
        
        return of(response);
      })
    );
  }

  getProductById(id: string): Observable<Product> {
    return of(null).pipe(
      delay(300),
      switchMap(() => {
        const product = this.mockProducts.find(p => p.id === id);
        if (product) {
          return of(product);
        } else {
          return throwError(() => new Error('Ürün bulunamadı'));
        }
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

  private applyFilters(products: Product[], filters?: any): Product[] {
    if (!filters) return products;
    
    let filtered = [...products];
    
    // Kategori filtresi
    if (filters.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }
    
    // Marka filtresi
    if (filters.brandIds && filters.brandIds.length > 0) {
      filtered = filtered.filter(p => filters.brandIds.includes(p.brandId));
    }
    
    // Arama terimi
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Fiyat aralığı
    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange.min && 
        p.price <= filters.priceRange.max
      );
    }
    
    // Stok durumu
    if (filters.inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }
    
    // İndirimli ürünler
    if (filters.onSaleOnly) {
      filtered = filtered.filter(p => p.isOnSale);
    }
    
    // Renk filtresi
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(p => 
        p.colors && p.colors.some(color => filters.colors.includes(color))
      );
    }
    
    // Beden filtresi
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(p => 
        p.sizes && p.sizes.some(size => filters.sizes.includes(size))
      );
    }
    
    // Cinsiyet filtresi
    if (filters.genders && filters.genders.length > 0) {
      filtered = filtered.filter(p => 
        p.gender && filters.genders.includes(p.gender)
      );
    }
    
    // Rating filtresi
    if (filters.ratings && filters.ratings.length > 0) {
      filtered = filtered.filter(p => 
        p.rating && filters.ratings.some((rating: number) => Math.floor(p.rating!) >= rating)
      );
    }
    
    return filtered;
  }
  
  private applySorting(products: Product[], sortBy?: string): Product[] {
    if (!sortBy) return products;
    
    const sorted = [...products];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      default:
        return sorted;
    }
  }

  getCategories(): Observable<any[]> {
    const categories = [
      { code: 'strollers', name: 'Bebek Arabaları', count: 2 },
      { code: 'food', name: 'Mama & Beslenme', count: 0 },
      { code: 'toys', name: 'Oyuncaklar', count: 2 },
      { code: 'feeding', name: 'Emzirme & Beslenme', count: 3 },
      { code: 'safety', name: 'Güvenlik', count: 0 },
      { code: 'care', name: 'Bakım & Hijyen', count: 2 },
      { code: 'car-seats', name: 'Oto Koltuğu', count: 1 },
      { code: 'diapers', name: 'Bez & Islak Mendil', count: 1 },
      { code: 'bath', name: 'Banyo', count: 1 },
      { code: 'sleep', name: 'Uyku', count: 0 }
    ];
    
    return of(categories).pipe(delay(200));
  }
  
  getBrands(): Observable<any[]> {
    const brands = [
      { code: 'chicco', name: 'Chicco', count: 3 },
      { code: 'bebeto', name: 'Bebeto', count: 1 },
      { code: 'johnson', name: 'Johnson\'s', count: 1 },
      { code: 'philips-avent', name: 'Philips Avent', count: 1 },
      { code: 'fisher-price', name: 'Fisher Price', count: 1 },
      { code: 'pampers', name: 'Pampers', count: 1 },
      { code: 'tommee-tippee', name: 'Tommee Tippee', count: 1 },
      { code: 'nuby', name: 'Nuby', count: 1 },
      { code: 'mam', name: 'MAM', count: 1 },
      { code: 'baby-dove', name: 'Baby Dove', count: 1 }
    ];
    
    return of(brands).pipe(delay(200));
  }

  // Hata simülasyonu için
  simulateError(): Observable<never> {
    return throwError(() => new Error('Simulated API Error'));
  }

  // Network gecikme simülasyonu
  simulateSlowNetwork(): Observable<ProductResponse> {
    return this.getProducts().pipe(delay(5000));
  }

  // Boş sonuç simülasyonu
  getEmptyResults(): Observable<ProductResponse> {
    return of({
      products: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 12
    }).pipe(delay(300));
  }

  // Çok fazla sonuç simülasyonu
  getLargeResultSet(): Observable<ProductResponse> {
    const largeProductList = [];
    for (let i = 0; i < 1000; i++) {
      const baseProduct = this.mockProducts[i % this.mockProducts.length];
      largeProductList.push({
        ...baseProduct,
        id: `${baseProduct.id}-${i}`,
        name: `${baseProduct.name} - Varyant ${i + 1}`
      });
    }

    return of({
      products: largeProductList.slice(0, 12),
      totalCount: largeProductList.length,
      currentPage: 1,
      pageSize: 12
    }).pipe(delay(800));
  }

  // Health check
  healthCheck(): Observable<boolean> {
    return of(true).pipe(delay(100));
  }
}