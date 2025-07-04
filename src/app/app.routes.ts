import { Routes } from '@angular/router';
import { ProductListingPageComponent } from './features/product-listing/pages/product-listing-page/product-listing-page.component';

export const routes: Routes = [
  {
    path: '', // Ana yol
    component: ProductListingPageComponent // Bu component'i göster
  },
  // Diğer route'lar ileride buraya eklenebilir
  // { path: 'product/:id', component: ProductDetailPageComponent }
];