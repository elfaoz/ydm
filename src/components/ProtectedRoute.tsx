import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  guestAllowed?: boolean;
}

// Role-based access configuration with new roles
// Admin: semua akses
// Ortu: hanya overview (dashboard)
// Guru: overview, profile, attendance, halaqah, activities, finance, add-student (tidak bisa: event, user-management, settings, backup)
// Santri: overview, attendance, halaqah, activities, finance, add-student (tidak bisa: profile, event, user-management, settings, backup)
// Muhafizh: overview, halaqah, add-student, upgrade, payment
const roleAccessConfig: Record<UserRole, string[]> = {
  admin: ['dashboard', 'profile', 'attendance', 'halaqah', 'activities', 'finance', 'event', 'add-student', 'upgrade', 'payment', 'settings', 'user-management', 'backup'],
  guru: ['dashboard', 'profile', 'attendance', 'halaqah', 'activities', 'finance', 'add-student'],
  ortu: ['dashboard'],
  santri: ['dashboard', 'attendance', 'halaqah', 'activities', 'finance', 'add-student'],
  muhafizh: ['dashboard', 'halaqah', 'add-student', 'upgrade', 'payment'],
  guest: ['dashboard'],
};

// Map path to route id
const pathToRouteId = (path: string): string => {
  const cleanPath = path.replace('/', '');
  if (cleanPath === '') return 'dashboard';
  return cleanPath;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, guestAllowed = false }) => {
  const { isAuthenticated, isGuest, userRole, isLoading } = useAuth();

  // Wait for auth to load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Guest users can only access pages where guestAllowed is true
  if (isGuest && !guestAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check role-based access
  if (userRole) {
    const currentPath = window.location.pathname;
    const routeId = pathToRouteId(currentPath);
    const allowedRoutes = roleAccessConfig[userRole] || [];
    
    if (!allowedRoutes.includes(routeId)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
