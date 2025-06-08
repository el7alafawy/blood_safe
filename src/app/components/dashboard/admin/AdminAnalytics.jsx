import { useState } from 'react';
import { Users, Building2, Droplet, MapPin, Download } from 'lucide-react';

const AdminAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const stats = {
    totalUsers: 1250,
    totalHospitals: 45,
    totalDonations: 3500,
    totalRequests: 1200
  };

  const userTypeDistribution = [
    { type: 'متبرعين', count: 850, percentage: 68 },
    { type: 'مرضى', count: 350, percentage: 28 },
    { type: 'مستشفيات', count: 45, percentage: 4 }
  ];

  const bloodTypeDistribution = [
    { type: 'A+', count: 450, percentage: 35 },
    { type: 'A-', count: 150, percentage: 12 },
    { type: 'B+', count: 300, percentage: 24 },
    { type: 'B-', count: 100, percentage: 8 },
    { type: 'O+', count: 150, percentage: 12 },
    { type: 'O-', count: 50, percentage: 4 },
    { type: 'AB+', count: 30, percentage: 2 },
    { type: 'AB-', count: 20, percentage: 2 }
  ];

  const topLocations = [
    { city: 'الرياض', count: 450 },
    { city: 'جدة', count: 350 },
    { city: 'الدمام', count: 250 },
    { city: 'مكة المكرمة', count: 200 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">التحليلات والإحصائيات</h2>
        <div className="flex items-center gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="year">آخر سنة</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <Download className="h-5 w-5 ml-2" />
            تصدير التقرير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي المستخدمين</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي المستشفيات</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalHospitals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Droplet className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي التبرعات</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDonations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Droplet className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي الطلبات</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">توزيع المستخدمين</h3>
          <div className="space-y-4">
            {userTypeDistribution.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                  <span className="text-sm font-medium text-gray-700">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">توزيع فصائل الدم</h3>
          <div className="space-y-4">
            {bloodTypeDistribution.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                  <span className="text-sm font-medium text-gray-700">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">أكثر المدن نشاطاً</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topLocations.map((location) => (
            <div key={location.city} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 ml-2 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{location.city}</p>
                <p className="text-sm text-gray-500">{location.count} متبرع</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 