import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  MapPin,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { adminAPI, User as UserType } from '@/services/admin';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  onEdit?: (user: UserType) => void;
}

const UserDetailsModal = ({ isOpen, onClose, userId, onEdit }: UserDetailsModalProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getUserById(userId);
      setUser(response);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'STUDENT': return 'default';
      case 'BASE_USER': return 'secondary';
      case 'GUEST': return 'outline';
      case 'INSTITUTION': return 'secondary';
      case 'SPONSOR': return 'default';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'INACTIVE': return 'secondary';
      case 'SUSPENDED': return 'destructive';
      case 'PENDING': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'INACTIVE': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'SUSPENDED': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading User</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchUserDetails}>Retry</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">User Not Found</h3>
            <p className="text-muted-foreground">The requested user could not be found.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-lg font-medium text-primary-foreground">
                {user.fullName?.charAt(0) || user.username.charAt(0)}
              </span>
            </div>
            <div>
              <div className="text-xl font-semibold">{user.fullName || user.username}</div>
              <div className="text-sm text-muted-foreground">@{user.username}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete user profile and account information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Role */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(user.status)}
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status}
              </Badge>
            </div>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {user.role.replace('_', ' ')}
            </Badge>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Joined</div>
                  <div className="text-foreground">{formatDate(user.createdAt)}</div>
                </div>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Last Login</div>
                    <div className="text-foreground">{formatDate(user.lastLogin)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Information (if applicable) */}
          {user.studentProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">School</div>
                    <div className="text-foreground">{user.studentProfile.schoolName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Verification Status</div>
                    <Badge variant={user.studentProfile.verificationStatus === 'APPROVED' ? 'default' : 'secondary'}>
                      {user.studentProfile.verificationStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(user)}>
                Edit User
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
