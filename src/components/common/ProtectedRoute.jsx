import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { PageLoader } from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader text="Authenticating session..." />;
  }

  const token = localStorage.getItem('accessToken');
  if (!token && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user) {
    const hasPermission = allowedRoles.includes(user.role);
    if (!hasPermission) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Access Restricted</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Your user role (<span className="font-semibold text-slate-700 dark:text-slate-300">{user.role}</span>)
            does not have sufficient authorization to view this resource.
          </p>
        </div>
      );
    }
  }

  return children;
}
