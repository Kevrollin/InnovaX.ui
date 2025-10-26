import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Share2, 
  ExternalLink, 
  Github, 
  Globe, 
  Play, 
  Download,
  User,
  Calendar,
  Target,
  TrendingUp,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { projectsAPI } from '@/services/projects';
import { donationsAPI } from '@/services/donations';
import { Project, Donation } from '@/types';
import { toast } from 'sonner';

// TODO: Replace with real API calls

const ProjectDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [projectData, donationsData] = await Promise.all([
          projectsAPI.getProject(id),
          donationsAPI.getDonations({ project_id: id })
        ]);
        
        setProject(projectData);
        setDonations(donationsData);
      } catch (error) {
        console.error('Failed to fetch project data:', error);
        toast.error('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fundingPercentage = project ? (project.funding_raised / project.funding_goal) * 100 : 0;
  const daysLeft = project ? Math.ceil((new Date(project.published_at!).getTime() + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleDonate = () => {
    if (!isAuthenticated) {
      toast.error('Please login to make a donation');
      return;
    }
    // Navigate to donation flow
    toast.info('Redirecting to donation page...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
            <Link to="/projects">
              <Button>Browse Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{project.title}</span>
            </nav>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {project.is_featured && (
                            <Badge className="bg-accent text-accent-foreground">
                              <Star className="mr-1 h-3 w-3" />
                              Featured
                            </Badge>
                          )}
                          <Badge variant="secondary">{project.category}</Badge>
                          <Badge variant="outline">{project.difficulty_level}</Badge>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
                          {project.title}
                        </h1>
                        <p className="text-muted-foreground text-base sm:text-lg">
                          {project.short_description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLike}
                          className={isLiked ? 'text-primary border-primary' : ''}
                        >
                          <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                          {project.likes_count}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{project.views_count}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">{project.likes_count}</div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">{project.shares_count}</div>
                        <div className="text-xs text-muted-foreground">Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{donations.length}</div>
                        <div className="text-xs text-muted-foreground">Donors</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Project Images */}
              {project.screenshots && project.screenshots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-border bg-card">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={project.screenshots[currentImageIndex]}
                          alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                          className="w-full h-64 sm:h-80 object-cover rounded-t-lg"
                        />
                        {project.screenshots.length > 1 && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                              onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                              onClick={() => setCurrentImageIndex(Math.min(project.screenshots!.length - 1, currentImageIndex + 1))}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                      {project.screenshots.length > 1 && (
                        <div className="flex gap-2 p-4">
                          {project.screenshots.map((screenshot, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                                index === currentImageIndex ? 'border-primary' : 'border-border'
                              }`}
                            >
                              <img
                                src={screenshot}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Project Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="donors">Donors</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle>Project Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          {project.description.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 text-muted-foreground">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Links */}
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle>Project Links</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {project.repo_url && (
                          <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-card/50 transition-colors"
                          >
                            <Github className="h-5 w-5 text-muted-foreground" />
                            <span>GitHub Repository</span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                          </a>
                        )}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-card/50 transition-colors"
                          >
                            <Play className="h-5 w-5 text-muted-foreground" />
                            <span>Live Demo</span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                          </a>
                        )}
                        {project.website_url && (
                          <a
                            href={project.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-card/50 transition-colors"
                          >
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <span>Project Website</span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="milestones" className="space-y-6">
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle>Project Milestones</CardTitle>
                        <CardDescription>Track the progress of this project</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {project.milestones?.map((milestone, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{milestone.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(milestone.target_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {milestone.funding_required} {project.currency}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="updates" className="space-y-6">
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle>Project Updates</CardTitle>
                        <CardDescription>Latest news and progress updates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No updates yet. Check back later for project progress!</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="donors" className="space-y-6">
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle>Recent Donors</CardTitle>
                        <CardDescription>Thank you to our supporters</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {donations.map((donation) => (
                          <div key={donation.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                            <Avatar>
                              <AvatarFallback>
                                {donation.donor?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {donation.is_anonymous ? 'Anonymous' : donation.donor?.username}
                                </span>
                                <Badge variant="secondary">
                                  {donation.amount} {donation.currency}
                                </Badge>
                              </div>
                              {donation.message && (
                                <p className="text-sm text-muted-foreground mt-1">"{donation.message}"</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(donation.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Funding Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border bg-card sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Funding Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Raised</span>
                        <span className="font-semibold text-primary">
                          {fundingPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={fundingPercentage} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {project.funding_raised.toLocaleString()} {project.currency}
                        </span>
                        <span>
                          Goal: {project.funding_goal.toLocaleString()} {project.currency}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Days Left</span>
                        <span className="font-semibold">{daysLeft}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Donors</span>
                        <span className="font-semibold">{donations.length}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleDonate}
                      className="w-full shadow-glow"
                      size="lg"
                    >
                      Fund This Project
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Creator Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Project Creator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {project.owner?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{project.owner?.full_name || project.owner?.username}</h4>
                        <p className="text-sm text-muted-foreground">@{project.owner?.username}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
