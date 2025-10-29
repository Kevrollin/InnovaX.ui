import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  TrendingUp, 
  Wallet, 
  Gift, 
  Star,
  ExternalLink,
  Plus,
  Eye,
  Share2,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Users,
  Target,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { donationsAPI } from '@/services/donations';
import { projectsAPI } from '@/services/projects';
import { Project, Donation } from '@/types';


const DonorDashboard = () => {
  const { user } = useAuthStore();
  const { wallet } = useWalletStore();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalDonated: 0,
    projectsSupported: 0,
    impactScore: 0,
    thisMonthDonations: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to get user's favorite projects (liked projects)
  const getFavoriteProjects = async (userId: string) => {
    try {
      const allProjects = await projectsAPI.getProjects();
      const favoriteProjects = [];
      
      // Check each project's like status
      for (const project of allProjects) {
        try {
          const likeStatus = await projectsAPI.getLikeStatus(project.id.toString());
          if (likeStatus.liked) {
            favoriteProjects.push(project);
          }
        } catch (error) {
          // Skip projects that can't be checked
          console.warn(`Could not check like status for project ${project.id}:`, error);
        }
      }
      
      return favoriteProjects;
    } catch (error) {
      console.error('Failed to get favorite projects:', error);
      return [];
    }
  };

  // Function to get recommended projects based on user's donation history
  const getRecommendedProjects = async (donationsData: Donation[]) => {
    try {
      const allProjects = await projectsAPI.getProjects();
      
      // Get categories from user's previous donations
      const donatedProjectIds = donationsData
        .filter(d => d.status === 'completed' || d.status === 'confirmed')
        .map(d => d.project_id);
      
      // For now, return random projects as recommendations
      // In a real app, this would use ML or sophisticated algorithms
      const shuffled = [...allProjects].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 4); // Return 4 recommended projects
    } catch (error) {
      console.error('Failed to get recommended projects:', error);
      return [];
    }
  };

  const calculateAnalytics = (donationsData: Donation[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate total donated amount
    const totalDonated = donationsData
      .filter(donation => donation.status === 'completed' || donation.status === 'confirmed')
      .reduce((sum, donation) => sum + donation.amount, 0);
    
    // Calculate unique projects supported
    const uniqueProjects = new Set(
      donationsData
        .filter(donation => donation.status === 'completed' || donation.status === 'confirmed')
        .map(donation => donation.project_id)
    );
    const projectsSupported = uniqueProjects.size;
    
    // Calculate this month's donations
    const thisMonthDonations = donationsData
      .filter(donation => {
        const donationDate = new Date(donation.created_at);
        return donationDate >= thisMonth && (donation.status === 'completed' || donation.status === 'confirmed');
      })
      .reduce((sum, donation) => sum + donation.amount, 0);
    
    // Calculate impact score (percentage of successful donations)
    const totalDonations = donationsData.length;
    const successfulDonations = donationsData.filter(d => d.status === 'completed' || d.status === 'confirmed').length;
    const impactScore = totalDonations > 0 ? Math.round((successfulDonations / totalDonations) * 100) : 0;
    
    setAnalytics({
      totalDonated,
      projectsSupported,
      impactScore,
      thisMonthDonations
    });
  };

  // Function to refresh dashboard data
  const refreshDashboardData = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      const [donationsResponse, projectsResponse] = await Promise.all([
        donationsAPI.getDonations({ donor_id: user.id.toString() }),
        projectsAPI.getProjects()
      ]);
      
      const donationsData = Array.isArray(donationsResponse) ? donationsResponse : [];
      const projectsData = Array.isArray(projectsResponse) ? projectsResponse : [];
      
      setDonations(donationsData);
      
      // Get favorite and recommended projects
      const [favorites, recommendations] = await Promise.all([
        getFavoriteProjects(user.id.toString()),
        getRecommendedProjects(donationsData)
      ]);
      
      setFavoriteProjects(favorites);
      setRecommendedProjects(recommendations);
      calculateAnalytics(donationsData);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsResponse, projectsResponse] = await Promise.all([
          donationsAPI.getDonations({ donor_id: user?.id?.toString() }),
          projectsAPI.getProjects()
        ]);
        
        // Handle API responses - they return arrays directly
        const donationsData = Array.isArray(donationsResponse) ? donationsResponse : [];
        const projectsData = Array.isArray(projectsResponse) ? projectsResponse : [];
        
        setDonations(donationsData);
        
        // Get favorite and recommended projects
        const [favorites, recommendations] = await Promise.all([
          getFavoriteProjects(user.id.toString()),
          getRecommendedProjects(donationsData)
        ]);
        
        setFavoriteProjects(favorites);
        setRecommendedProjects(recommendations);
        
        // Calculate analytics from donations data
        calculateAnalytics(donationsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set empty arrays on error
        setDonations([]);
        setFavoriteProjects([]);
        setRecommendedProjects([]);
        // Reset analytics
        setAnalytics({
          totalDonated: 0,
          projectsSupported: 0,
          impactScore: 0,
          thisMonthDonations: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Listen for real-time updates
  useEffect(() => {
    const handleDonationUpdate = () => {
      console.log('Donation update detected, refreshing dashboard...');
      refreshDashboardData();
    };

    const handleProjectLike = () => {
      console.log('Project like detected, refreshing dashboard...');
      refreshDashboardData();
    };

    const handleWalletUpdate = () => {
      console.log('Wallet update detected, refreshing dashboard...');
      refreshDashboardData();
    };

    // Listen for custom events
    window.addEventListener('donation-created', handleDonationUpdate);
    window.addEventListener('donation-updated', handleDonationUpdate);
    window.addEventListener('project-liked', handleProjectLike);
    window.addEventListener('project-unliked', handleProjectLike);
    window.addEventListener('wallet-updated', handleWalletUpdate);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('donation-created', handleDonationUpdate);
      window.removeEventListener('donation-updated', handleDonationUpdate);
      window.removeEventListener('project-liked', handleProjectLike);
      window.removeEventListener('project-unliked', handleProjectLike);
      window.removeEventListener('wallet-updated', handleWalletUpdate);
    };
  }, []);

  const stats = [
    {
      title: 'Total Donated',
      value: `$${analytics.totalDonated.toLocaleString()}`,
      change: analytics.thisMonthDonations > 0 ? `$${analytics.thisMonthDonations.toLocaleString()} this month` : 'No donations yet',
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      title: 'Projects Supported',
      value: analytics.projectsSupported.toString(),
      change: analytics.projectsSupported > 0 ? `${analytics.projectsSupported} unique projects` : 'No projects yet',
      icon: Heart,
      color: 'text-accent',
    },
    {
      title: 'Impact Score',
      value: `${analytics.impactScore}%`,
      change: analytics.impactScore > 0 ? 'Success rate' : 'No donations yet',
      icon: Star,
      color: 'text-success',
    },
    {
      title: 'Wallet Balance',
      value: wallet ? `${wallet.xlm_balance} XLM` : 'Connect Wallet',
      change: wallet ? `${wallet.usdc_balance} USDC` : '',
      icon: Wallet,
      color: 'text-primary',
    },
  ];

  const filteredDonations = Array.isArray(donations) ? donations.filter(donation => {
    const matchesSearch = donation.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return <Badge className="bg-success/10 text-success border-success/20">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Pending</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
                  Donor <span className="text-primary">Dashboard</span>
                </h1>
                <p className="text-muted-foreground">Track your donations and discover new projects</p>
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <Button 
                    variant="outline" 
                    onClick={refreshDashboardData}
                    disabled={isRefreshing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                )}
                <Link to="/projects">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Discover Projects
                  </Button>
                </Link>
                <Link to="/donor/wallet">
                  <Button>
                    <Wallet className="mr-2 h-4 w-4" />
                    Manage Wallet
                  </Button>
                </Link>
              </div>
            </div>
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
            <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="donations">My Donations</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Recent Donations */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Recent Donations</CardTitle>
                      <CardDescription>Your latest contributions to student projects</CardDescription>
                    </div>
                    <Link to="/donor/donations">
                      <Button variant="outline" size="sm">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {donations.length > 0 ? (
                    <div className="space-y-4">
                      {donations.slice(0, 3).map((donation) => (
                        <div key={donation.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Gift className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{donation.project?.title}</h4>
                              {getStatusBadge(donation.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {donation.amount} {donation.currency} • {new Date(donation.created_at).toLocaleDateString()}
                            </p>
                            {donation.message && (
                              <p className="text-sm italic">"{donation.message}"</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {donation.amount} {donation.currency}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Gift className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No donations yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start supporting student projects and make a difference!
                      </p>
                      <Link to="/projects">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Browse Projects
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Projects */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Recommended for You</CardTitle>
                      <CardDescription>Projects that match your interests</CardDescription>
                    </div>
                    <Link to="/projects">
                      <Button variant="outline" size="sm">
                        Browse All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recommendedProjects.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {recommendedProjects.slice(0, 2).map((project) => {
                        return (
                          <div key={project.id} className="p-4 rounded-lg border border-border hover:shadow-elegant transition-all duration-300">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1 line-clamp-1">{project.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{project.short_description}</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary">{project.category}</Badge>
                                <Badge variant="outline">{project.difficulty_level}</Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {project.owner?.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">@{project.owner?.username}</span>
                                {project.owner?.university && (
                                  <span className="text-xs text-muted-foreground">• {project.owner.university}</span>
                                )}
                              </div>
                              <Link to={`/projects/${project.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="mr-1 h-3 w-3" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No projects available</h3>
                      <p className="text-muted-foreground mb-4">
                        Check back later for new student projects to support!
                      </p>
                      <Link to="/projects">
                        <Button variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Browse All Projects
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="donations" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>All Donations</CardTitle>
                      <CardDescription>Complete history of your contributions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredDonations.length > 0 ? (
                    <div className="space-y-4">
                      {filteredDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Gift className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{donation.project?.title}</h4>
                              {getStatusBadge(donation.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {donation.amount} {donation.currency} • {new Date(donation.created_at).toLocaleDateString()}
                            </p>
                            {donation.message && (
                              <p className="text-sm italic">"{donation.message}"</p>
                            )}
                            {donation.tx_hash && (
                              <p className="text-xs text-muted-foreground font-mono">
                                TX: {donation.tx_hash}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {donation.amount} {donation.currency}
                            </div>
                            <Link to={`/projects/${donation.project_id}`}>
                              <Button variant="outline" size="sm" className="mt-2">
                                <ExternalLink className="mr-1 h-3 w-3" />
                                View Project
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                        <Gift className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {donations.length === 0 ? 'No donations yet' : 'No donations match your filters'}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {donations.length === 0 
                          ? 'Start supporting student projects and make a difference in their educational journey!'
                          : 'Try adjusting your search or filter criteria to find your donations.'
                        }
                      </p>
                      {donations.length === 0 && (
                        <Link to="/projects">
                          <Button size="lg">
                            <Plus className="mr-2 h-5 w-5" />
                            Browse Projects
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Favorite Projects</CardTitle>
                  <CardDescription>Projects you've liked and want to follow</CardDescription>
                </CardHeader>
                <CardContent>
                  {favoriteProjects.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoriteProjects.map((project) => {
                        return (
                          <div key={project.id} className="p-4 rounded-lg border border-border hover:shadow-elegant transition-all duration-300">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1 line-clamp-1">{project.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{project.short_description}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-primary">
                                <Heart className="h-4 w-4 fill-current" />
                              </Button>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary">{project.category}</Badge>
                                <Badge variant="outline">{project.difficulty_level}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {project.likes_count || 0} likes
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {project.views_count || 0} views
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {project.owner?.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-xs text-muted-foreground">
                                  <div>@{project.owner?.username}</div>
                                  {project.owner?.university && (
                                    <div className="text-xs">{project.owner.university}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <Share2 className="h-3 w-3" />
                                </Button>
                                <Link to={`/projects/${project.id}`}>
                                  <Button size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">No favorite projects yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Like projects you're interested in to see them here. Start exploring and heart the ones that catch your attention!
                      </p>
                      <Link to="/projects">
                        <Button size="lg">
                          <Heart className="mr-2 h-5 w-5" />
                          Explore Projects
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="impact" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Your Impact</CardTitle>
                  <CardDescription>See the difference you're making in student innovation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-lg border border-border">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary mb-2">{analytics.projectsSupported}</h3>
                      <p className="text-sm text-muted-foreground">Projects Supported</p>
                    </div>
                    
                    <div className="text-center p-6 rounded-lg border border-border">
                      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-accent mb-2">{analytics.projectsSupported}</h3>
                      <p className="text-sm text-muted-foreground">Students Helped</p>
                    </div>
                    
                    <div className="text-center p-6 rounded-lg border border-border">
                      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="text-2xl font-bold text-success mb-2">${analytics.totalDonated.toLocaleString()}</h3>
                      <p className="text-sm text-muted-foreground">Total Donated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Impact Timeline</CardTitle>
                  <CardDescription>Your contribution history over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Impact analytics will be available as you make more donations</p>
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

export default DonorDashboard;