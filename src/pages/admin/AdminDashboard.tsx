import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Rocket, DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/services/admin';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+15%',
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Active Projects',
      value: '156',
      change: '+8',
      icon: Rocket,
      color: 'text-accent',
    },
    {
      title: 'Total Funded',
      value: '$125K',
      change: '+12%',
      icon: DollarSign,
      color: 'text-success',
    },
    {
      title: 'Pending Verifications',
      value: '12',
      change: 'needs action',
      icon: Clock,
      color: 'text-orange-500',
    },
  ];

  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminAPI.getPendingVerifications();
        setPendingVerifications(data);
      } catch (error) {
        console.error('Failed to fetch pending verifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                        <p className="text-sm text-muted-foreground">45 new registrations</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">Projects Funded Today</p>
                        <p className="text-sm text-muted-foreground">8 projects received funding</p>
                      </div>
                      <DollarSign className="h-5 w-5 text-success" />
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
                    {pendingVerifications.map((verification) => (
                      <div
                        key={verification.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div>
                          <p className="font-medium">{verification.name}</p>
                          <p className="text-sm text-muted-foreground">{verification.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">{verification.school}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="w-full sm:w-auto">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Approve</span>
                            <span className="sm:hidden">✓</span>
                          </Button>
                          <Button size="sm" variant="outline" className="w-full sm:w-auto">
                            <XCircle className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Reject</span>
                            <span className="sm:hidden">✗</span>
                          </Button>
                        </div>
                      </div>
                    ))}
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

            <TabsContent value="analytics">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Detailed platform insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Analytics dashboard coming soon</p>
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
