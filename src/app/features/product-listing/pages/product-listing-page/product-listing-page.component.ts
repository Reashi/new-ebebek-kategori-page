import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';

@Component({
  selector: 'app-product-listing-page',
  standalone: true,
  // Oluşturduğumuz component'leri buraya import ediyoruz
  imports: [CommonModule, BreadcrumbComponent, FilterSidebarComponent, ProductListComponent],
  templateUrl: './product-listing-page.component.html',
  styleUrl: './product-listing-page.component.scss'
})
export class ProductListingPageComponent { }