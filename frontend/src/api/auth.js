import api from './axiosInstance.js';

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    // Clear local storage
    localStorage.removeItem('auth');
  },
  
  getCurrentUser: () => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
  }
};

