export const environment = {
  production: false,
  
  // E-bebek API Configuration (mock modunda kullanılmaz)
  ebebekApi: {
    baseUrl: '', // Mock modunda boş bırakılabilir
    timeout: 30000,
    retryAttempts: 1,
    retryDelay: 500,
  },
  
  // Feature Flags
  features: {
    enableLogging: true,
    enableApiMocking: true, // Mock data kullan
    enableAdvancedFilters: true,
    enableRecommendations: true,
    enableWishlist: true,
  },
  
  // Application Settings
  app: {
    name: 'E-bebek Kategori Page (Dev)',
    version: '1.0.0-dev',
    defaultPageSize: 12,
    maxPageSize: 48,
    cacheTtl: 60000, // 1 minute for development
  },
  
  // UI Configuration
  ui: {
    theme: 'light',
    animations: true,
    enableAnalytics: false,
  }
};
