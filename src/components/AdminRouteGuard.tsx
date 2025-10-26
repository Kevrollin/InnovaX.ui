import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import AdminLayout from './layout/AdminLayout';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const { user, token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateAdminAccess = async () => {
      // If no token, redirect to login
      if (!token) {
        navigate('/login');
        return;
      }

      // If no user data but we have a token, try to get user profile
      if (!user && token) {
        try {
          // This will be handled by the useAuth hook
          return;
        } catch (error) {
          console.error('Failed to get user profile:', error);
          logout();
          navigate('/login');
          toast.error('Session expired. Please login again.');
          return;
        }
      }

      // Check if user is admin
      if (user && user.role !== 'ADMIN') {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }
    };

    validateAdminAccess();
  }, [user, token, isAuthenticated, navigate, logout]);

  // Show loading while validating
  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
};

export default AdminRouteGuard;
