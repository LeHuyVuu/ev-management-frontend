// src/config/api.js
const api = {
  dealer: import.meta.env.VITE_API_DEALER,
  customer: import.meta.env.VITE_API_CUSTOMER,
  financial: import.meta.env.VITE_API_FINANCIAL,
  brand: import.meta.env.VITE_API_BRAND,
  utility: import.meta.env.VITE_API_UTILITY,
  identity: import.meta.env.VITE_API_IDENTITY,
  // Order / TestDrive service
  order: import.meta.env.VITE_API_ORDER,
};

export default api;
