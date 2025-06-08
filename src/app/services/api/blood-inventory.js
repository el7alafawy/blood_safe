import { api } from './config';

const bloodInventoryService = {
  // Get all inventory items
  getAll: async () => {
    const response = await api.get('/blood-inventory');
    return response.data;
  },

  // Get inventory by blood type
  getByBloodType: async (type) => {
    const response = await api.get(`/blood-inventory/blood-type/${type}`);
    return response.data;
  },

  // Add new blood inventory item
  add: async (data) => {
    const response = await api.post('/blood-inventory', data);
    return response.data;
  },

  // Update inventory item
  update: async (id, data) => {
    const response = await api.put(`/blood-inventory/${id}`, data);
    return response.data;
  },

  // Reserve blood units
  reserve: async (id, units) => {
    const response = await api.patch(`/blood-inventory/${id}/reserve`, { units });
    return response.data;
  },

  // Mark blood as used
  markAsUsed: async (id, units) => {
    const response = await api.patch(`/blood-inventory/${id}/use`, { units });
    return response.data;
  }
};

export { bloodInventoryService }; 