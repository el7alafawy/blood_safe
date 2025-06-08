'use client'
import React, { useState, useEffect } from 'react';
import { bloodRequestService, userService } from '../../../services/api';
import { AlertTriangle, Calendar, MapPin, Clock, Droplet, Plus } from 'lucide-react';

const HospitalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = await userService.getProfile();
        const data = await bloodRequestService.getAll({ userId: user._id });
        setRequests(data);
      } catch (error) {
        setError('Failed to fetch requests');
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await bloodRequestService.updateStatus(requestId, newStatus);
      setRequests(requests.map(request => 
        request._id === requestId 
          ? { ...request, status: newStatus }
          : request
      ));
    } catch (error) {
      console.error('Failed to update request status:', error);
    }
  };

  const handleCreateRequest = async (requestData) => {
    try {
      const newRequest = await bloodRequestService.create(requestData);
      setRequests([newRequest, ...requests]);
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">طلبات الدم</h2>
        <button className="btn-primary flex items-center space-x-2 rtl:space-x-reverse">
          <Plus className="h-5 w-5" />
          <span>طلب جديد</span>
        </button>
      </div>

      <div className="grid gap-6">
        {requests.map((request) => (
          <div key={request._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.bloodType}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {request.units} وحدة
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'FULFILLED' ? 'bg-green-100 text-green-800' :
                  request.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  request.status === 'EXPIRED' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status === 'FULFILLED' ? 'مكتمل' :
                   request.status === 'CANCELLED' ? 'ملغي' :
                   request.status === 'EXPIRED' ? 'منتهي' :
                   'قيد الانتظار'}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(request.requiredBy).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Droplet className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {request.urgency === 'HIGH' ? 'عاجل' :
                   request.urgency === 'MEDIUM' ? 'متوسط' :
                   request.urgency === 'LOW' ? 'عادي' :
                   'طارئ'}
                </span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{request.purpose}</p>
              {request.notes && (
                <p className="text-sm text-gray-500 mt-2">{request.notes}</p>
              )}
            </div>

            {request.status === 'PENDING' && (
              <div className="mt-4 flex justify-end space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => handleStatusUpdate(request._id, 'FULFILLED')}
                  className="btn-success"
                >
                  إكمال
                </button>
                <button
                  onClick={() => handleStatusUpdate(request._id, 'CANCELLED')}
                  className="btn-danger"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalRequests; 