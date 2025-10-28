import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  User,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface VerificationStatusProps {
  showCard?: boolean;
  showButton?: boolean;
  className?: string;
}

export const VerificationStatus = ({ 
  showCard = false, 
  showButton = true, 
  className = '' 
}: VerificationStatusProps) => {
  const { user, isAuthenticated } = useAuth();

  // Only show for students
  if (!isAuthenticated || user?.role !== 'STUDENT') {
    return null;
  }

  const verificationStatus = user?.studentProfile?.verificationStatus;
  
  if (verificationStatus === 'APPROVED') {
    return showCard ? (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">Student Verified</h4>
              <p className="text-sm text-green-700">You can participate in campaigns and access student features.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ) : (
      <Badge variant="default" className="bg-green-600 text-white">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified Student
      </Badge>
    );
  }

  const getStatusInfo = () => {
    switch (verificationStatus) {
      case 'PENDING':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          title: 'Verification Pending',
          description: 'Your student verification is under review. Please wait for admin approval.',
          color: 'yellow',
          badge: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          title: 'Verification Rejected',
          description: 'Your student verification was rejected. Please update your information and resubmit.',
          color: 'red',
          badge: <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
          title: 'Verification Required',
          description: 'Complete your student verification to participate in campaigns and access student features.',
          color: 'orange',
          badge: <Badge variant="outline" className="border-orange-200 text-orange-600">
            <Shield className="h-3 w-3 mr-1" />
            Verification Required
          </Badge>
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (showCard) {
    return (
      <Card className={`border-${statusInfo.color}-200 bg-${statusInfo.color}-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {statusInfo.icon}
            {statusInfo.title}
          </CardTitle>
          <CardDescription>
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">What you can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View campaign details</li>
                <li>• Fund campaigns</li>
                <li>• Complete student verification</li>
                {verificationStatus === 'REJECTED' && (
                  <li>• Update your student information</li>
                )}
              </ul>
            </div>
            
            {showButton && (
              <div className="flex gap-2">
                <Link to="/student/profile">
                  <Button 
                    className={`bg-${statusInfo.color}-600 hover:bg-${statusInfo.color}-700`}
                    size="sm"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {verificationStatus === 'REJECTED' ? 'Update Verification' : 'Complete Verification'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {statusInfo.badge}
      {showButton && (
        <Link to="/student/profile">
          <Button 
            variant="outline" 
            size="sm"
            className={`border-${statusInfo.color}-200 text-${statusInfo.color}-600 hover:bg-${statusInfo.color}-50`}
          >
            <Shield className="mr-2 h-4 w-4" />
            Verify
          </Button>
        </Link>
      )}
    </div>
  );
};

export default VerificationStatus;
