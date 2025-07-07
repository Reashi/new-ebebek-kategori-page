// src/app/features/product-listing/components/product-card/product-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../product/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list-item.component.html',
  styleUrl: './product-list-item.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() loading = false;
  
  @Output() productClick = new EventEmitter<string>();
  @Output() addToCart = new EventEmitter<string>();
  @Output() addToFavorites = new EventEmitter<string>();

  // Color mapping for displaying colors
  private colorMap: { [key: string]: { name: string; hex: string } } = {
    'kirmizi': { name: 'Kırmızı', hex: '#e74c3c' },
    'mavi': { name: 'Mavi', hex: '#3498db' },
    'yesil': { name: 'Yeşil', hex: '#27ae60' },
    'sari': { name: 'Sarı', hex: '#f1c40f' },
    'pembe': { name: 'Pembe', hex: '#e91e63' },
    'mor': { name: 'Mor', hex: '#9b59b6' },
    'turuncu': { name: 'Turuncu', hex: '#e67e22' },
    'kahverengi': { name: 'Kahverengi', hex: '#8d6e63' },
    'gri': { name: 'Gri', hex: '#95a5a6' },
    'siyah': { name: 'Siyah', hex: '#2c3e50' },
    'beyaz': { name: 'Beyaz', hex: '#ecf0f1' },
    'lacivert': { name: 'Lacivert', hex: '#2c3e50' },
    'bordo': { name: 'Bordo', hex: '#8e44ad' },
    'turkuaz': { name: 'Turkuaz', hex: '#1abc9c' },
    'krem': { name: 'Krem', hex: '#f5f5dc' },
    'gold': { name: 'Gold', hex: '#ffd700' },
    'gumush': { name: 'Gümüş', hex: '#c0c0c0' },
    'pastel-mavi': { name: 'Pastel Mavi', hex: '#add8e6' }
  };

  // Brand mapping
  private brandMap: { [key: string]: string } = {
    'chicco': 'Chicco',
    'bebeto': 'Bebeto',
    'mama-papa': 'Mama Papa',
    'johnson': 'Johnson\'s',
    'philips-avent': 'Philips Avent',
    'tommee-tippee': 'Tommee Tippee',
    'nuby': 'Nuby',
    'mam': 'MAM'
  };

  onProductClick() {
    if (!this.loading) {
      this.productClick.emit(this.product.id);
    }
  }

  onAddToCart(event: Event) {
    event.stopPropagation();
    if (this.product.inStock && !this.loading) {
      this.addToCart.emit(this.product.id);
    }
  }

  onAddToFavorites(event: Event) {
    event.stopPropagation();
    if (!this.loading) {
      this.addToFavorites.emit(this.product.id);
    }
  }

  hasDiscount(): boolean {
    return !!(this.product.originalPrice && this.product.isOnSale && 
             this.product.originalPrice > this.product.price);
  }

  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(((this.product.originalPrice! - this.product.price) / this.product.originalPrice!) * 100);
  }

  getBrandName(): string {
    return this.brandMap[this.product.brandId] || this.product.brandId;
  }

  getColorName(colorId: string): string {
    return this.colorMap[colorId]?.name || colorId;
  }

  getColorHex(colorId: string): string {
    return this.colorMap[colorId]?.hex || '#cccccc';
  }

  getStarsArray(): { filled: boolean }[] {
    const rating = this.product.rating || 0;
    return Array.from({ length: 5 }, (_, i) => ({
      filled: i < Math.floor(rating)
    }));
  }

  getProductAriaLabel(): string {
    let label = `${this.product.name}, ${this.product.price} TL`;
    
    if (this.hasDiscount()) {
      label += `, ${this.getDiscountPercentage()}% indirimli`;
    }
    
    if (this.product.rating) {
      label += `, ${this.product.rating} yıldız`;
    }
    
    if (!this.product.inStock) {
      label += ', stokta yok';
    }
    
    return label;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }
}