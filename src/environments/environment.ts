export const environment = {
  production: false,
  
  // E-bebek API Configuration
  ebebekApi: {
    baseUrl: 'https://api2.e-bebek.com/ebebekwebservices/v2/ebebek',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Feature Flags
  features: {
    enableLogging: true,
    enableApiMocking: false, // Gerçek API'yi kullan (false), Mock data için true yap
    enableAdvancedFilters: true,
    enableRecommendations: false,
    enableWishlist: true,
  },
  
  // Application Settings
  app: {
    name: 'E-bebek Kategori Page',
    version: '1.0.0',
    defaultPageSize: 12,
    maxPageSize: 48,
    cacheTtl: 300000, // 5 minutes
  },
  
  // UI Configuration
  ui: {
    theme: 'light',
    animations: true,
    enableAnalytics: false,
  }
};