import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', 
});

// API를 호출할 때마다 알아서 토큰을 챙겨가는 설정
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;