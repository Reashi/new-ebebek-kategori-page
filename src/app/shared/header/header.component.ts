// src/app/shared/components/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Search functionality
  onSearch() {
    if (this.searchTerm.trim()) {
      console.log('Arama yapıldı:', this.searchTerm);
      // Burada arama işlemi yapılacak (NgRx action dispatch edilecek)
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

  // Category selection
  onCategorySelect(category: string) {
    console.log('Kategori seçildi:', category);
    this.closeAllDropdowns();
  }

  // Discover menu selection
  onKesfetSelect(item: string) {
    console.log('Keşfet item seçildi:', item);
    this.closeAllDropdowns();
  }

  // Gift menu selection
  onHediyeSelect(item: string) {
    console.log('Hediye item seçildi:', item);
    this.closeAllDropdowns();
  }
}