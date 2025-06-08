'use client'
import { useState, useEffect } from 'react';
import Dialog from './Dialog';
import { donationService, authService } from '../../services/api';
import { Calendar, MapPin, Droplet } from 'lucide-react';

const CreateDonationDialog = ({ isOpen, onClose, request, onSuccess }) => {
  const [formData, setFormData] = useState({
    bloodType: request?.bloodType || '',
    units: request?.units || 1,
    donationDate: '',
    location: {
      type: 'Point',
      name: request?.location?.name || '',
      coordinates: request?.location?.coordinates || []
    },
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (request) {
      setFormData(prev => ({
        ...prev,
        bloodType: request.bloodType,
        units: request.units,
        location: {
          type: 'Point',
          name: request.location.name,
          coordinates: request.location.coordinates
        }
      }));
    }
  }, [request]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Format date to ISO8601
      const donationDate = new Date(formData.donationDate).toISOString();

      const donationData = {
        ...formData,
        donor: currentUser.id, // Add donor ID
        recepient: request.userId._id, // The request creator's ID
        donationDate, // Use ISO8601 formatted date
        status: 'pending'
      };

      await donationService.create(donationData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء التبرع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="إنشاء تبرع جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              فصيلة الدم
            </label>
            <div className="flex items-center">
              <Droplet className="h-5 w-5 text-red-500 ml-2" />
              <span className="text-gray-900 dark:text-white font-medium">{formData.bloodType}</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              عدد الوحدات
            </label>
            <input
              type="number"
              name="units"
              min="1"
              max="2"
              value={formData.units}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              تاريخ التبرع
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="donationDate"
                value={formData.donationDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 pl-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              الموقع
            </label>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 ml-2" />
              <span className="text-gray-900 dark:text-white font-medium">{formData.location.name}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            ملاحظات إضافية
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="أضف أي ملاحظات إضافية هنا..."
          />
        </div>

        <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading || !currentUser}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الحفظ...' : 'تأكيد التبرع'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateDonationDialog; 