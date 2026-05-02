import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  // Check path to decide which token to use
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const token = isAdminPath 
    ? localStorage.getItem('adminToken') 
    : localStorage.getItem('employeeToken');
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
