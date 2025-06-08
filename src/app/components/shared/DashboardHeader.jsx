import { User, Bell, Droplet, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/api';

const DashboardHeader = ({ title, userName, notificationCount = 0 }) => {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <div className="bg-theme shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Droplet className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-theme">{title}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <ThemeToggle />
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-500 dark:text-gray-400 cursor-pointer" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            )}
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <span className="text-sm font-medium text-theme">{userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader; 