import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/auth';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

export const AuthGuard = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/auth/login' 
}: AuthGuardProps) => {
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const validateAuth = async () => {
      // If no token, redirect to login
      if (!token) {
        navigate(fallbackPath);
        return;
      }

      // If no user data but we have a token, try to get user profile
      if (!user && token) {
        try {
          const userProfile = await authAPI.getUserProfile();
          // User profile will be set by the auth store
        } catch (error) {
          console.error('Failed to get user profile:', error);
          logout();
          navigate(fallbackPath);
          toast.error('Session expired. Please login again.');
          return;
        }
      }

      // Check role requirement
      if (requiredRole && user && user.role !== requiredRole) {
        toast.error('Insufficient permissions');
        navigate('/');
        return;
      }
    };

    validateAuth();
  }, [user, token, isAuthenticated, requiredRole, fallbackPath, navigate, logout]);

  // Show loading while validating
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
