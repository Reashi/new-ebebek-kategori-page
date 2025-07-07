// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="app-container">
      <!-- Header Section -->
      <app-header></app-header>
      
      <!-- Main Content Area -->
      <main class="app-main">
        <!-- Router outlet - Burada ProductListingPageComponent render edilecek -->
        <router-outlet></router-outlet>
      </main>
      
      <!-- Footer Section -->
      <footer class="app-footer">
        <div class="footer-content">
          <div class="footer-info">
            <p>&copy; 2025 E-bebek. Tüm hakları saklıdır.</p>
            <div class="footer-links">
              <a href="/hakkimizda" class="footer-link">Hakkımızda</a>
              <a href="/iletisim" class="footer-link">İletişim</a>
              <a href="/gizlilik" class="footer-link">Gizlilik Politikası</a>
              <a href="/kullanim-kosullari" class="footer-link">Kullanım Koşulları</a>
            </div>
          </div>
          <div class="footer-social">
            <a href="#" class="social-link" aria-label="Facebook">📘</a>
            <a href="#" class="social-link" aria-label="Instagram">📷</a>
            <a href="#" class="social-link" aria-label="Twitter">🐦</a>
            <a href="#" class="social-link" aria-label="YouTube">📺</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
    }
    
    .app-main {
      flex: 1;
      background: #f8f9fa;
    }
    
    /* Footer Styles */
    .app-footer {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      padding: 30px 0 20px 0;
      margin-top: auto;
      box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .footer-info {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .footer-info p {
      margin: 0;
      font-size: 0.9em;
      opacity: 0.9;
    }

    .footer-links {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .footer-link {
      color: white;
      text-decoration: none;
      font-size: 0.85em;
      opacity: 0.8;
      transition: all 0.3s ease;
      padding: 5px 0;
    }

    .footer-link:hover {
      opacity: 1;
      color: #74b9ff;
      transform: translateY(-1px);
    }

    .footer-social {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      text-decoration: none;
      font-size: 1.2em;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .social-link:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-3px) scale(1.1);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        text-align: center;
        padding: 0 15px;
      }
      
      .footer-links {
        justify-content: center;
        gap: 15px;
      }
      
      .social-link {
        width: 35px;
        height: 35px;
        font-size: 1em;
      }
    }
  `]
})
export class AppComponent {
  title = 'ebebek-kategori-page';
}