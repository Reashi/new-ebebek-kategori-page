import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import * as ProductActions from '../../product/product.actions';
import * as ProductSelectors from '../../product/product.selectors';

interface SortOption {
  code: string;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-product-listing-page',
  standalone: true,
  // Oluşturduğumuz component'leri buraya import ediyoruz
  imports: [CommonModule, FormsModule, BreadcrumbComponent, FilterSidebarComponent, ProductListComponent],
  templateUrl: './product-listing-page.component.html',
  styleUrl: './product-listing-page.component.scss'
})
export class ProductListingPageComponent implements OnInit {
  
  sortBy = 'relevance';
  sortOptions$: Observable<SortOption[]>;
  
  constructor(private store: Store) {
    this.sortOptions$ = this.store.select(ProductSelectors.selectSortOptions);
  }
  
  ngOnInit() {
    // Sayfa yüklendiğinde ürünleri ve filtre seçeneklerini yükle
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(ProductActions.loadFilterOptions());
  }
  
  onSortChange() {
    console.log('Sort by:', this.sortBy);
    this.store.dispatch(ProductActions.setSortBy({ sortBy: this.sortBy }));
  }
}