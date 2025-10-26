import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/auth';
import { UserRole } from '@/types';
import { getSuccessMessage } from '@/utils/errorHandler';
import { showSuccessToast } from '@/components/ui/enhanced-toast';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, setUser } = useAuthStore();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth-token');
      if (storedToken && !user) {
        try {
          // Set token first
          authAPI.setToken(storedToken);
          // Verify token by getting user profile
          const userProfile = await authAPI.getUserProfile();
          login(userProfile, storedToken);
        } catch (error) {
          console.error('Failed to verify stored token:', error);
          logout();
          localStorage.removeItem('auth-token');
        }
      }
    };

    initializeAuth();
  }, []);

  // Set token in auth API when it changes
  useEffect(() => {
    if (token) {
      authAPI.setToken(token);
    }
  }, [token]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      showSuccessToast(getSuccessMessage('logout'));
    }
  };

  const refreshUserProfile = async () => {
    if (!token) return;
    
    try {
      const userProfile = await authAPI.getUserProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      logout();
      toast.error('Session expired. Please login again.');
    }
  };

  // Role-based helper functions
  const isAdmin = () => user?.role === 'ADMIN';
  const isStudent = () => user?.role === 'STUDENT';
  const isBaseUser = () => user?.role === 'BASE_USER';
  const isGuest = () => user?.role === 'GUEST';
  const isInstitution = () => user?.role === 'INSTITUTION';
  const isSponsor = () => user?.role === 'SPONSOR';

  // Check if user has specific role
  const hasRole = (role: UserRole) => user?.role === role;
  const hasAnyRole = (roles: UserRole[]) => user ? roles.includes(user.role) : false;

  // Check if user is verified student
  const isVerifiedStudent = () => {
    return isStudent() && user?.studentProfile?.verificationStatus === 'verified';
  };

  // Get user dashboard route based on role
  const getDashboardRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      case 'BASE_USER':
        return '/donor/dashboard';
      case 'INSTITUTION':
        return '/institution/dashboard';
      case 'SPONSOR':
        return '/sponsor/dashboard';
      default:
        return '/';
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout: handleLogout,
    refreshUserProfile,
    // Role-based helpers
    isAdmin,
    isStudent,
    isBaseUser,
    isGuest,
    isInstitution,
    isSponsor,
    hasRole,
    hasAnyRole,
    isVerifiedStudent,
    getDashboardRoute,
  };
};
