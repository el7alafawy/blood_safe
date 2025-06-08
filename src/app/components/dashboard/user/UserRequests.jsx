'use client'
import React, { useState, useEffect } from 'react';
import { bloodRequestService } from '../../../services/api';
import { AlertTriangle, Calendar, MapPin, Clock, Droplet, Plus, Pencil, Trash2 } from 'lucide-react';
import AddBloodRequestDialog from '../../dialogs/AddBloodRequestDialog';

const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await bloodRequestService.getAll({ userId: 'me' });
      setRequests(data);
    } catch (error) {
      setError('Failed to fetch requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    try {
      await bloodRequestService.delete(id);
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      setError('Failed to delete request');
    }
  };

  const handleCancel = async (id) => {
    try {
      await bloodRequestService.cancel(id);
      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      setError('Failed to cancel request');
    }
  };

  const handleEdit = (id) => {
    const req = requests.find(r => r._id === id);
    setSelectedRequest(req);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedRequest(null);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchRequests();
  };

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
      <AddBloodRequestDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        request={selectedRequest}
        onSuccess={handleDialogSuccess}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">طلباتي</h2>
        <button
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          onClick={handleAdd}
        >
          <Plus className="h-5 w-5 ml-2" />
          طلب جديد
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">نوع الدم</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الوحدات</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الموقع</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">التاريخ</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Droplet className="h-5 w-5 text-red-500 ml-2" />
                    <span className="text-sm text-gray-900 dark:text-white">{request.bloodType}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {request.units} وحدة
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 ml-2" />
                    {request.location.name || 'موقع غير محدد'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(request.requiredBy).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'FULFILLED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    request.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    request.status === 'EXPIRED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {request.status === 'FULFILLED' ? 'مكتمل' :
                     request.status === 'CANCELLED' ? 'ملغي' :
                     request.status === 'EXPIRED' ? 'منتهي' :
                     'قيد الانتظار'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(request._id)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="إلغاء الطلب"
                      >
                        <AlertTriangle className="h-5 w-5" />
                      </button>
                    )}
                    {/* <button
                      onClick={() => handleDelete(request._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="حذف الطلب"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRequests; 