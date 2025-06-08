'use client'
import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';
import { bloodRequestService } from '../../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  const mapEvents = useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const AddBloodRequestDialog = ({ isOpen, onClose, request = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    bloodType: '',
    units: 1,
    location: {
      type: 'Point',
      name: '',
      coordinates: []
    },
    requiredBy: '',
    purpose: '',
    urgency: 'MEDIUM',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([24.7136, 46.6753]); // Default to Riyadh
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (request) {
      setFormData({
        bloodType: request.bloodType,
        units: request.units,
        location: request.location,
        requiredBy: new Date(request.requiredBy).toISOString().split('T')[0],
        purpose: request.purpose,
        urgency: request.urgency,
        notes: request.notes || ''
      });
      if (request.location.coordinates && request.location.coordinates.length === 2) {
        setMapCenter([request.location.coordinates[1], request.location.coordinates[0]]);
        setSelectedLocation([request.location.coordinates[1], request.location.coordinates[0]]);
      }
    }
  }, [request]);

  useEffect(() => {
    // Get user's current location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleLocationSelect = (latlng) => {
    setSelectedLocation([latlng.lat, latlng.lng]);
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [latlng.lng, latlng.lat] // Note: MongoDB expects [longitude, latitude]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      setError('الرجاء تحديد الموقع على الخريطة');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (request) {
        await bloodRequestService.update(request._id, formData);
      } else {
        await bloodRequestService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to save request. Please try again.');
      console.error('Error saving request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'locationName') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          name: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={request ? 'تعديل طلب الدم' : 'طلب دم جديد'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نوع الدم
            </label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">اختر نوع الدم</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد الوحدات
            </label>
            <input
              type="number"
              name="units"
              value={formData.units}
              onChange={handleChange}
              min="1"
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الموقع
            </label>
            <input
              type="text"
              name="locationName"
              value={formData.location.name}
              onChange={handleChange}
              placeholder="أدخل اسم الموقع"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
            />
            <div className="w-full h-64 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selectedLocation &&  (
                  <Marker
                    position={selectedLocation}
                    icon={icon}
                  />
                )}
                <MapClickHandler onLocationSelect={handleLocationSelect} />
              </MapContainer>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              انقر على الخريطة لتحديد موقع المستشفى
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              تاريخ الحاجة
            </label>
            <input
              type="date"
              name="requiredBy"
              value={formData.requiredBy}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              درجة الإلحاح
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="LOW">عادي</option>
              <option value="MEDIUM">متوسط</option>
              <option value="HIGH">عاجل</option>
              <option value="EMERGENCY">طارئ</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الغرض
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            rows="3"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ملاحظات إضافية
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : request ? 'حفظ التغييرات' : 'إضافة الطلب'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddBloodRequestDialog; 