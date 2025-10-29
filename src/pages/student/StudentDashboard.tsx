import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, TrendingUp, Eye, Plus, CheckCircle, Clock, XCircle, AlertTriangle, Lock, DollarSign, Users, BarChart3, Target, Award, Activity, TrendingDown, ArrowUpRight, RefreshCw, Heart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { studentsAPI, StudentStats, StudentProject } from '@/services/students';
import { StudentProjectCard } from '@/components/StudentProjectCard';
import { ProjectAnalyticsModal } from '@/components/admin/ProjectAnalyticsModal';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { isVerifiedStudent, isPendingVerification, isVerificationRejected, refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats>({
    totalRaised: 0,
    activeProjects: 0,
    totalViews: 0,
    totalDonations: 0,
    completedProjects: 0
  });
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [analyticsProjectId, setAnalyticsProjectId] = useState<number | null>(null);
  const [analyticsProjectTitle, setAnalyticsProjectTitle] = useState<string>('');
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Track if data is currently loading to prevent concurrent requests
  const isLoadingRef = useRef(false);
  // Track the last loaded user ID to prevent unnecessary reloads
  const lastUserIdRef = useRef<number | null>(null);

  // Function to refresh dashboard data - memoized to prevent unnecessary re-renders
  const refreshDashboardData = useCallback(async () => {
    // Prevent concurrent requests
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      // Load projects first, then calculate stats from the same data
      // This avoids duplicate API calls
      const projectsData = await studentsAPI.getMyProjects();
      setProjects(projectsData);
      
      // Calculate stats using the projects we just fetched
      const statsData = await studentsAPI.getStudentStats(projectsData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      // Don't show error toast for rate limiting
      if (error.status !== 429 && !error.message?.includes('429')) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // No dependencies - function is stable

  useEffect(() => {
    // Only load if user changed or if this is the first load
    const currentUserId = user?.id || null;
    const userIdChanged = lastUserIdRef.current !== currentUserId;
    
    if (!userIdChanged && isLoadingRef.current) {
      return; // Already loading or already loaded for this user
    }

    const loadDashboardData = async () => {
      isLoadingRef.current = true;
      setIsLoading(true);
      lastUserIdRef.current = currentUserId;

      try {
        // Ensure user profile is loaded with student profile data
        if (!user || !user.studentProfile) {
          console.log('User profile missing studentProfile, refreshing...');
          await refreshUserProfile();
        }

        // Load projects with all their data
        console.log('Loading student projects...');
        const projectsData = await studentsAPI.getMyProjects();
        console.log('Loaded projects:', projectsData.length, projectsData);
        setProjects(projectsData);
        
        // Calculate stats using the projects we just fetched
        console.log('Calculating stats from projects...');
        const statsData = await studentsAPI.getStudentStats(projectsData);
        console.log('Stats calculated:', statsData);
        setStats(statsData);
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        // Don't show error toast for rate limiting
        if (error.status !== 429 && !error.message?.includes('429')) {
          toast({
            title: "Error",
            description: "Failed to load dashboard data. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    if (currentUserId && userIdChanged) {
      loadDashboardData();
    } else if (!currentUserId) {
      // User not logged in, reset state
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [user?.id, refreshUserProfile]); // Added refreshUserProfile to dependencies

  // Real-time event listeners for automatic stats updates
  useEffect(() => {
    if (!user?.id) return; // Only listen if user is logged in

    // Handler for donation events - refreshes to get updated funding amounts from database
    const handleDonationEvent = () => {
      console.log('Donation event received, refreshing dashboard to get updated funding amounts from database...');
      // Refresh projects to get latest currentAmount from database
      // This ensures funding progress shows real data from the backend
      setTimeout(() => {
        refreshDashboardData();
      }, 500);
    };

    // Handler for project funding updates - updates funding progress in real-time
    const handleProjectFundingUpdate = (event: CustomEvent) => {
      console.log('Project funding update event received:', event.detail);
      if (event.detail?.projectId) {
        const projectId = Number(event.detail.projectId);
        const newAmount = parseFloat(String(event.detail.newAmount || 0));
        
        // Update the specific project's funding amount immediately
        setProjects(prevProjects => {
          const updated = prevProjects.map(project => 
            project.id === projectId
              ? { ...project, funding_raised: newAmount }
              : project
          );
          
          // Update stats based on updated projects
          const newTotalRaised = updated.reduce((sum, p) => sum + (p.funding_raised || 0), 0);
          setStats(prevStats => ({
            ...prevStats,
            totalRaised: Math.round(newTotalRaised * 100) / 100
          }));
          
          return updated;
        });
        
        // Also refresh from API to ensure accuracy with database
        setTimeout(() => {
          refreshDashboardData();
        }, 500);
      }
    };

    // Handler for project view events - updates view count in real-time
    const handleProjectViewEvent = (event: CustomEvent) => {
      console.log('Project view event received:', event.detail);
      // Update the specific project's view count in local state immediately
      if (event.detail?.projectId) {
        const projectId = Number(event.detail.projectId);
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId
              ? { ...project, views_count: (project.views_count || 0) + 1 }
              : project
          )
        );
        // Update stats immediately
        setStats(prevStats => ({
          ...prevStats,
          totalViews: prevStats.totalViews + 1
        }));
        // Also refresh from API to ensure accuracy
        setTimeout(() => {
          refreshDashboardData();
        }, 500);
      }
    };

    // Handler for project updates (status changes, funding updates, etc.)
    const handleProjectUpdateEvent = () => {
      console.log('Project update event received, refreshing dashboard...');
      setTimeout(() => {
        refreshDashboardData();
      }, 500);
    };

    // Add event listeners
    window.addEventListener('donation-created', handleDonationEvent);
    window.addEventListener('donation-updated', handleDonationEvent);
    window.addEventListener('project-funding-updated', handleProjectFundingUpdate as EventListener);
    window.addEventListener('project-viewed', handleProjectViewEvent as EventListener);
    window.addEventListener('project-updated', handleProjectUpdateEvent);
    window.addEventListener('project-status-changed', handleProjectUpdateEvent);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('donation-created', handleDonationEvent);
      window.removeEventListener('donation-updated', handleDonationEvent);
      window.removeEventListener('project-funding-updated', handleProjectFundingUpdate as EventListener);
      window.removeEventListener('project-viewed', handleProjectViewEvent as EventListener);
      window.removeEventListener('project-updated', handleProjectUpdateEvent);
      window.removeEventListener('project-status-changed', handleProjectUpdateEvent);
    };
  }, [user?.id, refreshDashboardData]); // Re-setup listeners if user changes or refresh function changes

  const loadProjects = async (status?: string) => {
    setProjectsLoading(true);
    try {
      const projectsData = await studentsAPI.getMyProjects(status);
      setProjects(projectsData);
      setFilterStatus(status || 'all');
      // Note: We don't recalculate stats here because stats should reflect ALL projects
      // regardless of the current filter (active/completed/draft)
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      // Don't show error toast for rate limiting
      if (error.status !== 429 && !error.message?.includes('429')) {
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDashboardData();
    setIsRefreshing(false);
  };

  // Calculate project statistics for analytics
  const projectStats = {
    totalProjects: projects.length,
    activeProjects: stats.activeProjects,
    completedProjects: stats.completedProjects,
    draftProjects: projects.length - stats.activeProjects - stats.completedProjects,
    averageFundingPerProject: projects.length > 0 ? stats.totalRaised / projects.length : 0,
    averageViewsPerProject: projects.length > 0 ? stats.totalViews / projects.length : 0,
    totalLikes: projects.reduce((sum, p) => sum + (p.likes_count || 0), 0),
    totalShares: projects.reduce((sum, p) => sum + (p.shares_count || 0), 0),
  };

  // Get top performing projects
  const topProjects = [...projects]
    .sort((a, b) => {
      const aScore = (a.funding_raised || 0) + (a.views_count || 0) * 10 + (a.likes_count || 0) * 5;
      const bScore = (b.funding_raised || 0) + (b.views_count || 0) * 10 + (b.likes_count || 0) * 5;
      return bScore - aScore;
    })
    .slice(0, 5);

  const handleAnalyticsClick = (projectId: number, projectTitle: string) => {
    setAnalyticsProjectId(projectId);
    setAnalyticsProjectTitle(projectTitle);
    setIsAnalyticsModalOpen(true);
  };

  const closeAnalyticsModal = () => {
    setIsAnalyticsModalOpen(false);
    setAnalyticsProjectId(null);
    setAnalyticsProjectTitle('');
  };

  const verificationStatus = user?.studentProfile?.verificationStatus || 'PENDING';

  const statsCards = [
    {
      title: 'Total Raised',
      value: `$${stats.totalRaised.toLocaleString()}`,
      change: `${stats.totalDonations} donations`,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects.toString(),
      change: `${stats.completedProjects} completed`,
      icon: Rocket,
      color: 'text-accent',
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: `${projects.length} projects`,
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
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold font-heading text-foreground mb-1">{stat.value}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex bg-muted/50">
                <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  My Projects
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Analytics
                </TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="sm:ml-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Quick Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Funding</p>
                        <p className="text-2xl font-bold text-foreground">${stats.totalRaised.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stats.totalDonations} donations received</p>
                      </div>
                      <div className="p-3 rounded-full bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border bg-gradient-to-br from-accent/5 to-transparent">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Engagement</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">views across all projects</p>
                      </div>
                      <div className="p-3 rounded-full bg-accent/10">
                        <Eye className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Projects */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">Your Projects</CardTitle>
                      <CardDescription>Manage and track your student projects</CardDescription>
                    </div>
                    {isVerifiedStudent() ? (
                      <Link to="/student/create-project">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="mr-2 h-4 w-4" />
                          New Project
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled variant="outline">
                        <Lock className="mr-2 h-4 w-4" />
                        Verification Required
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading projects...</p>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                        <Rocket className="h-12 w-12 opacity-50" />
                      </div>
                      {isVerifiedStudent() ? (
                        <>
                          <h3 className="text-lg font-semibold mb-2 text-foreground">No projects yet</h3>
                          <p className="mb-6">Start your journey by creating your first project</p>
                          <Link to="/student/create-project">
                            <Button size="lg" className="bg-primary hover:bg-primary/90">
                              <Plus className="mr-2 h-4 w-4" />
                              Create Your First Project
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold mb-2 text-foreground">Verification Required</h3>
                          <p className="mb-6">Complete your student verification to create projects</p>
                          <Button variant="outline" disabled size="lg">
                            <Lock className="mr-2 h-4 w-4" />
                            Verification Required
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.slice(0, 3).map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <StudentProjectCard 
                            project={project}
                            onAnalyticsClick={() => handleAnalyticsClick(project.id, project.title)}
                          />
                        </motion.div>
                      ))}
                      {projects.length > 3 && (
                        <div className="text-center pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('projects')}
                            className="w-full sm:w-auto"
                          >
                            View All Projects ({projects.length})
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Performing Projects */}
              {topProjects.length > 0 && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Top Performing Projects
                    </CardTitle>
                    <CardDescription>Your best projects based on engagement and funding</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topProjects.slice(0, 3).map((project, index) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{project.title}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span>${(project.funding_raised || 0).toLocaleString()} raised</span>
                                <span>•</span>
                                <span>{(project.views_count || 0).toLocaleString()} views</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={project.status === 'published' || project.status === 'fundable' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">All Projects</CardTitle>
                      <CardDescription>Complete list of your projects ({projects.length} total)</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => loadProjects()}
                        disabled={projectsLoading}
                        className={filterStatus === 'all' ? 'bg-primary' : ''}
                      >
                        All ({projects.length})
                      </Button>
                      <Button 
                        variant={filterStatus === 'published' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => loadProjects('published')}
                        disabled={projectsLoading}
                        className={filterStatus === 'published' ? 'bg-primary' : ''}
                      >
                        Active ({stats.activeProjects})
                      </Button>
                      <Button 
                        variant={filterStatus === 'completed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => loadProjects('completed')}
                        disabled={projectsLoading}
                        className={filterStatus === 'completed' ? 'bg-primary' : ''}
                      >
                        Completed ({stats.completedProjects})
                      </Button>
                      <Button 
                        variant={filterStatus === 'draft' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => loadProjects('draft')}
                        disabled={projectsLoading}
                        className={filterStatus === 'draft' ? 'bg-primary' : ''}
                      >
                        Draft ({projectStats.draftProjects})
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm">Loading projects...</p>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                        <Rocket className="h-12 w-12 opacity-50" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">No projects found</h3>
                      <p className="mb-6">No projects match your current filter. Try a different filter or create a new project.</p>
                      {isVerifiedStudent() && (
                        <Link to="/student/create-project">
                          <Button variant="outline" size="lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Project
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {projects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <StudentProjectCard 
                            project={project}
                            onAnalyticsClick={() => handleAnalyticsClick(project.id, project.title)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-border bg-gradient-to-br from-primary/10 to-transparent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Raised</p>
                          <p className="text-2xl font-bold text-foreground">${stats.totalRaised.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-border bg-gradient-to-br from-accent/10 to-transparent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Donations</p>
                          <p className="text-2xl font-bold text-foreground">{stats.totalDonations}</p>
                        </div>
                        <Users className="h-8 w-8 text-accent opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-border bg-gradient-to-br from-green-500/10 to-transparent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                          <p className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
                        </div>
                        <Eye className="h-8 w-8 text-green-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-border bg-gradient-to-br from-orange-500/10 to-transparent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
                          <p className="text-2xl font-bold text-foreground">{projects.length}</p>
                        </div>
                        <Rocket className="h-8 w-8 text-orange-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Project Status Breakdown */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Project Status Breakdown
                    </CardTitle>
                    <CardDescription>Overview of your project statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.activeProjects}</div>
                        <div className="text-sm text-muted-foreground">Active Projects</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {projects.length > 0 ? Math.round((stats.activeProjects / projects.length) * 100) : 0}% of total
                        </div>
                      </div>
                      <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.completedProjects}</div>
                        <div className="text-sm text-muted-foreground">Completed Projects</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {projects.length > 0 ? Math.round((stats.completedProjects / projects.length) * 100) : 0}% of total
                        </div>
                      </div>
                      <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-gray-500/10 to-transparent border-gray-500/20">
                        <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">{projectStats.draftProjects}</div>
                        <div className="text-sm text-muted-foreground">Draft Projects</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {projects.length > 0 ? Math.round((projectStats.draftProjects / projects.length) * 100) : 0}% of total
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Average Performance
                      </CardTitle>
                      <CardDescription>Per-project averages</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Avg. Funding</span>
                        </div>
                        <span className="font-bold text-foreground">
                          ${projectStats.averageFundingPerProject.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Avg. Views</span>
                        </div>
                        <span className="font-bold text-foreground">
                          {projectStats.averageViewsPerProject.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-muted-foreground">Total Likes</span>
                        </div>
                        <span className="font-bold text-foreground">{projectStats.totalLikes}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Share2 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Total Shares</span>
                        </div>
                        <span className="font-bold text-foreground">{projectStats.totalShares}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Top Performing Projects
                      </CardTitle>
                      <CardDescription>Ranked by engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {topProjects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No projects to display</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {topProjects.slice(0, 5).map((project, index) => {
                            const projectScore = (project.funding_raised || 0) + (project.views_count || 0) * 10 + (project.likes_count || 0) * 5;
                            return (
                              <div
                                key={project.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => handleAnalyticsClick(project.id, project.title)}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">{project.title}</p>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                      <span>${(project.funding_raised || 0).toLocaleString()}</span>
                                      <span>•</span>
                                      <span>{(project.views_count || 0).toLocaleString()} views</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {projectScore.toLocaleString()} pts
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant={project.status === 'published' || project.status === 'fundable' ? 'default' : 'secondary'}>
                                  {project.status}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest updates on your projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projects.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                          <Activity className="h-12 w-12 opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">No activity yet</h3>
                        <p className="text-sm">Create your first project to see analytics!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {projects.slice(0, 5).map((project) => (
                          <div 
                            key={project.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">{project.title}</p>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                  <span className="capitalize">{project.status}</span>
                                  <span>•</span>
                                  <span>{(project.views_count || 0).toLocaleString()} views</span>
                                  <span>•</span>
                                  <span>${(project.funding_raised || 0).toLocaleString()} raised</span>
                                  {project.updated_at && (
                                    <>
                                      <span>•</span>
                                      <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge variant={project.status === 'published' || project.status === 'fundable' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Analytics Modal */}
      {analyticsProjectId && (
        <ProjectAnalyticsModal
          projectId={analyticsProjectId}
          projectTitle={analyticsProjectTitle}
          isOpen={isAnalyticsModalOpen}
          onClose={closeAnalyticsModal}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
