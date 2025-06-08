'use client'
import React, { useState, useEffect } from 'react';
import { donationService } from '../../../services/api';
import { Droplet, Calendar, Building2, User, Search } from 'lucide-react';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await donationService.getAll();
        setDonations(data.donations);
      } catch (error) {
        setError('Failed to fetch donations');
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.bloodType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'all' || donation.status === filter;

    return matchesSearch && matchesFilter;
  });

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
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة التبرعات</h2>
        <div className="flex space-x-4 rtl:space-x-reverse">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="completed">مكتملة</option>
            <option value="cancelled">ملغية</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="بحث في التبرعات..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {filteredDonations.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          <Droplet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>لا توجد تبرعات</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredDonations.map((donation) => (
            <div
              key={donation._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Droplet className="h-5 w-5 text-red-500" />
                    <span className="font-medium">فصيلة الدم: {donation.bloodType}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
                    <User className="h-4 w-4" />
                    <span>المتبرع: {donation.donor.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>المستشفى: {donation.hospital.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>التاريخ: {new Date(donation.date).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    donation.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : donation.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {donation.status === 'completed'
                      ? 'مكتملة'
                      : donation.status === 'pending'
                      ? 'قيد الانتظار'
                      : 'ملغية'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDonations; 