'use client'
import React, { useState, useEffect } from 'react';
import { donationService, userService } from '../../../services/api';
import { Heart, MapPin, Calendar, Clock, AlertTriangle, Check, X } from 'lucide-react';

const UserMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const user = await userService.getProfile()
        const response = await donationService.getRecipientDonations(user._id);
        setMatches(response);
      } catch (error) {
        setError('Failed to fetch matches');
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleConfirm = async (matchId) => {
    try {
      setProcessing(prev => ({ ...prev, [matchId]: true }));
      await donationService.updateStatus(matchId, 'completed');
      setMatches(prev => prev.map(match => 
        match._id === matchId ? { ...match, status: 'completed' } : match
      ));
    } catch (error) {
      console.error('Error confirming donation:', error);
      setError('Failed to confirm donation');
    } finally {
      setProcessing(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const handleCancel = async (matchId) => {
    try {
      setProcessing(prev => ({ ...prev, [matchId]: true }));
      await donationService.updateStatus(matchId, 'cancelled');
      setMatches(prev => prev.map(match => 
        match._id === matchId ? { ...match, status: 'cancelled' } : match
      ));
    } catch (error) {
      console.error('Error cancelling donation:', error);
      setError('Failed to cancel donation');
    } finally {
      setProcessing(prev => ({ ...prev, [matchId]: false }));
    }
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
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إستجابات التبرع</h2>
      </div>

      {matches && matches.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>لا توجد إستجابة تبرع متاحة</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المتبرع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">فصيلة الدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ التبرع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموقع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {matches&&matches.map((match) => (
                <tr key={match._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{match.donor.name}</div>
                    <div className="text-sm text-gray-500">{match.donor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{match.bloodType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{match.units} وحدة</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(match.donationDate).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(match.donationDate).toLocaleTimeString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{match.location.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      match.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      match.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status === 'pending' ? 'قيد الانتظار' :
                       match.status === 'confirmed' ? 'تم التأكيد' :
                       match.status === 'cancelled' ? 'ملغي' :
                       'مكتمل'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    {match.status === 'pending' && (
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleConfirm(match._id)}
                          disabled={processing[match._id]}
                          className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="h-4 w-4 ml-1" />
                          تأكيد
                        </button>
                        <button
                          onClick={() => handleCancel(match._id)}
                          disabled={processing[match._id]}
                          className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="h-4 w-4 ml-1" />
                          إلغاء
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserMatches; 