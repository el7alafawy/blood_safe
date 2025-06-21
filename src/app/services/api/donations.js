import { api } from './config';

export const donationService = {
  // Create new donation
  create: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },

  // Get all donations with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/donations?${params}`);
    return response.data;
  },

  // Get nearby donation requests
  getNearby: async (location, maxDistance = 10000) => {
    const params = new URLSearchParams({
      longitude: location.longitude,
      latitude: location.latitude,
      maxDistance
    });
    const response = await api.get(`/donations/nearby?${params}`);
    return response.data;
  },

  // Update donation status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/donations/${id}/status`, { status });
    return response.data;
  },

  // Get donation by ID
  getById: async (id) => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  // Get donor's donations
  getDonorDonations: async (id) => {
    const response = await api.get(`/donations/user/${id}`);
    return response.data;
  },

  // Get hospital's donations
  getRecipientDonations: async (id) => {
    const response = await api.get(`/donations/recipient/${id}`);
    return response.data;
  },

  // Get donation statistics
  getStats: async () => {
    const response = await api.get('/donations/stats');
    return response.data;
  },
  // Delete a donation
  deleteDonation: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  }
}; 