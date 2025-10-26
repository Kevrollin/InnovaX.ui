import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, TrendingUp, Eye, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const verificationStatus = user?.student_profile?.verification_status || 'pending';

  const stats = [
    {
      title: 'Total Raised',
      value: '$4,200',
      change: '+18.2%',
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      title: 'Active Projects',
      value: '3',
      change: '2 published',
      icon: Rocket,
      color: 'text-accent',
    },
    {
      title: 'Total Views',
      value: '1,243',
      change: '+89 this week',
      icon: Eye,
      color: 'text-success',
    },
  ];

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case 'approved':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Clock className="mr-1 h-3 w-3" />
            Pending Verification
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="mr-1 h-3 w-3" />
            Verification Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
                  Student <span className="text-primary">Dashboard</span>
                </h1>
                <p className="text-muted-foreground">Manage your projects and track progress</p>
              </div>
              {getVerificationBadge()}
            </div>
          </motion.div>

          {/* Verification Alert */}
          {verificationStatus === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Verification Pending</h3>
                      <p className="text-sm text-muted-foreground">
                        Your student profile is under review. You'll be able to publish projects once verified.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
            <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Your Projects</CardTitle>
                      <CardDescription>Manage and track your student projects</CardDescription>
                    </div>
                    <Link to="/student/create-project">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">You haven't created any projects yet</p>
                    <Link to="/student/create-project">
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Project
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>All Projects</CardTitle>
                  <CardDescription>Complete list of your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No projects yet. Start by creating your first project!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Track your project performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Analytics will be available once you have active projects</p>
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

export default StudentDashboard;
