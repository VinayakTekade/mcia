import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// For MVP we auto-login a developer
let token = localStorage.getItem('token');

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async () => {
  const res = await axios.post(`${API_URL}/auth/login`, {
    email: 'dev@company.com',
    password: 'password'
  });
  token = res.data.token;
  localStorage.setItem('token', token!);
  return res.data;
};

export const getServices = () => api.get('/services').then(r => r.data);
export const getDependencies = () => api.get('/dependencies').then(r => r.data);
export const getChangeRequests = () => api.get('/changes').then(r => r.data);
export const createChangeRequest = (data: any) => api.post('/changes', data).then(r => r.data);
