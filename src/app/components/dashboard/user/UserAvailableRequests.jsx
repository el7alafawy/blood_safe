'use client'
import React, { useState, useEffect } from 'react';
import { bloodRequestService, userService } from '../../../services/api';
import { AlertTriangle, Calendar, MapPin, Clock, Droplet, Navigation, Heart } from 'lucide-react';
import CreateDonationDialog from '../../dialogs/CreateDonationDialog';

const UserAvailableRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const fetchAvailableRequests = async () => {
    try {
      // Get user's blood type from their profile
      const userProfile = await userService.getProfile();
      const userBloodType = userProfile.bloodType;

      // Get all pending requests
      const data = await bloodRequestService.getAll({ status: 'PENDING' });
      
      // Filter requests that match user's blood type
      const matchingRequests = data.filter(request => request.bloodType === userBloodType);

      // Sort by distance if user location is available
      if (userLocation) {
        matchingRequests.sort((a, b) => {
          const distanceA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.location.coordinates[1],
            a.location.coordinates[0]
          );
          const distanceB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.location.coordinates[1],
            b.location.coordinates[0]
          );
          return distanceA - distanceB;
        });
      }

      setRequests(matchingRequests);
    } catch (error) {
      setError('Failed to fetch available requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    if (userLocation) {
      fetchAvailableRequests();
    }
  }, [userLocation]);

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleDonateClick = (request) => {
    setSelectedRequest(request);
    setIsDonationDialogOpen(true);
  };

  const handleDonationSuccess = () => {
    // Refresh the requests list
    fetchAvailableRequests();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 dark:border-red-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الطلبات المتاحة</h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">فصيلة الدم</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المستشفى</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">التاريخ المطلوب</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المسافة</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الوحدات</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Droplet className="h-5 w-5 text-red-500 dark:text-red-400 ml-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{request.bloodType}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-2" />
                    <span className="text-sm text-gray-900 dark:text-white">{request.location.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-2" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(request.requiredBy).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {userLocation && (
                    <div className="flex items-center">
                      <Navigation className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          request.location.coordinates[1],
                          request.location.coordinates[0]
                        ).toFixed(1)} كم
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {request.units} وحدة
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDonateClick(request)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
                  >
                    <Heart className="h-4 w-4 ml-1" />
                    تبرع الآن
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">لا توجد طلبات متاحة</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            لا توجد طلبات دم متاحة تتطابق مع فصيلة دمك حالياً.
          </p>
        </div>
      )}

      <CreateDonationDialog
        isOpen={isDonationDialogOpen}
        onClose={() => {
          setIsDonationDialogOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSuccess={handleDonationSuccess}
      />
    </div>
  );
};

export default UserAvailableRequests; 