// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://api2.e-bebek.com/ebebekwebservices/v2/ebebek',
  authToken: 'YexaGFIQHA5pajDkyBmYSmyaHoo', // Bu token'ı güvenli bir şekilde saklayın
  enableLogging: true,
  enableDevTools: true
};

// src/environments/environment.prod.ts
export const environmentProd = {
  production: true,
  apiUrl: 'https://api2.e-bebek.com/ebebekwebservices/v2/ebebek',
  authToken: process.env['EBEBEK_API_TOKEN'] || '', // Production'da environment variable'dan alın
  enableLogging: false,
  enableDevTools: false
};