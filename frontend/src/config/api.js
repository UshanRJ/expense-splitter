// Create this file: frontend/src/config/api.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api'
  },
  production: {
    API_BASE_URL: 'https://your-backend-url.herokuapp.com/api' // We'll update this
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;

// Usage: Replace all instances of 'http://localhost:5000/api' with this import
// import { API_BASE_URL } from '../config/api';