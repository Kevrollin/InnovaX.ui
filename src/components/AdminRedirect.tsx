import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRedirectProps {
  children: React.ReactNode;
}

export const AdminRedirect = ({ children }: AdminRedirectProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // If user is admin, don't render children (they'll be redirected)
  if (user && user.role === 'ADMIN') {
    return null;
  }

  return <>{children}</>;
};

export default AdminRedirect;
