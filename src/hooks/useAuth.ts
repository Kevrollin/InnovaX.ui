import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/auth';
import { UserRole } from '@/types';
import { getSuccessMessage } from '@/utils/errorHandler';
import { showSuccessToast } from '@/components/ui/enhanced-toast';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, setUser } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

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
    
    // Rate limiting: only refresh if it's been more than 30 seconds since last refresh
    const now = Date.now();
    if (isRefreshing || (now - lastRefreshTime < 30000)) {
      return;
    }
    
    setIsRefreshing(true);
    setLastRefreshTime(now);
    
    try {
      const userProfile = await authAPI.getUserProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      // Only logout if it's an authentication error, not rate limiting
      if (error instanceof Error && error.message.includes('401')) {
        logout();
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsRefreshing(false);
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
    return isStudent() && user?.studentProfile?.verificationStatus === 'APPROVED';
  };

  // Check if user is pending verification
  const isPendingVerification = () => {
    return isStudent() && user?.studentProfile?.verificationStatus === 'PENDING';
  };

  // Check if user verification was rejected
  const isVerificationRejected = () => {
    return isStudent() && user?.studentProfile?.verificationStatus === 'REJECTED';
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
    isPendingVerification,
    isVerificationRejected,
    getDashboardRoute,
  };
};
