'use client'
import React, { useState, useEffect } from 'react';
import { authService, bloodInventoryService } from '../../../services/api';
import { Droplet, AlertTriangle, Plus } from 'lucide-react';
import Dialog from '../../dialogs/Dialog';

const HospitalInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    availableUnits: '',
    expiryDate: '',
    status: 'AVAILABLE',
    source: 'DONATION'
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await bloodInventoryService.getAll();
        setInventory(data);
      } catch (error) {
        setError('Failed to fetch inventory');
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newInventory = await bloodInventoryService.add(formData);
      setInventory(prev => [...prev, newInventory]);
      setShowAddModal(false);
      setFormData({
        bloodType: '',
        availableUnits: '',
        expiryDate: '',
        status: 'AVAILABLE',
        source: 'DONATION'
      });
    } catch (error) {
      console.error('Error adding inventory:', error);
      setError('Failed to add inventory item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">مخزون الدم</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة وحدة دم</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventory.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Droplet className="h-5 w-5 text-red-500" />
                <span className="font-medium">{item.bloodType}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.availableUnits > 10 ? 'bg-green-100 text-green-800' :
                item.availableUnits > 5 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.availableUnits} وحدة
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>تاريخ الصلاحية</span>
                <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>الحالة</span>
                <span className={
                  new Date(item.expiryDate) > new Date() ? 'text-green-600' : 'text-red-600'
                }>
                  {new Date(item.expiryDate) > new Date() ? 'صالح' : 'منتهي الصلاحية'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>الوحدات المحجوزة</span>
                <span>{item.reservedUnits}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إضافة وحدة دم جديدة"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              فصيلة الدم
            </label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">اختر فصيلة الدم</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الكمية
            </label>
            <input
              type="number"
              name="availableUnits"
              value={formData.availableUnits}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الصلاحية
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المصدر
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="DONATION">تبرع</option>
              <option value="TRANSFER">نقل</option>
              <option value="PURCHASE">شراء</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              إضافة
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default HospitalInventory; 