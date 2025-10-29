import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ChevronRight,
  Clock,
  DollarSign,
  Users,
  Eye,
  ThumbsUp,
  Bookmark,
  Flag,
  MoreHorizontal,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Award,
  Code2,
  Palette,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Copy,
  Shield,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Twitter,
  Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { projectsAPI } from '@/services/projects';
import { donationsAPI } from '@/services/donations';
import { Project, Donation } from '@/types';
import { toast } from 'sonner';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all images (banner + additional images)
  const allImages = project ? [
    project.banner_image,
    ...(project.screenshots || [])
  ].filter(Boolean) : [];
  const [isLoading, setIsLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [projectData, donationsData, likeStatus] = await Promise.all([
          projectsAPI.getProject(id),
          donationsAPI.getDonations({ project_id: id }),
          projectsAPI.getLikeStatus(id)
        ]);
        
        setProject(projectData);
        setDonations(donationsData);
        setIsLiked(likeStatus.liked);
        setLikesCount(projectData.likes_count || 0);
        setSharesCount(projectData.shares_count || 0);
        setViewsCount(projectData.views_count || 0);
        
        // Track view
        projectsAPI.trackView(id).catch(console.error);
      } catch (error) {
        console.error('Failed to fetch project data:', error);
        toast.error('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Real-time event listeners for engagement updates
  useEffect(() => {
    if (!id) return;

    const handleProjectLiked = (event: CustomEvent) => {
      if (event.detail?.projectId === id) {
        setLikesCount(prev => prev + 1);
      }
    };

    const handleProjectUnliked = (event: CustomEvent) => {
      if (event.detail?.projectId === id) {
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    };

    const handleProjectShared = (event: CustomEvent) => {
      if (event.detail?.projectId === id) {
        setSharesCount(prev => prev + 1);
      }
    };

    const handleProjectViewed = (event: CustomEvent) => {
      if (event.detail?.projectId === id) {
        setViewsCount(prev => prev + 1);
      }
    };

    window.addEventListener('project-liked', handleProjectLiked as EventListener);
    window.addEventListener('project-unliked', handleProjectUnliked as EventListener);
    window.addEventListener('project-shared', handleProjectShared as EventListener);
    window.addEventListener('project-viewed', handleProjectViewed as EventListener);

    return () => {
      window.removeEventListener('project-liked', handleProjectLiked as EventListener);
      window.removeEventListener('project-unliked', handleProjectUnliked as EventListener);
      window.removeEventListener('project-shared', handleProjectShared as EventListener);
      window.removeEventListener('project-viewed', handleProjectViewed as EventListener);
    };
  }, [id]);


  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like projects');
      return;
    }

    try {
      const response = await projectsAPI.likeProject(id!);
      setIsLiked(response.liked);
      setLikesCount(response.likesCount);
      
      if (response.liked) {
        toast.success('Project liked!');
      } else {
        toast.success('Project unliked!');
      }
    } catch (error) {
      console.error('Failed to like project:', error);
      toast.error('Failed to like project');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = project?.title || 'Check out this project';
    
    // Track share
    try {
      const response = await projectsAPI.trackShare(id!);
      setSharesCount(response.sharesCount);
    } catch (error) {
      console.error('Failed to track share:', error);
    }
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
    }
    setShowShareMenu(false);
  };

  const handleDonate = () => {
    if (!isAuthenticated) {
      toast.error('Please login to make a donation');
      return;
    }
    // Navigate to donation flow
    toast.info('Redirecting to donation page...');
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'fundable':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'funded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Project Not Found</h1>
              <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/projects">
                <Button className="w-full sm:w-auto">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Browse Projects
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <Navbar />

      <main className="flex-1">
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
              <span className="text-foreground font-medium">{project.title}</span>
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
                <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="space-y-6">
                    {/* Project Title and Meta */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {project.is_featured && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md">
                                <Star className="mr-1 h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant="secondary" className="font-medium">
                              {project.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`font-medium ${getDifficultyColor(project.difficulty_level || '')}`}
                            >
                              {project.difficulty_level}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`font-medium ${getStatusColor(project.status)}`}
                            >
                              {project.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                              {project.title}
                            </h1>
                            <div className="space-y-3">
                              <p className="text-muted-foreground text-lg leading-relaxed">
                                {isDescriptionExpanded ? project.description : project.short_description}
                              </p>
                              {project.description && project.description !== project.short_description && (
                                <button
                                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                  {isDescriptionExpanded ? (
                                    <>
                                      <ChevronUp className="h-4 w-4" />
                                      Show Less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4" />
                                      Read Full Description
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLike}
                            className={`transition-all duration-200 ${
                              isLiked 
                                ? 'text-red-500 border-red-500 bg-red-50 dark:bg-red-950/20' 
                                : 'hover:text-red-500 hover:border-red-500'
                            }`}
                          >
                            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                            {likesCount}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBookmark}
                            className={`transition-all duration-200 ${
                              isBookmarked 
                                ? 'text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                                : 'hover:text-blue-500 hover:border-blue-500'
                            }`}
                          >
                            <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            Save
                          </Button>

                          <div className="relative">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setShowShareMenu(!showShareMenu)}
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </Button>
                            
                            <AnimatePresence>
                              {showShareMenu && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50"
                                >
                                  <div className="p-2 space-y-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start"
                                      onClick={() => handleShare('copy')}
                                    >
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Link
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start"
                                      onClick={() => handleShare('twitter')}
                                    >
                                      <MessageCircle className="mr-2 h-4 w-4" />
                                      Twitter
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start"
                                      onClick={() => handleShare('linkedin')}
                                    >
                                      <Users className="mr-2 h-4 w-4" />
                                      LinkedIn
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start"
                                      onClick={() => handleShare('facebook')}
                                    >
                                      <Globe className="mr-2 h-4 w-4" />
                                      Facebook
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Edit button for owner */}
                          {user?.id && (project.owner?.id === user.id) && (
                            <Link to={`/student/projects/${project.id}/edit`}>
                              <Button size="sm">
                                Edit
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Project Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-center mb-1">
                            <Eye className="h-4 w-4 text-primary mr-1" />
                            <div className="text-2xl font-bold text-primary">{viewsCount}</div>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">Views</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-center mb-1">
                            <ThumbsUp className="h-4 w-4 text-accent mr-1" />
                            <div className="text-2xl font-bold text-accent">{likesCount}</div>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">Likes</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-center mb-1">
                            <Share2 className="h-4 w-4 text-green-500 mr-1" />
                            <div className="text-2xl font-bold text-green-500">{sharesCount}</div>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">Shares</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Project Gallery */}
              {allImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative group">
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={allImages[currentImageIndex]}
                            alt={`${project.title} image ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        
                        {allImages.length > 1 && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => setCurrentImageIndex(Math.min(allImages.length - 1, currentImageIndex + 1))}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-sm font-medium">
                          {currentImageIndex + 1} / {allImages.length}
                        </div>
                      </div>
                      
                      {allImages.length > 1 && (
                        <div className="p-4 bg-muted/20">
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {allImages.map((image, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                  index === currentImageIndex 
                                    ? 'border-primary shadow-md scale-105' 
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <img
                                  src={image}
                                  alt={`Thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/50">
                    <TabsTrigger value="overview" className="text-sm font-medium">
                      <Code2 className="mr-2 h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="milestones" className="text-sm font-medium">
                      <Target className="mr-2 h-4 w-4" />
                      Milestones
                    </TabsTrigger>
                    <TabsTrigger value="updates" className="text-sm font-medium">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Updates
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Project Description */}
                    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code2 className="h-5 w-5 text-primary" />
                          Project Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          {project.description.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Project Links */}
                    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ExternalLink className="h-5 w-5 text-primary" />
                          Project Links
                        </CardTitle>
                        <CardDescription>Access the project resources and demos</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(project.repo_url || (project as any).repoUrl) && (
                          <a
                            href={(project.repo_url || (project as any).repoUrl)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-card/50 transition-all duration-200 hover:shadow-md group"
                          >
                            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                              <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">GitHub Repository</div>
                              <div className="text-sm text-muted-foreground">View source code</div>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        )}
                        {(project.demo_url || (project as any).demoUrl) && (
                          <a
                            href={(project.demo_url || (project as any).demoUrl)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-card/50 transition-all duration-200 hover:shadow-md group"
                          >
                            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                              <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Live Demo</div>
                              <div className="text-sm text-muted-foreground">Try the application</div>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        )}
                        {(project.website_url || (project as any).websiteUrl) && (
                          <a
                            href={(project.website_url || (project as any).websiteUrl)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-card/50 transition-all duration-200 hover:shadow-md group"
                          >
                            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                              <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Project Website</div>
                              <div className="text-sm text-muted-foreground">Visit official site</div>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="milestones" className="space-y-6 mt-6">
                    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Project Milestones
                        </CardTitle>
                        <CardDescription>Track the progress and funding requirements</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {project.milestones?.map((milestone, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">{index + 1}</span>
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-semibold text-lg">{milestone.title}</h4>
                              <p className="text-muted-foreground">{milestone.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(milestone.target_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {milestone.funding_required.toLocaleString()} {project.currency}
                                </div>
                              </div>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-12 text-muted-foreground">
                            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No milestones defined for this project.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="updates" className="space-y-6 mt-6">
                    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-primary" />
                          Project Updates
                        </CardTitle>
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
                <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Support This Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Button 
                      onClick={handleDonate}
                      className="w-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      size="lg"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
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
                <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Project Creator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {project.owner?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{project.owner?.full_name || project.owner?.username}</h4>
                        <p className="text-sm text-muted-foreground">@{project.owner?.username}</p>
                        {project.owner?.university && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <GraduationCap className="h-3 w-3" />
                            <span>{project.owner.university}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowProfileModal(true)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>

                    {/* Social Links */}
                    {(project.owner?.github_url || project.owner?.twitter_url || project.owner?.linkedin_url) && (
                      <div className="pt-2 border-t border-border">
                        <div className="text-sm text-muted-foreground mb-2">Connect</div>
                        <div className="flex gap-2">
                          {project.owner.github_url && (
                            <a href={project.owner.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-card transition-colors">
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                          {project.owner.twitter_url && (
                            <a href={project.owner.twitter_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-card transition-colors">
                              <Twitter className="h-4 w-4" />
                            </a>
                          )}
                          {project.owner.linkedin_url && (
                            <a href={project.owner.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-card transition-colors">
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
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
                  <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Responsive Design Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" />
                      Responsive Design
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="h-4 w-4 text-green-500" />
                        <span>Mobile Optimized</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Tablet className="h-4 w-4 text-blue-500" />
                        <span>Tablet Ready</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Monitor className="h-4 w-4 text-purple-500" />
                        <span>Desktop Enhanced</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Student Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              Student Profile
            </DialogTitle>
            <DialogDescription>
              Verified student information (Limited view for security)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {project.owner?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {project.owner?.full_name || project.owner?.username}
                </h3>
                <p className="text-muted-foreground">@{project.owner?.username}</p>
                <Badge className="mt-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified Student
                </Badge>
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Public Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Username</span>
                    <span className="font-medium">@{project.owner?.username}</span>
                  </div>
                  {project.owner?.full_name && (
                    <div className="flex items-start justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{project.owner.full_name}</span>
                    </div>
                  )}
                  {project.owner?.university && (
                    <div className="flex items-start justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        University
                      </span>
                      <span className="font-medium text-right">{project.owner.university}</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between py-2">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Project Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{project.views_count}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{project.likes_count}</div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{project.shares_count}</div>
                      <div className="text-xs text-muted-foreground">Shares</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Security Notice
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      This is a limited view for security purposes. Sensitive information such as contact details, 
                      email, and academic records are protected and only visible to authorized users.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setShowProfileModal(false);
                  handleDonate();
                }}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Fund This Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
