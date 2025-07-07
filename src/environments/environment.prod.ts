export const environment = {
  production: true,
  ebebekApi: {
    baseUrl: 'https://api2.e-bebek.com/ebebekwebservices/v2/ebebek',
    authToken: '', // Production token - should be set from environment variables
    timeout: 15000
  },
  features: {
    enableLogging: false,
    enableDebugTools: false
  }
};