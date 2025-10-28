import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, TrendingUp, Eye, Plus, CheckCircle, Clock, XCircle, AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { isVerifiedStudent, isPendingVerification, isVerificationRejected, refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Only refresh if user data is stale or missing
        if (!user || !user.studentProfile) {
          await refreshUserProfile();
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Don't show error toast for rate limiting
        if (!error.message.includes('429')) {
          toast({
            title: "Error",
            description: "Failed to load user data. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [refreshUserProfile, user]);

  const verificationStatus = user?.studentProfile?.verificationStatus || 'PENDING';

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
      case 'APPROVED':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified Student
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Pending Verification
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Verification Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Not Verified
          </Badge>
        );
    }
  };

  const handleCreateProjectClick = () => {
    if (!isVerifiedStudent()) {
      toast({
        title: "Verification Required",
        description: "You need to be verified as a student to create projects. Please wait for admin approval.",
        variant: "destructive",
      });
      return;
    }
    // Navigation will be handled by the Link component
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

          {/* Verification Alerts */}
          {isPendingVerification() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Verification Pending</h3>
                      <p className="text-sm text-muted-foreground">
                        Your student profile is under review by our admin team. You'll be able to create and publish projects once verified.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isVerificationRejected() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Verification Rejected</h3>
                      <p className="text-sm text-muted-foreground">
                        Your student verification was rejected. Please contact support or update your profile information and reapply.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isVerifiedStudent() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Student Verified!</h3>
                      <p className="text-sm text-muted-foreground">
                        Congratulations! Your student profile has been verified. You can now create projects and access all student features.
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
                    {isVerifiedStudent() ? (
                      <Link to="/student/create-project">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          New Project
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled>
                        <Lock className="mr-2 h-4 w-4" />
                        Verification Required
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    {isVerifiedStudent() ? (
                      <>
                        <p className="mb-4">You haven't created any projects yet</p>
                        <Link to="/student/create-project">
                          <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Project
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="mb-4">Create projects after verification</p>
                        <Button variant="outline" disabled>
                          <Lock className="mr-2 h-4 w-4" />
                          Verification Required
                        </Button>
                      </>
                    )}
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
