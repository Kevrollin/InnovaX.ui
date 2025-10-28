import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Rocket, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AnalyticsData {
  users: {
    total: number;
    students: number;
    donors: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  donations: {
    total: number;
    totalAmount: number;
  };
}

interface DashboardStats {
  totalUsers: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  activeProjects: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  totalFunded: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  pendingVerifications: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  recentActivity: {
    newUsersThisWeek: number;
    projectsFundedToday: number;
    totalDonations: number;
    completedDonations: number;
  };
}

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const [analyticsResponse, dashboardResponse] = await Promise.all([
        apiService.getAnalytics(),
        apiService.getDashboardStats()
      ]);
      
      setAnalyticsData(analyticsResponse.data);
      setDashboardStats(dashboardResponse.data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAnalyticsData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
            <h1 className="text-3xl font-heading font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">Comprehensive platform insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
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

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats && (
            <>
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardStats.totalUsers.value.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        {getTrendIcon(dashboardStats.totalUsers.trend)}
                        <span className={`text-xs ml-1 ${getTrendColor(dashboardStats.totalUsers.trend)}`}>
                          {dashboardStats.totalUsers.change}
                        </span>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardStats.activeProjects.value.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        {getTrendIcon(dashboardStats.activeProjects.trend)}
                        <span className={`text-xs ml-1 ${getTrendColor(dashboardStats.activeProjects.trend)}`}>
                          {dashboardStats.activeProjects.change}
                        </span>
                      </div>
                    </div>
                    <Rocket className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Funded</p>
                      <p className="text-2xl font-bold text-foreground">${dashboardStats.totalFunded.value.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        {getTrendIcon(dashboardStats.totalFunded.trend)}
                        <span className={`text-xs ml-1 ${getTrendColor(dashboardStats.totalFunded.trend)}`}>
                          {dashboardStats.totalFunded.change}
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Verifications</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardStats.pendingVerifications.value}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-xs ml-1 text-orange-600">
                          {dashboardStats.pendingVerifications.change}
                        </span>
                      </div>
                    </div>
                    <CheckCircle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </motion.div>

      {/* Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Summary */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Platform Summary</CardTitle>
                  <CardDescription>Key platform metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Users</span>
                        <Badge variant="secondary">{analyticsData.users.total}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Students</span>
                        <Badge variant="outline">{analyticsData.users.students}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Donors</span>
                        <Badge variant="outline">{analyticsData.users.donors}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Projects</span>
                        <Badge variant="secondary">{analyticsData.projects.total}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Projects</span>
                        <Badge variant="default">{analyticsData.projects.active}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Completed Projects</span>
                        <Badge variant="outline">{analyticsData.projects.completed}</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Activity</CardTitle>
                  <CardDescription>Platform activity in the last period</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardStats && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">New Users This Week</span>
                        </div>
                        <Badge variant="secondary">{dashboardStats.recentActivity.newUsersThisWeek}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Rocket className="h-4 w-4 text-success" />
                          <span className="text-sm text-muted-foreground">Projects Funded Today</span>
                        </div>
                        <Badge variant="default">{dashboardStats.recentActivity.projectsFundedToday}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-success" />
                          <span className="text-sm text-muted-foreground">Total Donations</span>
                        </div>
                        <Badge variant="outline">{dashboardStats.recentActivity.totalDonations}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">Completed Donations</span>
                        </div>
                        <Badge variant="outline">{dashboardStats.recentActivity.completedDonations}</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">User Analytics</CardTitle>
                <CardDescription>Detailed user statistics and demographics</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{analyticsData.users.total}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success mb-2">{analyticsData.users.students}</div>
                      <div className="text-sm text-muted-foreground">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-500 mb-2">{analyticsData.users.donors}</div>
                      <div className="text-sm text-muted-foreground">Donors</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Project Analytics</CardTitle>
                <CardDescription>Project statistics and funding metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{analyticsData.projects.total}</div>
                      <div className="text-sm text-muted-foreground">Total Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success mb-2">{analyticsData.projects.active}</div>
                      <div className="text-sm text-muted-foreground">Active Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500 mb-2">{analyticsData.projects.completed}</div>
                      <div className="text-sm text-muted-foreground">Completed Projects</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Donation Analytics</CardTitle>
                <CardDescription>Donation statistics and financial metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{analyticsData.donations.total}</div>
                      <div className="text-sm text-muted-foreground">Total Donations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success mb-2">${analyticsData.donations.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Activity Metrics</CardTitle>
                <CardDescription>Platform activity and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardStats && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">{dashboardStats.recentActivity.newUsersThisWeek}</div>
                        <div className="text-sm text-muted-foreground">New Users This Week</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success mb-2">{dashboardStats.recentActivity.projectsFundedToday}</div>
                        <div className="text-sm text-muted-foreground">Projects Funded Today</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-500 mb-2">{dashboardStats.recentActivity.totalDonations}</div>
                        <div className="text-sm text-muted-foreground">Total Donations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500 mb-2">{dashboardStats.recentActivity.completedDonations}</div>
                        <div className="text-sm text-muted-foreground">Completed Donations</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
