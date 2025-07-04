// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductListComponent } from '../app/features/product-listing/components/product-list/product-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProductListComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1>E-bebek Kategori Sayfası</h1>
          <p>Angular 19 + NgRx ile State Management</p>
        </div>
      </header>
      
      <main class="app-main">
        <app-product-list></app-product-list>
        <router-outlet />
      </main>
      
      <footer class="app-footer">
        <p>&copy; 2025 E-bebek. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 0;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .header-content h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
      font-weight: 300;
    }
    
    .header-content p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1em;
    }
    
    .app-main {
      flex: 1;
      background: #f8f9fa;
    }
    
    .app-footer {
      background: #2c3e50;
      color: white;
      text-align: center;
      padding: 20px 0;
      margin-top: auto;
    }
    
    .app-footer p {
      margin: 0;
    }
  `]
})
export class AppComponent {
  title = 'ebebek-kategori-page';
}