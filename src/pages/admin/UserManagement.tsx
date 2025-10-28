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
  Users,
  Edit,
  Trash2,
  Shield,
  ShieldOff,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { adminAPI, User, UsersResponse } from '@/services/admin';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import EditUserModal from '@/components/admin/EditUserModal';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    user?: User;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
  });
  const [userDetailsModal, setUserDetailsModal] = useState<{
    isOpen: boolean;
    userId: number | null;
  }>({
    isOpen: false,
    userId: null,
  });
  const [editUserModal, setEditUserModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filterRole !== 'all') {
        params.role = filterRole.toUpperCase();
      }
      
      const response: UsersResponse = await adminAPI.getUsers(params);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filterRole]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

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

  // User action functions
  const handleViewUser = (user: User) => {
    setUserDetailsModal({
      isOpen: true,
      userId: user.id,
    });
  };

  const handleEditUser = (user: User) => {
    setEditUserModal({
      isOpen: true,
      user: user,
    });
  };

  const handleActivateUser = (user: User) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Activate User',
      description: `Are you sure you want to activate ${user.fullName || user.username}? This will restore their access to the platform.`,
      action: () => activateUser(user.id),
      user,
    });
  };

  const handleSuspendUser = (user: User) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Suspend User',
      description: `Are you sure you want to suspend ${user.fullName || user.username}? This will prevent them from accessing the platform.`,
      action: () => suspendUser(user.id),
      user,
    });
  };

  const handleDeleteUser = (user: User) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete User',
      description: `Are you sure you want to permanently delete ${user.fullName || user.username}? This action cannot be undone and will remove all their data from the platform.`,
      action: () => deleteUser(user.id),
      user,
    });
  };

  const activateUser = async (userId: number) => {
    try {
      await adminAPI.updateUserStatus(userId, 'ACTIVE');
      await fetchUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
      setError(error instanceof Error ? error.message : 'Failed to activate user');
    }
  };

  const suspendUser = async (userId: number) => {
    try {
      await adminAPI.updateUserStatus(userId, 'SUSPENDED');
      await fetchUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      setError(error instanceof Error ? error.message : 'Failed to suspend user');
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await adminAPI.deleteUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      title: '',
      description: '',
      action: () => {},
    });
  };

  const closeUserDetailsModal = () => {
    setUserDetailsModal({
      isOpen: false,
      userId: null,
    });
  };

  const closeEditUserModal = () => {
    setEditUserModal({
      isOpen: false,
      user: null,
    });
  };

  const handleUserSave = async (updatedUser: User) => {
    // Update the user in the local state
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    
    // Close the edit modal
    closeEditUserModal();
    
    // Optionally refresh the entire list to ensure consistency
    await fetchUsers();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
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
              {pagination.total} Total Users
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
                  variant={filterRole === 'ADMIN' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('ADMIN')}
                  className={filterRole === 'ADMIN' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Admins
                </Button>
                <Button
                  variant={filterRole === 'STUDENT' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('STUDENT')}
                  className={filterRole === 'STUDENT' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Students
                </Button>
                <Button
                  variant={filterRole === 'BASE_USER' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('BASE_USER')}
                  className={filterRole === 'BASE_USER' ? 'bg-primary text-primary-foreground' : ''}
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
                              {user.fullName?.charAt(0) || user.username.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{user.fullName || user.username}</div>
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
                          <span className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div className="text-sm text-foreground">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'ACTIVE' ? (
                              <DropdownMenuItem 
                                onClick={() => handleSuspendUser(user)}
                                className="text-orange-600 focus:text-orange-600"
                              >
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleActivateUser(user)}
                                className="text-green-600 focus:text-green-600"
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirmation Modal */}
      <AlertDialog open={confirmationModal.isOpen} onOpenChange={closeConfirmationModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationModal.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationModal.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmationModal}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                confirmationModal.action();
                closeConfirmationModal();
              }}
              className={confirmationModal.title.includes('Delete') ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {confirmationModal.title.includes('Delete') ? 'Delete' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={userDetailsModal.isOpen}
        onClose={closeUserDetailsModal}
        userId={userDetailsModal.userId}
        onEdit={handleEditUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editUserModal.isOpen}
        onClose={closeEditUserModal}
        user={editUserModal.user}
        onSave={handleUserSave}
      />
    </div>
  );
};

export default UserManagement;
