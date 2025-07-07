// src/app/shared/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../features/product-listing/product/product.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  searchTerm = '';
  
  // Dropdown states
  isKategorilerDropdownOpen = false;
  isKesfetDropdownOpen = false;
  isHediyeDropdownOpen = false;

  constructor(private store: Store) {}

  // Search functionality
  onSearch() {
    if (this.searchTerm.trim()) {
      console.log('Arama yapıldı:', this.searchTerm);
      // NgRx store'a search action dispatch et
      this.store.dispatch(ProductActions.searchProducts({ searchTerm: this.searchTerm.trim() }));
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  // Button click handlers
  onFavoritesClick() {
    console.log('Favoriler tıklandı');
  }

  onAccountClick() {
    console.log('Hesabım tıklandı');
  }

  onCartClick() {
    console.log('Sepetim tıklandı');
  }

  onInternetOzelClick() {
    console.log('İnternete Özel Ürünler tıklandı');
  }

  onKampanyalarClick() {
    console.log('Kampanyalar tıklandı');
  }

  onOutletClick() {
    console.log('Outlet tıklandı');
  }

  onSiparisimNeredeClick() {
    console.log('Siparişim Nerede tıklandı');
  }

  onEnYakinEbebekClick() {
    console.log('En Yakın E-bebek tıklandı');
  }

  // Dropdown toggle methods
  toggleKategorilerDropdown() {
    this.isKategorilerDropdownOpen = !this.isKategorilerDropdownOpen;
    this.isKesfetDropdownOpen = false;
    this.isHediyeDropdownOpen = false;
  }

  toggleKesfetDropdown() {
    this.isKesfetDropdownOpen = !this.isKesfetDropdownOpen;
    this.isKategorilerDropdownOpen = false;
    this.isHediyeDropdownOpen = false;
  }

  toggleHediyeDropdown() {
    this.isHediyeDropdownOpen = !this.isHediyeDropdownOpen;
    this.isKategorilerDropdownOpen = false;
    this.isKesfetDropdownOpen = false;
  }

  // Close all dropdowns when clicking outside
  closeAllDropdowns() {
    this.isKategorilerDropdownOpen = false;
    this.isKesfetDropdownOpen = false;
    this.isHediyeDropdownOpen = false;
  }

  // Category selection - dispatch category filter
  onCategorySelect(categoryId: string) {
    console.log('Kategori seçildi:', categoryId);
    
    // Kategori ID'sini internal format'a çevir
    const categoryMapping: { [key: string]: string } = {
      'bebek-arabalari': 'strollers',
      'mama-beslenme': 'food',
      'oyuncaklar': 'toys',
      'emzirme-beslenme': 'feeding',
      'guvenlik': 'safety',
      'bakim-hijyen': 'care',
      'oto-koltugu': 'car-seats',
      'bez-islak-mendil': 'diapers'
    };

    const internalCategoryId = categoryMapping[categoryId];
    if (internalCategoryId) {
      this.store.dispatch(ProductActions.setFilters({ 
        filters: { categoryId: internalCategoryId } 
      }));
    }
    
    this.closeAllDropdowns();
  }

  // Discover menu selection
  onKesfetSelect(item: string) {
    console.log('Keşfet item seçildi:', item);
    
    // Keşfet seçeneklerine göre filtreler uygula
    switch(item) {
      case 'yeni-urunler':
        this.store.dispatch(ProductActions.setFilters({
          filters: { isNew: true }
        }));
        break;
      case 'en-cok-satanlar':
        this.store.dispatch(ProductActions.setSortBy({ sortBy: 'popularity' }));
        break;
      case 'blog':
        // Blog sayfasına yönlendir
        console.log('Blog sayfasına git');
        break;
      case 'anne-baba-rehberi':
        // Rehber sayfasına yönlendir
        console.log('Anne baba rehberine git');
        break;
    }
    
    this.closeAllDropdowns();
  }

  // Gift menu selection
  onHediyeSelect(item: string) {
    console.log('Hediye item seçildi:', item);
    
    // Hediye seçeneklerine göre filtreler uygula
    switch(item) {
      case 'hediye-seti':
        this.store.dispatch(ProductActions.searchProducts({ searchTerm: 'hediye seti' }));
        break;
      case 'hediye-karti':
        // Hediye kartı sayfasına yönlendir
        console.log('Hediye kartı sayfasına git');
        break;
      case 'dogum-gunleri':
        this.store.dispatch(ProductActions.searchProducts({ searchTerm: 'doğum günü' }));
        break;
      case 'ozel-gunler':
        this.store.dispatch(ProductActions.searchProducts({ searchTerm: 'özel gün' }));
        break;
    }
    
    this.closeAllDropdowns();
  }
}