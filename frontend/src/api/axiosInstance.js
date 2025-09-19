import axios from "axios";
import API_CONFIG from "../config/api.js";

// Get API URL from config or env
const API_BASE_URL = API_CONFIG.getApiUrl() || import.meta.env.VITE_API_URL;

console.log("API Base URL:", API_BASE_URL); // Debug log

// Use the correct baseURL
const api = axios.create({
  baseURL: API_BASE_URL,  // <-- FIXED
  withCredentials: true,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    const { token } = JSON.parse(auth);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
