'use client'
import React, { useState, useEffect } from 'react';
import { hospitalService, authService } from '../../../services/api';

const HospitalReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) return;
        const data = await hospitalService.getStats(user.id);
        setStats(data);
      } catch (error) {
        setError('Failed to fetch statistics');
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeRange]);

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
    <div className="space-y-6 text-black">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h2>
        {/* <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="week">آخر أسبوع</option>
          <option value="month">آخر شهر</option>
          <option value="year">آخر سنة</option>
        </select> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">إجمالي الوحدات المتوفرة</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAvailableUnits||0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">إجمالي الوحدات المحجوزة</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalReservedUnits||0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الطلبات حسب الفصيلة</h3>
          <div className="space-y-4">
            {stats?.bloodRequestStats && stats?.bloodRequestStats.length > 0 ? (
              stats.bloodRequestStats.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="font-medium">{item._id}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">إجمالي: {item.total}</span>
                    <span className="text-sm text-green-600">مكتمل: {item.fulfilled}</span>
                    <span className="text-sm text-yellow-600">قيد الانتظار: {item.pending}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">لا توجد بيانات</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مخزون الدم حسب الفصيلة</h3>
          <div className="space-y-4">
            {stats?.bloodInventoryStats && stats?.bloodInventoryStats.length > 0 ? (
              stats.bloodInventoryStats.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="font-medium">{item._id}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">متوفر: {item.availableUnits}</span>
                    <span className="text-sm text-blue-600">محجوز: {item.reservedUnits}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">لا توجد بيانات</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalReports; 