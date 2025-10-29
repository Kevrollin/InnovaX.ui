import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, User, CheckCircle2, HelpCircle, Share2, DollarSign, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { Project } from '@/types';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { projectsAPI } from '@/services/projects';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { isAuthenticated } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(project.likes_count || 0);
  const [sharesCount, setSharesCount] = useState(project.shares_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all images (banner + additional images)
  const allImages = [
    project.banner_image,
    ...(project.screenshots || [])
  ].filter(Boolean);
  

  // Real-time event listeners for engagement updates
  useEffect(() => {
    const handleProjectLiked = (event: CustomEvent) => {
      if (event.detail?.projectId === project.id.toString()) {
        setLikesCount(prev => prev + 1);
      }
    };

    const handleProjectUnliked = (event: CustomEvent) => {
      if (event.detail?.projectId === project.id.toString()) {
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    };

    const handleProjectShared = (event: CustomEvent) => {
      if (event.detail?.projectId === project.id.toString()) {
        setSharesCount(prev => prev + 1);
      }
    };

    window.addEventListener('project-liked', handleProjectLiked as EventListener);
    window.addEventListener('project-unliked', handleProjectUnliked as EventListener);
    window.addEventListener('project-shared', handleProjectShared as EventListener);

    return () => {
      window.removeEventListener('project-liked', handleProjectLiked as EventListener);
      window.removeEventListener('project-unliked', handleProjectUnliked as EventListener);
      window.removeEventListener('project-shared', handleProjectShared as EventListener);
    };
  }, [project.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to like projects');
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await projectsAPI.likeProject(project.id.toString());
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
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSharing) return;

    try {
      setIsSharing(true);
      const response = await projectsAPI.trackShare(project.id.toString());
      setSharesCount(response.sharesCount);
      
      // Copy link to clipboard
      const url = `${window.location.origin}/projects/${project.id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Project link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share project:', error);
      toast.error('Failed to share project');
    } finally {
      setIsSharing(false);
    }
  };

  const handleFund = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to fund projects');
      return;
    }
    
    // Navigate to project detail page for funding
    window.location.href = `/projects/${project.id}`;
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden border-border bg-card hover:shadow-elegant transition-all duration-300">
        {/* Project Image Carousel */}
        <div className="relative h-48 w-full overflow-hidden bg-secondary">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[currentImageIndex]}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Navigation arrows - only show if multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
              
              {/* Image indicators */}
              {allImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <span className="text-4xl font-heading font-bold text-muted-foreground opacity-50">
                {project.title.charAt(0)}
              </span>
            </div>
          )}
          
          {project.is_featured && (
            <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
          {/* Fundable badge - projects are always from verified students */}
          <Badge className="absolute top-4 left-4 bg-green-600 hover:bg-green-700 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Fundable
          </Badge>
        </div>

        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link to={`/projects/${project.id}`}>
                <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {project.title}
                </h3>
              </Link>
              <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{project.owner?.username || 'Anonymous'}</span>
                <span className="text-green-600">✓</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        <HelpCircle className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified student project</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {project.owner?.university && (
                <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
                  <GraduationCap className="h-3 w-3" />
                  <span className="truncate">{project.owner.university}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.short_description || project.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2">
          <div className="flex gap-4 flex-1">
            <button 
              className={`flex items-center gap-1 text-sm transition-colors duration-200 ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {isLiking ? '...' : likesCount}
            </button>
            <button 
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-500 transition-colors duration-200"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Share2 className="h-4 w-4" />
              {isSharing ? '...' : sharesCount}
            </button>
            <button 
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600 transition-colors duration-200 font-medium"
              onClick={handleFund}
            >
              <DollarSign className="h-4 w-4" />
              Fund
            </button>
          </div>
          <Link to={`/projects/${project.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
            View Project
            <ExternalLink className="ml-1 h-3 w-3 inline" />
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
