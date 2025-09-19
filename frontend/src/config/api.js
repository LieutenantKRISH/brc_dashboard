// API Configuration
const API_CONFIG = {
  // Development
  development: "https://brc-dashboard-lgas.onrender.com/api",
  
  // Production - Your actual backend URL
  production: "https://brc-dashboard-lgas.onrender.com/api",
  
  // Get current environment
  getCurrentEnv: () => {
    return import.meta.env.MODE || 'development';
  },
  
  // Get API URL based on environment
  getApiUrl: () => {
    const env = API_CONFIG.getCurrentEnv();
    return API_CONFIG[env] || API_CONFIG.development;
  }
};

export default API_CONFIG;
