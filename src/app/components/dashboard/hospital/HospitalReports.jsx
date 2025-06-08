'use client'
import React, { useState, useEffect } from 'react';
import { hospitalService, authService } from '../../../services/api';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

const HospitalReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = authService.getCurrentUser();
        const data = await hospitalService.getStats(user._id);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h2>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="week">آخر أسبوع</option>
          <option value="month">آخر شهر</option>
          <option value="year">آخر سنة</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">إجمالي التبرعات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-red-500" />
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 ml-1" />
            <span>{stats.donationGrowth}% زيادة</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">المتبرعين النشطين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDonors}</p>
            </div>
            <PieChart className="h-8 w-8 text-blue-500" />
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 ml-1" />
            <span>{stats.donorGrowth}% زيادة</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">الطلبات المكتملة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedRequests}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 ml-1" />
            <span>{stats.requestGrowth}% زيادة</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">معدل النجاح</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 ml-1" />
            <span>{stats.successRateGrowth}% زيادة</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع فصائل الدم</h3>
          <div className="space-y-4">
            {stats.bloodTypeDistribution.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.type}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-500">{item.percentage}%</span>
                  <span className="text-sm text-gray-500">({item.count} وحدة)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">نشاط التبرع</h3>
          <div className="space-y-4">
            {stats.donationActivity.map((item) => (
              <div key={item.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{new Date(item.date).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-500">{item.count} تبرع</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalReports; 