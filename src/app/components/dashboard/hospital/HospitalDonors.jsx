'use client'
import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/api';
import { User, MapPin, Phone, Mail, Heart, Droplet } from 'lucide-react';

const HospitalDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodType: '',
    isAvailable: true
  });

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const data = await userService.getDonors(filters);
        setDonors(data);
      } catch (error) {
        console.error('Failed to fetch donors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">المتبرعين</h2>
        <div className="flex space-x-4 rtl:space-x-reverse">
          <select
            value={filters.bloodType}
            onChange={(e) => handleFilterChange('bloodType', e.target.value)}
            className="form-select"
          >
            <option value="">كل فصائل الدم</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
          <select
            value={filters.isAvailable}
            onChange={(e) => handleFilterChange('isAvailable', e.target.value === 'true')}
            className="form-select"
          >
            <option value="true">متاح للتبرع</option>
            <option value="false">غير متاح</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {donors.map((donor) => (
          <div key={donor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <User className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {donor.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {donor.bloodType}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  donor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {donor.isAvailable ? 'متاح للتبرع' : 'غير متاح'}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{donor.phone}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{donor.email}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{donor.address}</span>
              </div>
            </div>

            {donor.lastDonation && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-gray-600">
                      آخر تبرع: {new Date(donor.lastDonation).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <button className="btn-primary text-sm">
                    طلب تبرع
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalDonors; 