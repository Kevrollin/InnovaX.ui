import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

interface StudentProfileCardProps {
  user: User;
  projectsCreated?: number;
  totalRaised?: number;
  activeProjects?: number;
}

export const StudentProfileCard = ({ 
  user, 
  projectsCreated = 0, 
  totalRaised = 0, 
  activeProjects = 0 
}: StudentProfileCardProps) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'donor':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Donor</Badge>;
      case 'student':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Student</Badge>;
      case 'admin':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Admin</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-muted/10 text-muted-foreground border-muted/20">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{user?.full_name || user?.username}</h3>
            <p className="text-muted-foreground">@{user?.username}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {getRoleBadge(user?.role || 'base_user')}
              {getStatusBadge(user?.status || 'active')}
            </div>
            {user?.student_profile && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {user.student_profile.school_name}
                </Badge>
              </div>
            )}
          </div>
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src="" alt={user?.full_name || user?.username} />
            <AvatarFallback className="text-xl">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{projectsCreated}</div>
            <div className="text-sm text-muted-foreground">Projects Created</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">${totalRaised.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Raised</div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{activeProjects}</div>
          <div className="text-sm text-muted-foreground">Active Projects</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span>{user?.email}</span>
          </div>
          {user?.student_profile?.school_email && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">School Email:</span>
              <span>{user.student_profile.school_email}</span>
            </div>
          )}
          {user?.student_profile?.admission_number && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Admission #:</span>
              <span>{user.student_profile.admission_number}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Member since:</span>
            <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
