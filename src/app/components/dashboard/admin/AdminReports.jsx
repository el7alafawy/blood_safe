'use client'
import React, { useState, useEffect } from 'react';
import { userService, hospitalService, donationService } from '../../../services/api';
import { Users, Building2, Droplet, TrendingUp, TrendingDown } from 'lucide-react';

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHospitals: 0,
    totalDonations: 0,
    activeDonors: 0,
    completedRequests: 0,
    bloodTypeDistribution: {},
    monthlyDonations: [],
    userGrowth: 0,
    hospitalGrowth: 0,
    donationGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userStats, hospitalStats, donationStats] = await Promise.all([
          userService.getStats(),
          hospitalService.getStats(),
          donationService.getStats()
        ]);

        setStats({
          totalUsers: userStats.totalUsers,
          totalHospitals: hospitalStats.totalHospitals,
          totalDonations: donationStats.totalDonations,
          activeDonors: userStats.activeDonors,
          completedRequests: donationStats.completedRequests,
          bloodTypeDistribution: donationStats.bloodTypeDistribution,
          monthlyDonations: donationStats.monthlyDonations,
          userGrowth: userStats.growth,
          hospitalGrowth: hospitalStats.growth,
          donationGrowth: donationStats.growth
        });
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
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="week">الأسبوع</option>
          <option value="month">الشهر</option>
          <option value="year">السنة</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي المستخدمين</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center">
            {stats.userGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              stats.userGrowth >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {Math.abs(stats.userGrowth)}% {stats.userGrowth >= 0 ? 'زيادة' : 'انخفاض'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي المستشفيات</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalHospitals}</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center">
            {stats.hospitalGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              stats.hospitalGrowth >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {Math.abs(stats.hospitalGrowth)}% {stats.hospitalGrowth >= 0 ? 'زيادة' : 'انخفاض'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي التبرعات</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDonations}</p>
            </div>
            <Droplet className="h-8 w-8 text-red-500" />
          </div>
          <div className="mt-4 flex items-center">
            {stats.donationGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              stats.donationGrowth >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {Math.abs(stats.donationGrowth)}% {stats.donationGrowth >= 0 ? 'زيادة' : 'انخفاض'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الطلبات المكتملة</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedRequests}</p>
            </div>
            <Droplet className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              نسبة النجاح: {((stats.completedRequests / stats.totalDonations) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع فصائل الدم</h3>
          <div className="space-y-4">
            {Object.entries(stats.bloodTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-600">{type}</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-red-500 rounded-full"
                      style={{
                        width: `${(count / stats.totalDonations) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">نشاط التبرعات الشهري</h3>
          <div className="space-y-4">
            {stats.monthlyDonations.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-gray-600">{month.month}</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-red-500 rounded-full"
                      style={{
                        width: `${(month.count / Math.max(...stats.monthlyDonations.map(m => m.count))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{month.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports; 