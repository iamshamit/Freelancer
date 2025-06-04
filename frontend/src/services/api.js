// frontend/src/services/api.js
import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API URL:', import.meta.env.VITE_API_URL);

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')).token
      : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper functions for token management
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

const removeAuthToken = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
};

// API service object
const api = {
  setAuthToken,
  removeAuthToken,
  
  // User endpoints
  user: {
    register: (userData) => axiosInstance.post('/users', userData).then(res => res.data),
    login: (email, password) => axiosInstance.post('/users/login', { email, password }),
    getProfile: () => axiosInstance.get('/users/profile').then(res => res.data),
    updateProfile: (userData) => axiosInstance.put('/users/profile', userData),
    uploadProfilePicture: (imageData) => axiosInstance.post('/users/profile/picture', { image: imageData }),
    getById: (id) => axiosInstance.get(`/users/${id}`).then(res => res.data)
  },
  
  // Job endpoints
  job: {
    create: (jobData) => axiosInstance.post('/jobs', jobData).then(res => res.data),
    getAll: (params) => axiosInstance.get('/jobs', { params }).then(res => res.data),
    getById: (id) => axiosInstance.get(`/jobs/${id}`).then(res => res.data),
    apply: (id) => axiosInstance.post(`/jobs/${id}/apply`).then(res => res.data),
    selectFreelancer: (jobId, freelancerId) => axiosInstance.put(`/jobs/${jobId}/select/${freelancerId}`).then(res => res.data),
    updateMilestone: (id, percentage) => axiosInstance.put(`/jobs/${id}/milestone`, { percentage }).then(res => res.data),
    getEmployerJobs: () => axiosInstance.get('/jobs/employer').then(res => res.data),
    getFreelancerJobs: () => axiosInstance.get('/jobs/freelancer').then(res => res.data),
    rateFreelancer: (id, rating, review) => axiosInstance.post(`/jobs/${id}/rate`, { rating, review }).then(res => res.data),
    getAppliedJobs: () => axiosInstance.get('/jobs/applied').then(res => res.data)
  },
  
  // Chat endpoints
  chat: {
    create: (jobId) => axiosInstance.post('/chats', { jobId }).then(res => res.data),
    getAll: () => axiosInstance.get('/chats').then(res => res.data),
    getArchived: () => axiosInstance.get('/chats/archived').then(res => res.data),
    getById: (id) => axiosInstance.get(`/chats/${id}`).then(res => res.data),
    sendMessage: (id, content) => axiosInstance.post(`/chats/${id}/messages`, { content }).then(res => res.data),
    archive: (id) => axiosInstance.put(`/chats/${id}/archive`).then(res => res.data)
  },
  
  // Notification endpoints
  notification: {
    getAll: () => axiosInstance.get('/notifications').then(res => res.data),
    getUnreadCount: () => axiosInstance.get('/notifications/unread-count').then(res => res.data),
    markAsRead: (id) => axiosInstance.put(`/notifications/${id}`),
    markAllAsRead: () => axiosInstance.put('/notifications/read-all')
  },

  // Domain endpoints
  domains: {
  getAll: () => axiosInstance.get('/domains').then(res => res.data),
  getById: (id) => axiosInstance.get(`/domains/${id}`).then(res => res.data),
  create: (domainData) => axiosInstance.post('/domains', domainData).then(res => res.data),
  update: (id, domainData) => axiosInstance.put(`/domains/${id}`, domainData).then(res => res.data)
  },
  
  // Milestone endpoints
  milestone: {
    create: (jobId, milestoneData) => axiosInstance.post(`/jobs/${jobId}/milestones`, { milestones: milestoneData }).then(res => res.data),
    update: (jobId, milestoneId, data) => axiosInstance.put(`/jobs/${jobId}/milestones/${milestoneId}`, data).then(res => res.data),
    delete: (jobId, milestoneId) => axiosInstance.delete(`/jobs/${jobId}/milestones/${milestoneId}`).then(res => res.data),
    requestApproval: (jobId, milestoneId) => axiosInstance.post(`/jobs/${jobId}/milestones/${milestoneId}/request-approval`).then(res => res.data),
    approve: (jobId, milestoneId, feedback) => axiosInstance.post(`/jobs/${jobId}/milestones/${milestoneId}/approve`, { feedback }).then(res => res.data),
    reject: (jobId, milestoneId, reason) => axiosInstance.post(`/jobs/${jobId}/milestones/${milestoneId}/reject`, { reason }).then(res => res.data),
    getAll: (jobId) => axiosInstance.get(`/jobs/${jobId}/milestones`).then(res => res.data),
    getById: (jobId, milestoneId) => axiosInstance.get(`/jobs/${jobId}/milestones/${milestoneId}`).then(res => res.data)
  },

  // Payment endpoints
  payment: {
    getHistory: (params) => axiosInstance.get('/payments/history', { params }).then(res => res.data),
    getReceipt: (paymentId) => axiosInstance.get(`/payments/${paymentId}/receipt`).then(res => res.data),
    getEscrowBalance: (jobId) => axiosInstance.get(`/jobs/${jobId}/escrow`).then(res => res.data),
    getTransactionDetails: (transactionId) => axiosInstance.get(`/payments/transaction/${transactionId}`).then(res => res.data),
    exportHistory: (format = 'csv') => axiosInstance.get(`/payments/export`, { params: { format },responseType: 'blob'}).then(res => res.data)
  }
};

export default api;