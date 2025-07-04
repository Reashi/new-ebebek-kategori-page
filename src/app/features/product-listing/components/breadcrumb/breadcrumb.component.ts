// src/app/features/product-listing/components/breadcrumb/breadcrumb.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductFilters } from '../../product/product.model';
import * as ProductSelectors from '../../product/product.selectors';

interface BreadcrumbItem {
  label: string;
  url?: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  })
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  filters$: Observable<ProductFilters>;
  totalCount$: Observable<number>;
  
  breadcrumbItems: BreadcrumbItem[] = [];
  selectedCategoryName = '';
  
  private categories = {
    'strollers': 'Bebek Arabaları',
    'food': 'Mama & Beslenme',
    'toys': 'Oyuncaklar',
    'feeding': 'Emzirme & Beslenme',
    'safety': 'Güvenlik',
    'care': 'Bakım & Hijyen',
    'car-seats': 'Oto Koltuğu',
    'diapers': 'Bez & Islak Mendil',
    'bath': 'Banyo',
    'sleep': 'Uyku'
  };

  constructor(private store: Store) {
    this.filters$ = this.store.select(ProductSelectors.selectProductFilters);
    this.totalCount$ = this.store.select(ProductSelectors.selectTotalCount);
  }

  ngOnInit() {
    this.filters$.pipe(takeUntil(this.destroy$)).subscribe(filters => {
      this.updateBreadcrumb(filters);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateBreadcrumb(filters: ProductFilters) {
    this.breadcrumbItems = [
      { label: 'Ana Sayfa', url: '/', active: false },
      { label: 'E-bebek', url: '/ebebek', active: false }
    ];

    if (filters.categoryId && this.categories[filters.categoryId as keyof typeof this.categories]) {
      this.selectedCategoryName = this.categories[filters.categoryId as keyof typeof this.categories];
      this.breadcrumbItems.push({
        label: this.selectedCategoryName,
        active: true
      });
    } else {
      this.selectedCategoryName = '';
      this.breadcrumbItems.push({
        label: 'Tüm Ürünler',
        active: true
      });
    }
  }
}