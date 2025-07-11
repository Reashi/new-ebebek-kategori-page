# Environment Configuration Guide

## Overview
Bu proje farklı ortamlar için farklı konfigürasyonlar kullanır. API anahtarları ve hassas bilgiler environment dosyalarında saklanır.

## Environment Files

### 1. `environment.ts` (Development)
- Development ortamı için varsayılan konfigürasyon
- Loglama ve debug araçları aktif
- Development API token'ı içerir

### 2. `environment.prod.ts` (Production)
- Production ortamı için konfigürasyon
- Loglama kapalı, performans odaklı
- Production API token'ı environment variable'dan alınmalı

### 3. `environment.local.ts` (Local Development - Git Ignored)
- Yerel geliştirme için kişisel konfigürasyon
- Git'e commitlenmez (.gitignore'da)
- Kişisel API token'ları için güvenli

### 4. `environment.staging.ts` (Staging)
- Test ortamı için konfigürasyon
- Production benzeri ayarlar ama test API'si

## Setup Instructions

### Local Development İçin

1. `src/environments/environment.local.ts` dosyasını oluşturun:

```typescript
export const environment = {
  production: false,
  ebebekApi: {
    baseUrl: 'https://api2.e-bebek.com/ebebekwebservices/v2/ebebek',
    authToken: 'YOUR_PERSONAL_API_TOKEN_HERE',
    timeout: 30000
  },
  features: {
    enableLogging: true,
    enableDebugTools: true
  }
};
```

2. Angular CLI konfigürasyonunu güncelleyin (`angular.json`):

```json
{
  "configurations": {
    "local": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.local.ts"
        }
      ]
    }
  }
}
```

3. Local environment ile çalıştırın:
```bash
ng serve --configuration=local
```

### Production İçin

Production'da API token'ı environment variable olarak ayarlayın:

```bash
# Docker
ENV EBEBEK_API_TOKEN=your_production_token

# Kubernetes
env:
  - name: EBEBEK_API_TOKEN
    valueFrom:
      secretKeyRef:
        name: api-secrets
        key: ebebek-token

# Heroku
heroku config:set EBEBEK_API_TOKEN=your_production_token
```

## Security Best Practices

### ✅ DO (Yapılması Gerekenler)
- API token'ları environment dosyalarında saklayın
- Sensitive dosyaları `.gitignore`'a ekleyin
- Production'da environment variable kullanın
- Token'ları düzenli olarak rotate edin

### ❌ DON'T (Yapılmaması Gerekenler)
- API token'ları kaynak kodda hardcode etmeyin
- Sensitive dosyaları Git'e commit etmeyin
- Token'ları log'larda yazdırmayın
- Token'ları frontend'de expose etmeyin

## Environment Variables

### Development
```bash
EBEBEK_API_TOKEN=dev_token_here
EBEBEK_API_BASE_URL=https://api2.e-bebek.com/ebebekwebservices/v2/ebebek
ENABLE_LOGGING=true
```

### Production
```bash
EBEBEK_API_TOKEN=prod_token_here
EBEBEK_API_BASE_URL=https://api2.e-bebek.com/ebebekwebservices/v2/ebebek
ENABLE_LOGGING=false
```

## Build Commands

```bash
# Development
ng build

# Production
ng build --configuration=production

# Staging
ng build --configuration=staging

# Local
ng build --configuration=local
```

## Troubleshooting

### API Token Hatası
```
E-bebek API auth token is not configured. API calls may fail.
```

**Çözüm**: Environment dosyanızda `authToken` değerini kontrol edin.

### CORS Hatası
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Çözüm**: Proxy konfigürasyonu ekleyin (`proxy.conf.json`):

```json
{
  "/api/*": {
    "target": "https://api2.e-bebek.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Timeout Hatası
```
İstek zaman aşımına uğradı (30000ms)
```

**Çözüm**: Environment'da `timeout` değerini artırın.

## Configuration Schema

```typescript
interface Environment {
  production: boolean;
  ebebekApi: {
    baseUrl: string;
    authToken: string;
    timeout: number;
  };
  features: {
    enableLogging: boolean;
    enableDebugTools: boolean;
  };
}
```

## CI/CD Integration

### GitHub Actions
```yaml
env:
  EBEBEK_API_TOKEN: ${{ secrets.EBEBEK_API_TOKEN }}
```

### GitLab CI
```yaml
variables:
  EBEBEK_API_TOKEN: $EBEBEK_API_TOKEN
```

## Monitoring

Production'da API çağrılarını izlemek için:

```typescript
// Error tracking
if (environment.production) {
  // Sentry, LogRocket vb. integration
}

// Performance monitoring
if (environment.features.enableLogging) {
  console.log('API call metrics:', metrics);
}
```