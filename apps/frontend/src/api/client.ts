import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: '/api',
});

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }).then(r => r.data),
  profile: () => apiClient.get('/auth/profile').then(r => r.data),
};

// --- Services ---
export const servicesApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/services', { params }).then(r => r.data),
  get: (id: string) => apiClient.get(`/services/${id}`).then(r => r.data),
  create: (data: any) => apiClient.post('/services', data).then(r => r.data),
  update: (id: string, data: any) => apiClient.put(`/services/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/services/${id}`),
};

// --- Dependencies ---
export const dependenciesApi = {
  list: () => apiClient.get('/dependencies').then(r => r.data),
  graph: () => apiClient.get('/dependencies/graph').then(r => r.data),
  upstream: (serviceId: string) => apiClient.get(`/dependencies/${serviceId}/upstream`).then(r => r.data),
  downstream: (serviceId: string) => apiClient.get(`/dependencies/${serviceId}/downstream`).then(r => r.data),
  create: (data: any) => apiClient.post('/dependencies', data).then(r => r.data),
};

// --- Change Requests ---
export const changesApi = {
  list: () => apiClient.get('/changes').then(r => r.data),
  get: (id: string) => apiClient.get(`/changes/${id}`).then(r => r.data),
  createDraft: (data: any) => apiClient.post('/changes/draft', data).then(r => r.data),
  submit: (id: string) => apiClient.post(`/changes/${id}/submit`).then(r => r.data),
  review: (id: string, data: any) => apiClient.post(`/changes/${id}/review`, data).then(r => r.data),
};

// --- Impact ---
export const impactApi = {
  generate: (data: any) => apiClient.post('/impact/generate', data).then(r => r.data),
  get: (changeRequestId: string) => apiClient.get(`/impact/${changeRequestId}`).then(r => r.data),
};

// --- Notifications ---
export const notificationsApi = {
  list: (userId: string) => apiClient.get('/notifications', { params: { userId } }).then(r => r.data),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`).then(r => r.data),
  markUnread: (id: string) => apiClient.patch(`/notifications/${id}/unread`).then(r => r.data),
};
