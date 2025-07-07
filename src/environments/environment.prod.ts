export const environment = {
  production: true,
  
  // E-bebek API Configuration
  ebebekApi: {
    baseUrl: 'https://api2.e-bebek.com/ebebekwebservices/v2/ebebek',
    timeout: 10000, // 10 seconds for production
    retryAttempts: 2,
    retryDelay: 500,
  },
  
  // Feature Flags
  features: {
    enableLogging: false, // Disable in production
    enableApiMocking: false,
    enableAdvancedFilters: true,
    enableRecommendations: true,
    enableWishlist: true,
  },
  
  // Application Settings
  app: {
    name: 'E-bebek Kategori Page',
    version: '1.0.0',
    defaultPageSize: 12,
    maxPageSize: 48,
    cacheTtl: 600000, // 10 minutes in production
  },
  
  // UI Configuration
  ui: {
    theme: 'light',
    animations: true,
    enableAnalytics: true,
  }
};