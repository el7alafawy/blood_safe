import { api } from './config';

export const userService = {

  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.patch('/users/me', userData);
    return response.data;
  },

  // Get all donors (for admin/hospital)
  getDonors: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/users/donors?${params}`);
    return response.data;
  },

  // Get nearby donors
  getNearbyDonors: async (location, bloodType, maxDistance = 10000) => {
    const params = new URLSearchParams({
      longitude: location.longitude,
      latitude: location.latitude,
      maxDistance,
      ...(bloodType && { bloodType })
    });
    const response = await api.get(`/users/donors/nearby?${params}`);
    return response.data;
  },

  // Update donor availability
  updateAvailability: async (isAvailable) => {
    const response = await api.patch('/users/me/availability', { isAvailable });
    return response.data;
  },

  // Get user statistics (admin only)
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Get donor statistics
  getDonorStats: async () => {
    const response = await api.get('/users/me/stats');
    return response.data;
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await api.delete('/users/me');
    return response.data;
  }
}; 