// frontend/src/config/api.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api'
  },
  production: {
    API_BASE_URL: 'https://expense-splitter.up.railway.app/api' // ✅ Updated with your Railway URL
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;

// Debug logging (optional - remove in production)
console.log(`🌐 Environment: ${environment}`);
console.log(`🔗 API Base URL: ${config[environment].API_BASE_URL}`);