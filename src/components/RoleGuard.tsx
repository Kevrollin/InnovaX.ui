import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackRoute?: string;
  requireVerifiedStudent?: boolean;
}

export const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallbackRoute = '/', 
  requireVerifiedStudent = false 
}: RoleGuardProps) => {
  const { user, isAuthenticated, isVerifiedStudent } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackRoute} replace />;
  }

  // Check if verified student is required
  if (requireVerifiedStudent && !isVerifiedStudent()) {
    return <Navigate to="/student/verification" replace />;
  }

  return <>{children}</>;
};

// Convenience components for common role checks
export const AdminGuard = ({ children }: { children: ReactNode }) => (
  <RoleGuard allowedRoles={['ADMIN']} fallbackRoute="/">
    {children}
  </RoleGuard>
);

export const StudentGuard = ({ children }: { children: ReactNode }) => (
  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']} fallbackRoute="/">
    {children}
  </RoleGuard>
);

export const VerifiedStudentGuard = ({ children }: { children: ReactNode }) => (
  <RoleGuard 
    allowedRoles={['STUDENT', 'ADMIN']} 
    requireVerifiedStudent={true}
    fallbackRoute="/student/verification"
  >
    {children}
  </RoleGuard>
);

export const DonorGuard = ({ children }: { children: ReactNode }) => (
  <RoleGuard allowedRoles={['BASE_USER', 'ADMIN']} fallbackRoute="/">
    {children}
  </RoleGuard>
);

export const InstitutionGuard = ({ children }: { children: ReactNode }) => (
  <RoleGuard allowedRoles={['INSTITUTION', 'ADMIN']} fallbackRoute="/">
    {children}
  </RoleGuard>
);

export const SponsorGuard = ({ children }: { children: ReactNode }) => (
  <RoleGuard allowedRoles={['SPONSOR', 'ADMIN']} fallbackRoute="/">
    {children}
  </RoleGuard>
);
