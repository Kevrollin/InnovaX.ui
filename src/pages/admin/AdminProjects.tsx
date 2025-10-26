import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Download,
  RefreshCw,
  Flag,
  Ban,
  Edit,
  Trash2,
  Heart,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { projectsAPI } from '@/services/projects';
import ProjectDetailsModal from '@/components/admin/ProjectDetailsModal';

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

const AdminProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Mock data - replace with actual API calls
  const mockProjects: Project[] = [
    {
      id: 1,
      owner_id: 1,
      title: 'AI-Powered Study Assistant',
      description: 'An intelligent study companion that helps students organize their learning materials and track progress.',
      short_description: 'Smart study companion for students',
      repo_url: 'https://github.com/student/ai-study-assistant',
      demo_url: 'https://demo.example.com',
      website_url: 'https://project.example.com',
      funding_goal: 5000,
      currency: 'XLM',
      tags: ['AI', 'Education', 'Machine Learning'],
      category: 'Technology',
      difficulty_level: 'intermediate',
      status: 'published',
      is_featured: true,
      is_public: true,
      funding_raised: 2500,
      views_count: 1250,
      likes_count: 89,
      shares_count: 23,
      screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
      videos: ['demo.mp4'],
      documents: ['proposal.pdf', 'technical_specs.pdf'],
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:22:00Z',
      published_at: '2024-01-16T09:15:00Z',
      owner: {
        id: 1,
        username: 'john_student',
        full_name: 'John Doe'
      }
    },
    {
      id: 2,
      owner_id: 2,
      title: 'Sustainable Energy Monitor',
      description: 'A device that monitors energy consumption and suggests ways to reduce environmental impact.',
      short_description: 'Energy monitoring for sustainability',
      repo_url: 'https://github.com/student/energy-monitor',
      funding_goal: 3000,
      currency: 'XLM',
      tags: ['IoT', 'Sustainability', 'Hardware'],
      category: 'Environment',
      difficulty_level: 'advanced',
      status: 'pending_review',
      is_featured: false,
      is_public: true,
      funding_raised: 0,
      views_count: 45,
      likes_count: 12,
      shares_count: 3,
      created_at: '2024-01-18T11:20:00Z',
      updated_at: '2024-01-18T11:20:00Z',
      owner: {
        id: 2,
        username: 'jane_smith',
        full_name: 'Jane Smith'
      }
    },
    {
      id: 3,
      owner_id: 3,
      title: 'Community Garden App',
      description: 'An app that connects local gardeners and helps manage community garden spaces.',
      short_description: 'Connect local gardeners',
      funding_goal: 2000,
      currency: 'XLM',
      tags: ['Mobile', 'Community', 'Agriculture'],
      category: 'Social',
      difficulty_level: 'beginner',
      status: 'funded',
      is_featured: false,
      is_public: true,
      funding_raised: 2000,
      views_count: 890,
      likes_count: 67,
      shares_count: 15,
      created_at: '2024-01-10T08:45:00Z',
      updated_at: '2024-01-25T16:30:00Z',
      published_at: '2024-01-11T10:00:00Z',
      owner: {
        id: 3,
        username: 'mike_wilson',
        full_name: 'Mike Wilson'
      }
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Mock API call - replace with actual implementation
        setProjects(mockProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.owner?.username && project.owner.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-success text-white"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
      case 'funded':
        return <Badge variant="default" className="bg-primary text-white"><DollarSign className="h-3 w-3 mr-1" />Funded</Badge>;
      case 'pending_review':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'draft':
        return <Badge variant="outline"><Edit className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'archived':
        return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Badge variant="default" className="bg-success text-white">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="default" className="bg-primary text-white">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="destructive">Advanced</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const handleProjectAction = async (projectId: number, action: string) => {
    setActionLoading(projectId);
    try {
      // Mock API call - replace with actual implementation
      console.log(`Performing ${action} on project ${projectId}`);
      
      // Update local state
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              status: action,
              updated_at: new Date().toISOString()
            }
          : project
      ));
      
      setIsDetailsOpen(false);
    } catch (error) {
      console.error(`Failed to ${action} project:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCounts = () => {
    return {
      all: projects.length,
      published: projects.filter(p => p.status === 'published').length,
      pending_review: projects.filter(p => p.status === 'pending_review').length,
      funded: projects.filter(p => p.status === 'funded').length,
      draft: projects.filter(p => p.status === 'draft').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Project Management</h1>
            <p className="text-muted-foreground mt-2">Monitor and manage all platform projects</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold text-foreground">{statusCounts.all}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-foreground">{statusCounts.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-foreground">{statusCounts.pending_review}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Funded</p>
                  <p className="text-2xl font-bold text-foreground">{statusCounts.funded}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Search & Filters</CardTitle>
            <CardDescription>Find specific projects by title, description, or owner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-primary text-primary-foreground' : ''}
                >
                  All ({statusCounts.all})
                </Button>
                <Button
                  variant={filterStatus === 'published' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('published')}
                  className={filterStatus === 'published' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Published ({statusCounts.published})
                </Button>
                <Button
                  variant={filterStatus === 'pending_review' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending_review')}
                  className={filterStatus === 'pending_review' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Pending ({statusCounts.pending_review})
                </Button>
                <Button
                  variant={filterStatus === 'funded' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('funded')}
                  className={filterStatus === 'funded' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Funded ({statusCounts.funded})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Projects ({filteredProjects.length})</CardTitle>
            <CardDescription>
              Manage all platform projects and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Project</TableHead>
                    <TableHead className="text-foreground">Owner</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-foreground">Funding</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Created</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="border-border hover:bg-secondary/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-foreground">
                              {project.title.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground truncate">{project.title}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {project.short_description || project.description.substring(0, 50)}...
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {project.is_featured && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {project.difficulty_level && getDifficultyBadge(project.difficulty_level)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{project.owner?.full_name || project.owner?.username}</div>
                          <div className="text-sm text-muted-foreground">@{project.owner?.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-foreground">{project.category || 'Uncategorized'}</div>
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {project.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-foreground font-medium">
                            {project.funding_raised.toLocaleString()} / {project.funding_goal.toLocaleString()} {project.currency}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round((project.funding_raised / project.funding_goal) * 100)}% funded
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(project.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setIsDetailsOpen(true);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAction={handleProjectAction}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminProjects;
