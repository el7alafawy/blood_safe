import { api } from './config';

export const hospitalService = {
  // Get all hospitals (admin only)
  getAll: async () => {
    const response = await api.get('/hospitals');
    return response.data;
  },

  // Get hospital profile
  getProfile: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  },

  // Update hospital profile
  updateProfile: async (id, hospitalData) => {
    const response = await api.patch(`/hospitals/${id}`, hospitalData);
    return response.data;
  },

  // Get hospital's blood requests
  getBloodRequests: async (id) => {
    const response = await api.get(`/users/hospitals/${id}/blood-requests`);
    return response.data;
  },

  // Get hospital's donations
  getDonations: async (id) => {
    const response = await api.get(`/hospitals/${id}/donations`);
    return response.data;
  },

  // Get hospital statistics
  getStats: async (id) => {
    const response = await api.get(`/hospitals/${id}/stats`);
    return response.data;
  },

  // Get nearby hospitals
  getNearby: async (location, maxDistance = 10000) => {
    const params = new URLSearchParams({
      longitude: location.longitude,
      latitude: location.latitude,
      maxDistance
    });
    const response = await api.get(`/hospitals/nearby?${params}`);
    return response.data;
  }
}; 