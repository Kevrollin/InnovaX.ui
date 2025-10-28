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
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  UserPlus,
  UserMinus,
  DollarSign,
  Rocket,
  FileText,
  Shield,
  AlertTriangle,
  Info,
  Calendar,
  Download,
  RefreshCw,
  Activity,
  Users,
  Settings,
  Trash2,
  Edit,
  Ban,
  CheckSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  description: string;
  type: 'user' | 'project' | 'donation' | 'system' | 'verification';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    fullName?: string;
    email: string;
  };
}

const AdminActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API call
  const mockLogs: ActivityLog[] = [
    {
      id: 1,
      userId: 1,
      action: 'USER_LOGIN',
      description: 'User logged in successfully',
      type: 'user',
      severity: 'low',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt: '2024-01-28T10:30:00Z',
      user: {
        id: 1,
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: 2,
      userId: 2,
      action: 'PROJECT_CREATED',
      description: 'New project "AI Study Assistant" created',
      type: 'project',
      severity: 'medium',
      createdAt: '2024-01-28T09:15:00Z',
      user: {
        id: 2,
        username: 'jane_student',
        fullName: 'Jane Smith',
        email: 'jane@example.com'
      }
    },
    {
      id: 3,
      userId: 3,
      action: 'DONATION_COMPLETED',
      description: 'Donation of $250 completed for project "Eco-Friendly Water Bottle"',
      type: 'donation',
      severity: 'medium',
      createdAt: '2024-01-28T08:45:00Z',
      user: {
        id: 3,
        username: 'bob_donor',
        fullName: 'Bob Johnson',
        email: 'bob@example.com'
      }
    },
    {
      id: 4,
      userId: 1,
      action: 'STUDENT_VERIFIED',
      description: 'Student verification approved for user jane_student',
      type: 'verification',
      severity: 'high',
      createdAt: '2024-01-28T07:20:00Z',
      user: {
        id: 1,
        username: 'admin',
        fullName: 'Admin User',
        email: 'admin@example.com'
      }
    },
    {
      id: 5,
      userId: 4,
      action: 'USER_SUSPENDED',
      description: 'User account suspended due to policy violation',
      type: 'user',
      severity: 'critical',
      createdAt: '2024-01-28T06:10:00Z',
      user: {
        id: 1,
        username: 'admin',
        fullName: 'Admin User',
        email: 'admin@example.com'
      }
    },
    {
      id: 6,
      userId: 5,
      action: 'PROJECT_FUNDED',
      description: 'Project "Community Garden Initiative" reached funding goal',
      type: 'project',
      severity: 'high',
      createdAt: '2024-01-28T05:30:00Z',
      user: {
        id: 5,
        username: 'mike_gardener',
        fullName: 'Mike Wilson',
        email: 'mike@example.com'
      }
    },
    {
      id: 7,
      userId: 6,
      action: 'SYSTEM_BACKUP',
      description: 'Automated system backup completed successfully',
      type: 'system',
      severity: 'low',
      createdAt: '2024-01-28T04:00:00Z'
    },
    {
      id: 8,
      userId: 2,
      action: 'PROJECT_UPDATED',
      description: 'Project "AI Study Assistant" description updated',
      type: 'project',
      severity: 'low',
      createdAt: '2024-01-28T03:15:00Z',
      user: {
        id: 2,
        username: 'jane_student',
        fullName: 'Jane Smith',
        email: 'jane@example.com'
      }
    }
  ];

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      // Mock API call - replace with actual implementation
      setLogs(mockLogs);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      toast({
        title: "Error",
        description: "Failed to load activity logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchLogs();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <User className="h-4 w-4" />;
    if (action.includes('USER')) return <Users className="h-4 w-4" />;
    if (action.includes('PROJECT')) return <Rocket className="h-4 w-4" />;
    if (action.includes('DONATION')) return <DollarSign className="h-4 w-4" />;
    if (action.includes('VERIFICATION')) return <CheckSquare className="h-4 w-4" />;
    if (action.includes('SYSTEM')) return <Settings className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>;
      case 'high':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Medium</Badge>;
      case 'low':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'user':
        return <Badge variant="outline"><User className="h-3 w-3 mr-1" />User</Badge>;
      case 'project':
        return <Badge variant="outline"><Rocket className="h-3 w-3 mr-1" />Project</Badge>;
      case 'donation':
        return <Badge variant="outline"><DollarSign className="h-3 w-3 mr-1" />Donation</Badge>;
      case 'verification':
        return <Badge variant="outline"><CheckSquare className="h-3 w-3 mr-1" />Verification</Badge>;
      case 'system':
        return <Badge variant="outline"><Settings className="h-3 w-3 mr-1" />System</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getTypeCounts = () => {
    return {
      all: logs.length,
      user: logs.filter(l => l.type === 'user').length,
      project: logs.filter(l => l.type === 'project').length,
      donation: logs.filter(l => l.type === 'donation').length,
      verification: logs.filter(l => l.type === 'verification').length,
      system: logs.filter(l => l.type === 'system').length,
    };
  };

  const getSeverityCounts = () => {
    return {
      all: logs.length,
      critical: logs.filter(l => l.severity === 'critical').length,
      high: logs.filter(l => l.severity === 'high').length,
      medium: logs.filter(l => l.severity === 'medium').length,
      low: logs.filter(l => l.severity === 'low').length,
    };
  };

  const typeCounts = getTypeCounts();
  const severityCounts = getSeverityCounts();

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
            <h1 className="text-3xl font-heading font-bold text-foreground">Activity Logs</h1>
            <p className="text-muted-foreground mt-2">Monitor platform activity and system events</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold text-foreground">{logs.length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Events</p>
                  <p className="text-2xl font-bold text-foreground">{severityCounts.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">User Actions</p>
                  <p className="text-2xl font-bold text-foreground">{typeCounts.user}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Events</p>
                  <p className="text-2xl font-bold text-foreground">{typeCounts.system}</p>
                </div>
                <Settings className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Search & Filters</CardTitle>
            <CardDescription>Find specific activity logs by user, action, or type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search activity logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  className={filterType === 'all' ? 'bg-primary text-primary-foreground' : ''}
                >
                  All ({typeCounts.all})
                </Button>
                <Button
                  variant={filterType === 'user' ? 'default' : 'outline'}
                  onClick={() => setFilterType('user')}
                  className={filterType === 'user' ? 'bg-primary text-primary-foreground' : ''}
                >
                  User ({typeCounts.user})
                </Button>
                <Button
                  variant={filterType === 'project' ? 'default' : 'outline'}
                  onClick={() => setFilterType('project')}
                  className={filterType === 'project' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Project ({typeCounts.project})
                </Button>
                <Button
                  variant={filterType === 'donation' ? 'default' : 'outline'}
                  onClick={() => setFilterType('donation')}
                  className={filterType === 'donation' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Donation ({typeCounts.donation})
                </Button>
                <Button
                  variant={filterType === 'verification' ? 'default' : 'outline'}
                  onClick={() => setFilterType('verification')}
                  className={filterType === 'verification' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Verification ({typeCounts.verification})
                </Button>
                <Button
                  variant={filterType === 'system' ? 'default' : 'outline'}
                  onClick={() => setFilterType('system')}
                  className={filterType === 'system' ? 'bg-primary text-primary-foreground' : ''}
                >
                  System ({typeCounts.system})
                </Button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant={filterSeverity === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterSeverity('all')}
                className={filterSeverity === 'all' ? 'bg-primary text-primary-foreground' : ''}
              >
                All Severity ({severityCounts.all})
              </Button>
              <Button
                variant={filterSeverity === 'critical' ? 'default' : 'outline'}
                onClick={() => setFilterSeverity('critical')}
                className={filterSeverity === 'critical' ? 'bg-red-600 text-white' : ''}
              >
                Critical ({severityCounts.critical})
              </Button>
              <Button
                variant={filterSeverity === 'high' ? 'default' : 'outline'}
                onClick={() => setFilterSeverity('high')}
                className={filterSeverity === 'high' ? 'bg-orange-600 text-white' : ''}
              >
                High ({severityCounts.high})
              </Button>
              <Button
                variant={filterSeverity === 'medium' ? 'default' : 'outline'}
                onClick={() => setFilterSeverity('medium')}
                className={filterSeverity === 'medium' ? 'bg-yellow-600 text-white' : ''}
              >
                Medium ({severityCounts.medium})
              </Button>
              <Button
                variant={filterSeverity === 'low' ? 'default' : 'outline'}
                onClick={() => setFilterSeverity('low')}
                className={filterSeverity === 'low' ? 'bg-green-600 text-white' : ''}
              >
                Low ({severityCounts.low})
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Activity Logs ({filteredLogs.length})</CardTitle>
            <CardDescription>
              Monitor all platform activity and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Action</TableHead>
                    <TableHead className="text-foreground">User</TableHead>
                    <TableHead className="text-foreground">Description</TableHead>
                    <TableHead className="text-foreground">Type</TableHead>
                    <TableHead className="text-foreground">Severity</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-secondary/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className="font-medium text-foreground">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-foreground">
                                {log.user.fullName?.charAt(0) || log.user.username?.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-foreground">
                                {log.user.fullName || log.user.username}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{log.user.username}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-foreground">{log.description}</div>
                        {log.ipAddress && (
                          <div className="text-xs text-muted-foreground mt-1">
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(log.type)}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(log.severity)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
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

export default AdminActivityLogs;
