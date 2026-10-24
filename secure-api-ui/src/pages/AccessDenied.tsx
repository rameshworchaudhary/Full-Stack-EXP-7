import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-red-600 mb-4 border border-red-100">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">403</h1>
        <h2 className="mt-2 text-lg font-semibold text-gray-800">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-600">
          You don't have permission to access this resource.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Your current account role does not satisfy the required security scope.
        </p>

        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
