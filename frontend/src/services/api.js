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
    register: (userData) => axiosInstance.post('/users', userData),
    login: (email, password) => axiosInstance.post('/users/login', { email, password }),
    getProfile: () => axiosInstance.get('/users/profile'),
    updateProfile: (userData) => axiosInstance.put('/users/profile', userData),
    uploadProfilePicture: (imageData) => axiosInstance.post('/users/profile/picture', { image: imageData }),
    getById: (id) => axiosInstance.get(`/users/${id}`)
  },
  
  // Job endpoints
  job: {
    create: (jobData) => axiosInstance.post('/jobs', jobData),
    getAll: (params) => axiosInstance.get('/jobs', { params }),
    getById: (id) => axiosInstance.get(`/jobs/${id}`),
    apply: (id) => axiosInstance.post(`/jobs/${id}/apply`),
    selectFreelancer: (jobId, freelancerId) => axiosInstance.put(`/jobs/${jobId}/select/${freelancerId}`),
    updateMilestone: (id, percentage) => axiosInstance.put(`/jobs/${id}/milestone`, { percentage }),
    getEmployerJobs: () => axiosInstance.get('/jobs/employer'),
    getFreelancerJobs: () => axiosInstance.get('/jobs/freelancer'),
    rateFreelancer: (id, rating, review) => axiosInstance.post(`/jobs/${id}/rate`, { rating, review }),
    getDomains: () => axiosInstance.get('/jobs/domains')
  },
  
  // Chat endpoints
  chat: {
    create: (jobId) => axiosInstance.post('/chats', { jobId }),
    getAll: () => axiosInstance.get('/chats'),
    getArchived: () => axiosInstance.get('/chats/archived'),
    getById: (id) => axiosInstance.get(`/chats/${id}`),
    sendMessage: (id, content) => axiosInstance.post(`/chats/${id}/messages`, { content }),
    archive: (id) => axiosInstance.put(`/chats/${id}/archive`)
  },
  
  // Notification endpoints
  notification: {
    getAll: () => axiosInstance.get('/notifications'),
    getUnreadCount: () => axiosInstance.get('/notifications/unread-count'),
    markAsRead: (id) => axiosInstance.put(`/notifications/${id}`),
    markAllAsRead: () => axiosInstance.put('/notifications/read-all')
  }
};

export default api;