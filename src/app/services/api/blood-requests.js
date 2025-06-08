import { api } from './config';

export const bloodRequestService = {
  // Create new blood request (Hospital only)
  create: async (requestData) => {
    const response = await api.post('/blood-requests', requestData);
    return response.data;
  },

  // Get all blood requests with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/blood-requests?${params}`);
    return response.data;
  },

  // Get blood request by ID
  getById: async (id) => {
    const response = await api.get(`/blood-requests/${id}`);
    return response.data;
  },

  // Get user's blood requests
  getUserRequests: async () => {
    // The backend will automatically filter requests based on the authenticated user's ID
    const response = await api.get('/blood-requests', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Update blood request 
  update: async (id, requestData) => {
    const response = await api.put(`/blood-requests/${id}`, requestData);
    return response.data;
  },

  // Cancel blood request 
  cancel: async (id) => {
    const response = await api.patch(`/blood-requests/${id}/cancel`);
    return response.data;
  },

  // Delete blood request (Admin only)
  delete: async (id) => {
    const response = await api.delete(`/blood-requests/${id}`);
    return response.data;
  },

  // Get blood request statistics
  getStats: async () => {
    const response = await api.get('/blood-requests/stats');
    return response.data;
  }
}; 