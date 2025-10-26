import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ExternalLink, 
  Github, 
  Calendar, 
  DollarSign, 
  Users, 
  Eye, 
  Heart, 
  Share2,
  Star,
  Flag,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Download,
  Play,
  FileText,
  Image,
  Video,
  TrendingUp,
  Target,
  Award,
  Globe,
  Code,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  short_description?: string;
  repo_url?: string;
  demo_url?: string;
  website_url?: string;
  funding_goal: number;
  currency: string;
  tags?: string[];
  category?: string;
  difficulty_level?: string;
  status: string;
  is_featured: boolean;
  is_public: boolean;
  funding_raised: number;
  views_count: number;
  likes_count: number;
  shares_count: number;
  screenshots?: string[];
  videos?: string[];
  documents?: string[];
  created_at: string;
  updated_at?: string;
  published_at?: string;
  owner?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (projectId: number, action: string) => void;
  isLoading: number | null;
}

const ProjectDetailsModal = ({ 
  project, 
  isOpen, 
  onClose, 
  onAction, 
  isLoading 
}: ProjectDetailsModalProps) => {
  const [showActionDialog, setShowActionDialog] = useState<string | null>(null);

  if (!project) return null;

  const handleAction = (action: string) => {
    onAction(project.id, action);
    setShowActionDialog(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-success';
      case 'funded': return 'text-primary';
      case 'pending_review': return 'text-orange-500';
      case 'draft': return 'text-muted-foreground';
      case 'archived': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'funded': return <DollarSign className="h-4 w-4" />;
      case 'pending_review': return <Clock className="h-4 w-4" />;
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'archived': return <Ban className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-success text-white';
      case 'intermediate': return 'bg-primary text-white';
      case 'advanced': return 'bg-destructive text-white';
      default: return 'bg-secondary text-foreground';
    }
  };

  const fundingPercentage = Math.round((project.funding_raised / project.funding_goal) * 100);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Project Details</span>
            </DialogTitle>
            <DialogDescription>
              Comprehensive project information and management
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Project Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-foreground">
                            {project.title.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-heading font-bold text-foreground">
                            {project.title}
                          </h2>
                          <p className="text-muted-foreground">{project.short_description || project.description.substring(0, 100)}...</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge 
                              variant={project.status === 'published' ? 'default' : 
                                     project.status === 'funded' ? 'default' : 
                                     project.status === 'pending_review' ? 'secondary' : 'outline'}
                              className={`text-xs ${getStatusColor(project.status)}`}
                            >
                              {getStatusIcon(project.status)}
                              <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                            </Badge>
                            {project.is_featured && (
                              <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {project.difficulty_level && (
                              <Badge variant="outline" className={`text-xs ${getDifficultyColor(project.difficulty_level)}`}>
                                {project.difficulty_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-foreground font-medium">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Project Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Funding</p>
                        <p className="text-lg font-bold text-foreground">
                          {project.funding_raised.toLocaleString()} / {project.funding_goal.toLocaleString()} {project.currency}
                        </p>
                        <Progress value={fundingPercentage} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">{fundingPercentage}% funded</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Views</p>
                        <p className="text-lg font-bold text-foreground">{project.views_count.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Likes</p>
                        <p className="text-lg font-bold text-foreground">{project.likes_count.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Share2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Shares</p>
                        <p className="text-lg font-bold text-foreground">{project.shares_count.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Project Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Project Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Description</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Category</h4>
                      <p className="text-muted-foreground">{project.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Difficulty Level</h4>
                      <p className="text-muted-foreground capitalize">{project.difficulty_level || 'Not specified'}</p>
                    </div>
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Project Links */}
            {(project.repo_url || project.demo_url || project.website_url) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center space-x-2">
                      <ExternalLink className="h-5 w-5" />
                      <span>Project Links</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.repo_url && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center space-x-3">
                            <Github className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground font-medium">Repository</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                      {project.demo_url && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center space-x-3">
                            <Play className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground font-medium">Demo</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                      {project.website_url && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground font-medium">Website</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.website_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Media Files */}
            {(project.screenshots || project.videos || project.documents) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Media & Documents</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.screenshots && project.screenshots.length > 0 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                            <Image className="h-4 w-4" />
                            <span>Screenshots</span>
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {project.screenshots.map((screenshot, index) => (
                              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                                <span className="text-sm text-foreground truncate">{screenshot}</span>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {project.videos && project.videos.length > 0 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                            <Video className="h-4 w-4" />
                            <span>Videos</span>
                          </h4>
                          <div className="space-y-2">
                            {project.videos.map((video, index) => (
                              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                                <span className="text-sm text-foreground">{video}</span>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {project.documents && project.documents.length > 0 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Documents</span>
                          </h4>
                          <div className="space-y-2">
                            {project.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                                <span className="text-sm text-foreground">{doc}</span>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Owner Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Project Owner</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">
                        {project.owner?.full_name?.charAt(0) || project.owner?.username?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{project.owner?.full_name || project.owner?.username}</h4>
                      <p className="text-sm text-muted-foreground">@{project.owner?.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Project Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Project Management</CardTitle>
                  <CardDescription>Manage project status and visibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {project.status === 'pending_review' && (
                      <>
                        <AlertDialog open={showActionDialog === 'approve'} onOpenChange={(open) => setShowActionDialog(open ? 'approve' : null)}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              className="bg-success hover:bg-success/90"
                              disabled={isLoading === project.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this project? It will be published and visible to all users.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAction('published')}>
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={showActionDialog === 'reject'} onOpenChange={(open) => setShowActionDialog(open ? 'reject' : null)}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive"
                              disabled={isLoading === project.id}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject this project? It will be moved to draft status.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAction('draft')}>
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={isLoading === project.id}>
                          <Flag className="h-4 w-4 mr-2" />
                          Flag
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Flag Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Flag this project for review. This will mark it for additional scrutiny.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAction('flagged')}>
                            Flag Project
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isLoading === project.id}>
                          <Ban className="h-4 w-4 mr-2" />
                          Archive
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Archive Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Archive this project. It will be hidden from public view.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAction('archived')}>
                            Archive
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button 
                      variant="outline" 
                      disabled={isLoading === project.id}
                      onClick={() => handleAction(project.is_featured ? 'unfeature' : 'feature')}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {project.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectDetailsModal;
