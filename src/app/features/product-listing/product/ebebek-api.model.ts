// src/app/features/product-listing/product/ebebek-api.model.ts

// E-bebek API Response Interfaces
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
import { Product } from './product.model';

export class EbebekProductMapper {
  static mapToProduct(ebebekProduct: EbebekProduct): Product {
    return {
      id: ebebekProduct.code,
      name: ebebekProduct.name,
      price: ebebekProduct.price.value,
      originalPrice: ebebekProduct.discountedPrice.value !== ebebekProduct.price.value 
        ? ebebekProduct.price.value 
        : undefined,
      description: ebebekProduct.summary,
      imageUrl: this.getMainImageUrl(ebebekProduct.images),
      categoryId: ebebekProduct.categoryCodes[0] || '',
      brandId: this.createBrandId(ebebekProduct.brandName),
      inStock: ebebekProduct.stock.stockLevelStatus === 'inStock',
      rating: ebebekProduct.averageRating,
      reviewCount: ebebekProduct.numberOfReviews,
      colors: this.extractColors(ebebekProduct.variantOptions),
      sizes: this.extractSizes(ebebekProduct.variantOptions),
      gender: this.extractGender(ebebekProduct.categories),
      isOnSale: ebebekProduct.discountRate > 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static getMainImageUrl(images: EbebekImage[]): string {
    const mainImage = images.find(img => img.imageType === 'PRIMARY') || images[0];
    return mainImage ? mainImage.url : '';
  }

  private static createBrandId(brandName: string): string {
    return brandName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private static extractColors(variantOptions: EbebekOption[]): string[] {
    const colorOption = variantOptions.find(option => 
      option.code.toLowerCase().includes('color') || 
      option.code.toLowerCase().includes('renk')
    );
    
    if (colorOption && colorOption.variantOptionQualifiers) {
      return colorOption.variantOptionQualifiers.map(qualifier => 
        this.mapColorName(qualifier.value)
      );
    }
    
    return [];
  }

  private static extractSizes(variantOptions: EbebekOption[]): string[] {
    const sizeOption = variantOptions.find(option => 
      option.code.toLowerCase().includes('size') || 
      option.code.toLowerCase().includes('beden') ||
      option.code.toLowerCase().includes('yas') ||
      option.code.toLowerCase().includes('ay')
    );
    
    if (sizeOption && sizeOption.variantOptionQualifiers) {
      return sizeOption.variantOptionQualifiers.map(qualifier => qualifier.value);
    }
    
    return [];
  }

  private static extractGender(categories: EbebekCategory[]): 'erkek' | 'kız' | 'unisex' {
    const categoryNames = categories.map(cat => cat.name.toLowerCase()).join(' ');
    
    if (categoryNames.includes('erkek') || categoryNames.includes('boy')) {
      return 'erkek';
    } else if (categoryNames.includes('kız') || categoryNames.includes('girl')) {
      return 'kız';
    }
    
    return 'unisex';
  }

  private static mapColorName(colorValue: string): string {
    const colorMap: { [key: string]: string } = {
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
      'krem': 'krem'
    };
    
    const lowerColor = colorValue.toLowerCase();
    return colorMap[lowerColor] || lowerColor;
  }
}