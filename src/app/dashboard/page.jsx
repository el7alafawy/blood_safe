'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService, donationService, hospitalService, bloodRequestService } from '../services/api';
import { 
  User, 
  Heart, 
  MapPin, 
  Calendar, 
  Bell, 
  Activity, 
  Droplet, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Building2,
  Users,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Globe,
  Shield,
  Database,
  FileText
} from 'lucide-react';

// Import shared components
import DashboardHeader from '../components/shared/DashboardHeader';
import StatsCard from '../components/shared/StatsCard';
import TabNavigation from '../components/shared/TabNavigation';

// Import dialog components
import Dialog from '../components/dialogs/Dialog';
import AddUserDialog from '../components/dialogs/AddUserDialog';
import AddHospitalDialog from '../components/dialogs/AddHospitalDialog';
import AddBloodRequestDialog from '../components/dialogs/AddBloodRequestDialog';

// Import user dashboard components
import UserDonations from '../components/dashboard/user/UserDonations';
import UserRequests from '../components/dashboard/user/UserRequests';
import UserMatches from '../components/dashboard/user/UserMatches';
import UserProfile from '../components/dashboard/user/UserProfile';
import UserAvailableRequests from '../components/dashboard/user/UserAvailableRequests';

// Import hospital dashboard components
import HospitalInventory from '../components/dashboard/hospital/HospitalInventory';
import HospitalRequests from '../components/dashboard/hospital/HospitalRequests';
import HospitalDonors from '../components/dashboard/hospital/HospitalDonors';
import HospitalReports from '../components/dashboard/hospital/HospitalReports';

// Import admin dashboard components
import AdminUsers from '../components/dashboard/admin/AdminUsers';
import AdminHospitals from '../components/dashboard/admin/AdminHospitals';
import AdminAnalytics from '../components/dashboard/admin/AdminAnalytics';
import AdminSettings from '../components/dashboard/admin/AdminSettings';

// Main Dashboard Selector
const BloodDonationDashboard = () => {
  const router = useRouter();
  const [dashboardType, setDashboardType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setDashboardType(user.role); // 'admin', 'hospital', or 'user'
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (dashboardType === 'admin') return <AdminDashboard />;
  if (dashboardType === 'user') return <UserDashboard />;
  if (dashboardType === 'hospital') return <HospitalDashboard />;

  return null;
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalHospitals: 0,
    totalDonations: 0,
    activeDonors: 0,
    pendingRequests: 0,
    completedMatches: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userStats, donationStats, bloodRequestStats] = await Promise.all([
          userService.getStats(),
          donationService.getStats(),
          bloodRequestService.getStats()
        ]);
        
        setSystemStats({
          totalUsers: userStats.totalUsers,
          totalHospitals: userStats.totalHospitals,
          totalDonations: donationStats.totalDonations,
          activeDonors: userStats.activeDonors,
          pendingRequests: bloodRequestStats.pendingRequests,
          completedMatches: donationStats.completedMatches
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  const adminTabs = [
    { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { key: 'users', label: 'إدارة المستخدمين', icon: Users },
    { key: 'hospitals', label: 'إدارة المستشفيات', icon: Building2 },
    { key: 'analytics', label: 'التحليلات', icon: PieChart },
    { key: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  const AdminOverview = () => (
    <div className="space-y-6 text-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="إجمالي المستخدمين" value={systemStats.totalUsers} icon={Users} color="blue" />
        <StatsCard title="المستشفيات المسجلة" value={systemStats.totalHospitals} icon={Building2} color="green" />
        <StatsCard title="التبرعات المكتملة" value={systemStats.totalDonations} icon={Droplet} color="red" />
        <StatsCard title="المتبرعين النشطين" value={systemStats.activeDonors} icon={Heart} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات النظام</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>الطلبات المعلقة</span>
              <span className="font-bold text-orange-600">{systemStats.pendingRequests}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>المطابقات المكتملة</span>
              <span className="font-bold text-green-600">{systemStats.completedMatches}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>معدل النجاح</span>
              <span className="font-bold text-blue-600">94.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border-l-4 border-green-400 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">تم تسجيل مستشفى جديد</p>
                <p className="text-xs text-gray-500">مستشفى النور - منذ ساعتين</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border-l-4 border-blue-400 bg-blue-50">
              <Droplet className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">تبرع جديد مكتمل</p>
                <p className="text-xs text-gray-500">فصيلة O+ - منذ 30 دقيقة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'hospitals': return <AdminHospitals />;
      case 'analytics': return <AdminAnalytics />;
      case 'settings': return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <DashboardHeader title="لوحة تحكم الإدارة" userName="مدير النظام" notificationCount={5} />
      <TabNavigation tabs={adminTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderAdminContent()}
      </main>
    </div>
  );
};

// User Dashboard Component
const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userMode, setUserMode] = useState('donor');
  const [userProfile,setUserProfile] = useState({})
  const [userStats, setUserStats] = useState({
    totalDonations: 0,
    activeRequests: 0,
    completedRequests: 0,
    bloodType: '',
    lifesSaved: 0,
    lastDonation: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profile = await userService.getProfile();
        setUserProfile(profile);
        const donorStats = await userService.getDonorStats();
        setUserStats({
          totalDonations: donorStats.totalDonations,
          activeRequests: donorStats.activeRequests,
          completedRequests: donorStats.completedRequests,
          bloodType: profile.bloodType,
          lifesSaved: donorStats.lifesSaved,
          lastDonation: donorStats.lastDonation
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const userTabs = [
    { key: 'overview', label: 'نظرة عامة', icon: Activity },
    { key: 'available', label: 'طلبات متاحة', icon: AlertTriangle },
    { key: 'donations', label: 'تبرعاتي', icon: Droplet },
    { key: 'requests', label: 'طلباتي', icon: FileText },
    { key: 'matches', label: 'إستجابات التبرع', icon: CheckCircle },
    { key: 'profile', label: 'الملف الشخصي', icon: User }
  ];

  const UserOverview = () => (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="card-theme rounded-lg p-4">
        <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
          <button
            onClick={() => setUserMode('donor')}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-all ${
              userMode === 'donor' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-secondary'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>وضع المتبرع</span>
          </button>
          <button
            onClick={() => setUserMode('patient')}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-all ${
              userMode === 'patient' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-secondary'
            }`}
          >
            <User className="h-4 w-4" />
            <span>وضع المريض</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userMode === 'donor' ? (
          <>
            <StatsCard title="تبرعاتي" value={userStats.totalDonations} icon={Droplet} color="red" />
            <StatsCard title="الأرواح المُنقذة" value={userStats.lifesSaved} icon={Heart} color="green" />
            <StatsCard title="فصيلة الدم" value={userStats.bloodType} icon={Activity} color="blue" />
            <StatsCard title="آخر تبرع" value={userStats.lastDonation?new Date(userStats.lastDonation).toLocaleDateString():"لا يوجد"} subtitle={userStats.lastDonation? new Date(userStats.lastDonation).getFullYear():"-"} icon={Calendar} color="purple" />
          </>
        ) : (
          <>
            <StatsCard title="الطلبات النشطة" value={userStats.activeRequests} icon={AlertTriangle} color="orange" />
            <StatsCard title="الطلبات المكتملة" value={userStats.completedRequests} icon={CheckCircle} color="green" />
            <StatsCard title="فصيلة الدم" value={userStats.bloodType} icon={Activity} color="blue" />
            <StatsCard title="المطابقات المتاحة" value="7" icon={Heart} color="purple" />
          </>
        )}
      </div>

      {/* Recent Notifications */}
      <div className="card-theme rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">الإشعارات الأخيرة</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border-l-4 bg-red-50 dark:bg-red-900/20 border-red-400">
            <h4 className="font-medium text-primary">طلب دم طارئ</h4>
            <p className="text-sm text-secondary mt-1">مطلوب فصيلة دم O+ في مستشفى دار الفؤاد</p>
            <span className="text-xs text-muted">منذ 5 دقائق</span>
          </div>
          <div className="p-4 rounded-lg border-l-4 bg-blue-50 dark:bg-blue-900/20 border-blue-400">
            <h4 className="font-medium text-primary">تأكيد موعد</h4>
            <p className="text-sm text-secondary mt-1">موعدك للتبرع غدا الساعة 10 صباحا</p>
            <span className="text-xs text-muted">منذ ساعة</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserContent = () => {
    switch (activeTab) {
      case 'overview': return <UserOverview />;
      case 'available': return <UserAvailableRequests />;
      case 'donations': return <UserDonations />;
      case 'requests': return <UserRequests />;
      case 'matches': return <UserMatches />;
      case 'profile': return <UserProfile />;
      default: return <UserOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-theme" dir="rtl">
      <DashboardHeader title="لوحة تحكم المستخدم" userName={userProfile.name} notificationCount={3} />
      <TabNavigation tabs={userTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderUserContent()}
      </main>
    </div>
  );
};

// Hospital Dashboard Component
const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [hospitalStats, setHospitalStats] = useState({
    bloodRequestStats: [],
    bloodInventoryStats: [],
    totalAvailableUnits: 0,
    totalReservedUnits: 0
  });

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) return;
        const stats = await hospitalService.getStats(user.id);
        setHospitalStats(stats);
      } catch (error) {
        console.error('Failed to fetch hospital data:', error);
      }
    };

    fetchHospitalData();
  }, []);

  const hospitalTabs = [
    { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { key: 'inventory', label: 'المخزون', icon: Droplet },
    { key: 'requests', label: 'الطلبات', icon: AlertTriangle },
    { key: 'donors', label: 'المتبرعين', icon: Users },
    { key: 'reports', label: 'التقارير', icon: FileText }
  ];

  const HospitalOverview = () => (
    <div className="space-y-6 text-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="إجمالي المخزون" value={`${hospitalStats.totalAvailableUnits} وحدة`} icon={Droplet} color="blue" />
        <StatsCard title="الوحدات المحجوزة" value={`${hospitalStats.totalReservedUnits} وحدة`} icon={Clock} color="orange" />
        <StatsCard 
          title="الطلبات النشطة" 
          value={hospitalStats.bloodRequestStats.reduce((acc, curr) => acc + (curr.pending || 0), 0)} 
          icon={AlertTriangle} 
          color="red" 
        />
        <StatsCard 
          title="الطلبات المكتملة" 
          value={hospitalStats.bloodRequestStats.reduce((acc, curr) => acc + (curr.fulfilled || 0), 0)} 
          icon={CheckCircle} 
          color="green" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة المخزون</h3>
          <div className="space-y-3">
            {hospitalStats.bloodInventoryStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Droplet className="h-5 w-5 text-red-500" />
                  <span className="font-medium">{stat._id}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-600">{stat.availableUnits} وحدة</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stat.availableUnits < 5 ? 'bg-red-100 text-red-800' :
                    stat.availableUnits < 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {stat.availableUnits < 5 ? 'حرج' : stat.availableUnits < 10 ? 'منخفض' : 'جيد'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الطلبات</h3>
          <div className="space-y-3">
            {hospitalStats.bloodRequestStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Droplet className="h-5 w-5 text-red-500" />
                  <span className="font-medium">{stat._id}</span>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">إجمالي</p>
                    <p className="font-medium">{stat.total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">مكتمل</p>
                    <p className="font-medium text-green-600">{stat.fulfilled}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">معلق</p>
                    <p className="font-medium text-orange-600">{stat.pending}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHospitalContent = () => {
    switch (activeTab) {
      case 'overview': return <HospitalOverview />;
      case 'inventory': return <HospitalInventory />;
      case 'requests': return <UserRequests />;
      case 'donors': return <HospitalDonors />;
      case 'reports': return <HospitalReports />;
      default: return <HospitalOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <DashboardHeader title="لوحة تحكم المستشفى" userName="د. محمد أحمد" notificationCount={8} />
      <TabNavigation tabs={hospitalTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderHospitalContent()}
      </main>
    </div>
  );
};

export default BloodDonationDashboard;