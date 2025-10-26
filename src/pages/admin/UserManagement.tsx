import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Mail,
  Phone,
  Calendar,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
  last_login?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Mock data for now - replace with actual API call
        const mockUsers: User[] = [
          {
            id: 1,
            username: 'john_doe',
            email: 'john@example.com',
            full_name: 'John Doe',
            phone: '+1234567890',
            role: 'base_user',
            status: 'active',
            created_at: '2024-01-15T10:30:00Z',
            last_login: '2024-01-20T14:22:00Z'
          },
          {
            id: 2,
            username: 'jane_student',
            email: 'jane@university.edu',
            full_name: 'Jane Smith',
            phone: '+1234567891',
            role: 'student',
            status: 'active',
            created_at: '2024-01-10T09:15:00Z',
            last_login: '2024-01-19T16:45:00Z'
          },
          {
            id: 3,
            username: 'admin',
            email: 'admin@fundhub.com',
            full_name: 'FundHub Administrator',
            phone: '+1234567890',
            role: 'admin',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            last_login: '2024-01-20T18:30:00Z'
          }
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'student': return 'default';
      case 'base_user': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">Manage platform users and their permissions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {users.length} Total Users
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Filters & Search</CardTitle>
            <CardDescription>Filter users by role and search by name or email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterRole === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('all')}
                  className={filterRole === 'all' ? 'bg-primary text-primary-foreground' : ''}
                >
                  All
                </Button>
                <Button
                  variant={filterRole === 'admin' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('admin')}
                  className={filterRole === 'admin' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Admins
                </Button>
                <Button
                  variant={filterRole === 'student' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('student')}
                  className={filterRole === 'student' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Students
                </Button>
                <Button
                  variant={filterRole === 'base_user' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('base_user')}
                  className={filterRole === 'base_user' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Users
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">User</TableHead>
                    <TableHead className="text-foreground">Role</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Contact</TableHead>
                    <TableHead className="text-foreground">Joined</TableHead>
                    <TableHead className="text-foreground">Last Login</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-secondary/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-foreground">
                              {user.full_name?.charAt(0) || user.username.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{user.full_name || user.username}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-foreground">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-foreground">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <div className="text-sm text-foreground">
                            {new Date(user.last_login).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <UserX className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserManagement;
