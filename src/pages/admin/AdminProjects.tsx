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
  Share2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/services/admin';
import { Project } from '@/types';
import ProjectDetailsModal from '@/components/admin/ProjectDetailsModal';

const AdminProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Map admin project to main Project type
  const mapAdminProjectToProject = (adminProject: any): Project => ({
    id: adminProject.id,
    owner_id: adminProject.creatorId,
    title: adminProject.title,
    description: adminProject.description,
    short_description: adminProject.short_description,
    repo_url: adminProject.repo_url,
    demo_url: adminProject.demo_url,
    website_url: adminProject.website_url,
    funding_goal: adminProject.goalAmount,
    currency: 'XLM',
    tags: adminProject.tags || [],
    category: adminProject.category?.toLowerCase(),
    difficulty_level: adminProject.difficulty_level,
    milestones: adminProject.milestones || [],
    status: adminProject.status.toLowerCase(),
    is_featured: adminProject.is_featured || false,
    is_public: true,
    funding_raised: adminProject.currentAmount || 0,
    views_count: adminProject.views_count || 0,
    likes_count: adminProject.likes_count || 0,
    shares_count: adminProject.shares_count || 0,
    screenshots: adminProject.screenshots || [],
    videos: adminProject.videos || [],
    documents: adminProject.documents || [],
    created_at: adminProject.createdAt,
    updated_at: adminProject.updatedAt,
    published_at: adminProject.published_at,
    owner: {
      id: adminProject.creator?.id || adminProject.creatorId,
      username: adminProject.creator?.username || '',
      full_name: adminProject.creator?.fullName
    }
  });

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getAllProjects({
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        limit: 50
      });
      setProjects((response.data || []).map(mapAdminProjectToProject));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, filterStatus, filterCategory]);

  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.owner?.username && project.owner.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus.toLowerCase();
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'FUNDED':
        return <Badge variant="default" className="bg-primary text-white"><DollarSign className="h-3 w-3 mr-1" />Funded</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Cancelled</Badge>;
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
      if (action === 'ACTIVE' || action === 'FUNDED' || action === 'COMPLETED' || action === 'CANCELLED') {
        await adminAPI.updateProjectStatus(projectId, action);
      } else if (action === 'delete') {
        await adminAPI.deleteProject(projectId);
      }
      
      // Refresh the projects list
      await fetchProjects();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error(`Failed to ${action} project:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} project`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCounts = () => {
    const projectsList = projects || [];
    return {
      all: projectsList.length,
      ACTIVE: projectsList.filter(p => p.status === 'published').length,
      DRAFT: projectsList.filter(p => p.status === 'draft').length,
      FUNDED: projectsList.filter(p => p.status === 'funded').length,
      COMPLETED: projectsList.filter(p => p.status === 'completed').length,
      CANCELLED: projectsList.filter(p => p.status === 'archived').length,
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
            <Button variant="outline" size="sm" onClick={fetchProjects}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
                  <p className="text-2xl font-bold text-foreground">{statusCounts.ACTIVE}</p>
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
                  <p className="text-2xl font-bold text-foreground">{statusCounts.DRAFT}</p>
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
                  <p className="text-2xl font-bold text-foreground">{statusCounts.FUNDED}</p>
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
                  variant={filterStatus === 'ACTIVE' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('ACTIVE')}
                  className={filterStatus === 'ACTIVE' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Published ({statusCounts.ACTIVE})
                </Button>
                <Button
                  variant={filterStatus === 'DRAFT' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('DRAFT')}
                  className={filterStatus === 'DRAFT' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Pending ({statusCounts.DRAFT})
                </Button>
                <Button
                  variant={filterStatus === 'FUNDED' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('FUNDED')}
                  className={filterStatus === 'FUNDED' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Funded ({statusCounts.FUNDED})
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
                              {project.description.substring(0, 50)}...
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-foreground font-medium">
                            {project.funding_raised?.toLocaleString() || '0'} / {project.funding_goal?.toLocaleString() || '0'} XLM
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {project.funding_goal > 0 ? Math.round(((project.funding_raised || 0) / project.funding_goal) * 100) : 0}% funded
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
