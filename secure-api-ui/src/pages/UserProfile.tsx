import React, { useEffect, useState } from 'react';
import { getProfileApi } from '../services/api';
import type { User } from '../types/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { User as UserIcon, Mail, Shield, IdCard, AlertCircle, RefreshCw } from 'lucide-react';
import { AxiosError } from 'axios';

export const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfileApi();
      setProfile(data);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof AxiosError && err.message) {
        setError(err.message);
      } else {
        setError('Failed to fetch user profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <LoadingSpinner message="Fetching user profile from backend..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start space-x-3 mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Error Loading Profile</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchProfile}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
              <p className="text-xs text-gray-500">
                Data retrieved via GET /api/user/profile
              </p>
            </div>
          </div>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </button>
        </div>

        {/* Body */}
        <div className="p-6 divide-y divide-gray-200">
          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <IdCard className="w-4 h-4 mr-2 text-gray-400" />
              User ID
            </dt>
            <dd className="text-sm font-semibold text-gray-900 sm:col-span-2">
              #{profile?.id}
            </dd>
          </div>

          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
              Username
            </dt>
            <dd className="text-sm font-semibold text-gray-900 sm:col-span-2">
              {profile?.username}
            </dd>
          </div>

          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              Email Address
            </dt>
            <dd className="text-sm font-semibold text-gray-900 sm:col-span-2">
              {profile?.email}
            </dd>
          </div>

          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-gray-400" />
              Assigned Role
            </dt>
            <dd className="text-sm sm:col-span-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  profile?.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {profile?.role}
              </span>
            </dd>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Account Status: Active &bull; Spring Security JWT Bearer Verified
        </div>
      </div>
    </div>
  );
};
