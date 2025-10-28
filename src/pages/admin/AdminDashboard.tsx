import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Rocket, DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminAPI, DashboardStats, PendingVerification } from '@/services/admin';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingVerification, setIsProcessingVerification] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsData, verificationsData] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getPendingVerifications()
        ]);
        setDashboardStats(statsData);
        setPendingVerifications(verificationsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveVerification = async (userId: number) => {
    try {
      setIsProcessingVerification(userId);
      await adminAPI.approveVerification(userId);
      setPendingVerifications(prev => prev.filter(v => v.userId !== userId));
      toast({
        title: "Success",
        description: "Student verification approved successfully.",
      });
    } catch (error) {
      console.error('Failed to approve verification:', error);
      toast({
        title: "Error",
        description: "Failed to approve verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVerification(null);
    }
  };

  const handleRejectVerification = async (userId: number) => {
    try {
      setIsProcessingVerification(userId);
      await adminAPI.rejectVerification(userId);
      setPendingVerifications(prev => prev.filter(v => v.userId !== userId));
      toast({
        title: "Success",
        description: "Student verification rejected successfully.",
      });
    } catch (error) {
      console.error('Failed to reject verification:', error);
      toast({
        title: "Error",
        description: "Failed to reject verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVerification(null);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: formatNumber(dashboardStats.totalUsers.value),
      change: dashboardStats.totalUsers.change,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Active Projects',
      value: formatNumber(dashboardStats.activeProjects.value),
      change: dashboardStats.activeProjects.change,
      icon: Rocket,
      color: 'text-accent',
    },
    {
      title: 'Total Funded',
      value: formatCurrency(dashboardStats.totalFunded.value),
      change: dashboardStats.totalFunded.change,
      icon: DollarSign,
      color: 'text-success',
    },
    {
      title: 'Pending Verifications',
      value: formatNumber(dashboardStats.pendingVerifications.value),
      change: dashboardStats.pendingVerifications.change,
      icon: Clock,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen">

      <main className="flex-1 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border bg-card hover:shadow-elegant transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-heading">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 sm:mb-6 w-full overflow-x-auto">
              <div className="flex space-x-2 min-w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="verifications">
                    <span className="hidden sm:inline">Verifications</span>
                    <span className="sm:hidden">Verify</span>
                    <Badge variant="destructive" className="ml-2">
                      {pendingVerifications.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                </div>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                  <CardDescription>Recent platform statistics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">New Users This Week</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(dashboardStats.recentActivity.newUsersThisWeek)} new registrations
                        </p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">Projects Funded Today</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(dashboardStats.recentActivity.projectsFundedToday)} projects received funding
                        </p>
                      </div>
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">Total Donations</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(dashboardStats.recentActivity.totalDonations)} total donations
                        </p>
                      </div>
                      <DollarSign className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">Completed Donations</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(dashboardStats.recentActivity.completedDonations)} successful transactions
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verifications">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Pending Student Verifications</CardTitle>
                  <CardDescription>Review and approve student profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingVerifications.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No pending verifications</p>
                        <p className="text-sm">All student verifications are up to date</p>
                      </div>
                    ) : (
                      pendingVerifications.map((verification) => (
                        <div
                          key={verification.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{verification.name}</p>
                            <p className="text-sm text-muted-foreground">{verification.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">{verification.school}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>School Email: {verification.schoolEmail}</p>
                              <p>Admission #: {verification.admissionNumber}</p>
                              <p>Applied: {new Date(verification.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full sm:w-auto"
                              onClick={() => handleApproveVerification(verification.userId)}
                              disabled={isProcessingVerification === verification.userId}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span className="hidden sm:inline">Approve</span>
                              <span className="sm:hidden">✓</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full sm:w-auto"
                              onClick={() => handleRejectVerification(verification.userId)}
                              disabled={isProcessingVerification === verification.userId}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              <span className="hidden sm:inline">Reject</span>
                              <span className="sm:hidden">✗</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                  <CardDescription>Manage funding campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No active campaigns at the moment</p>
                    <Button className="mt-4">Create New Campaign</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
