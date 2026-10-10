import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const issueService = {
  list: (params) => api.get('/issues', { params }).then((r) => r.data),
  getById: (id) => api.get(`/issues/${id}`).then((r) => r.data),
  getByTrackingId: (trackingId) =>
    api.get(`/issues/track/${trackingId}`).then((r) => r.data),
  create: (data) => api.post('/issues', data).then((r) => r.data),
  update: (id, data) => api.patch(`/issues/${id}`, data).then((r) => r.data),
  updateStatus: (id, data) =>
    api.patch(`/issues/${id}/status`, data).then((r) => r.data),
  remove: (id) => api.delete(`/issues/${id}`).then((r) => r.data),
};

export const categoryService = {
  list: (params) => api.get('/categories', { params }).then((r) => r.data),
  create: (data) => api.post('/categories', data).then((r) => r.data),
  update: (id, data) => api.patch(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const dashboardService = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
};
