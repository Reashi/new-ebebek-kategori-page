# E-bebek Kategori Sayfası Yeniden Tasarımı

## Proje Hakkında
Bu proje, E-bebek'in kategori sayfasının modern ve kullanıcı dostu bir şekilde yeniden tasarlanmış versiyonudur. Angular framework'ü kullanılarak geliştirilmiştir ve duyarlı (responsive) tasarım prensipleriyle her ekran boyutuna uyum sağlamaktadır.

## Özellikler

### 🛍️ Ürün Listeleme
- Grid ve liste görünüm seçenekleri
- Sayfalama desteği
- Yükleme durumu gösterimi
- Hata durumu yönetimi
- Görsel odaklı ürün kartları

### 🔍 Filtreleme Özellikleri
- Kategori bazlı filtreleme
- Fiyat aralığı filtreleme
- Marka filtreleme
- Renk seçenekleri
- Yaş grubu/beden filtreleme
- Puan bazlı filtreleme
- Stok durumu filtreleme
- İndirimli ürün filtreleme

### 📊 Sıralama Seçenekleri
- İsme göre sıralama
- Fiyat (artan/azalan)
- Puana göre sıralama
- En yeni ürünler
- Çok satanlar
- En çok değerlendirilenler
- En yüksek indirim oranı

### 🧭 Navigasyon
- Ekmek kırıntısı (breadcrumb) navigasyonu
- Kategoriler arası kolay geçiş
- Ana kategoriler için hızlı erişim

## Teknolojik Altyapı

### 🛠️ Kullanılan Teknolojiler
- Angular 17+
- TypeScript
- SCSS
- NgRx (State Management)
- RxJS

### 📦 Bağımlılıklar
- @angular/core
- @angular/common
- @angular/forms
- @ngrx/store
- @ngrx/effects

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- Angular CLI 17+
- npm veya yarn

### Kurulum Adımları

1. Projeyi klonlayın:
```bash
git clone https://github.com/Reashi/new-ebebek-kategori-page.git
cd new-ebebek-kategori-page
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm start
```

Uygulama varsayılan olarak http://localhost:4200 adresinde çalışacaktır.

## Ortam Yapılandırması

### Ortam Dosyaları
- `environment.ts` - Geliştirme ortamı
- `environment.prod.ts` - Üretim ortamı
- `environment.staging.ts` - Test ortamı

### API Yapılandırması
```typescript
export const environment = {
  production: false,
  ebebekApi: {
    baseUrl: 'https://api2.e-bebek.com/ebebekwebservices/v2/ebebek',
    timeout: 30000
  }
};
```

## Geliştirici Kılavuzu

### 📂 Proje Yapısı
```
src/
├── app/
│   ├── features/
│   │   └── product-listing/
│   │       ├── components/
│   │       │   ├── breadcrumb/
│   │       │   ├── filter-sidebar/
│   │       │   ├── product-list/
│   │       │   └── product-list-item/
│   │       ├── pages/
│   │       └── product/
│   ├── shared/
│   │   └── header/
│   └── app.component.ts
└── environments/
```

### 🔄 State Management
NgRx kullanılarak yönetilen state'ler:
- Ürün listesi
- Filtreler
- Sıralama
- Sayfalama
- Yükleme durumları
- Hata durumları

## Derleme ve Deployment

### Geliştirme Derlemesi
```bash
ng serve
```

### Üretim Derlemesi
```bash
ng build --configuration=production
```

### Test Derlemesi
```bash
ng build --configuration=staging
```

## Test

### Unit Testler
```bash
ng test
```

### End-to-End Testler
```bash
ng e2e
```

## Katkıda Bulunma
1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'Add some amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans
Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim
Proje sorumlusu: E-bebek Development Team