import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import * as ProductActions from '../../product/product.actions';

@Component({
  selector: 'app-product-listing-page',
  standalone: true,
  // Oluşturduğumuz component'leri buraya import ediyoruz
  imports: [CommonModule, BreadcrumbComponent, FilterSidebarComponent, ProductListComponent],
  templateUrl: './product-listing-page.component.html',
  styleUrl: './product-listing-page.component.scss'
})
export class ProductListingPageComponent implements OnInit {
  
  constructor(private store: Store) {}
  
  ngOnInit() {
    // Sayfa yüklendiğinde ürünleri ve filtre seçeneklerini yükle
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(ProductActions.loadFilterOptions());
  }
}