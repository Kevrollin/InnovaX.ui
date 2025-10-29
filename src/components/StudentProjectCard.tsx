import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Share2, 
  DollarSign, 
  Eye, 
  BarChart3,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Project } from '@/types';
import { motion } from 'framer-motion';

interface StudentProjectCardProps {
  project: Project;
  onAnalyticsClick?: () => void;
}

export const StudentProjectCard = ({ project, onAnalyticsClick }: StudentProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'fundable':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'draft':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Active';
      case 'fundable':
        return 'Funding';
      case 'completed':
        return 'Completed';
      case 'draft':
        return 'Draft';
      case 'pending_review':
        return 'Pending Review';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Funding progress uses real data from database:
  // - funding_goal: comes from backend goalAmount field
  // - funding_raised: comes from backend currentAmount field (updated when donations are made)
  // - currentAmount is updated in the database when a donation is created
  // - If funding_raised is 0 or null/undefined, it means no donations received yet
  // - This ensures funding progress always shows accurate, real-time data
  const fundingGoal = project.funding_goal != null 
    ? parseFloat(String(project.funding_goal)) 
    : 0;
  const fundingRaised = project.funding_raised != null 
    ? parseFloat(String(project.funding_raised)) 
    : 0; // If null/undefined or 0, show 0 (no funding received)
  // Calculate progress: if goal is 0 or raised is 0, show 0%, otherwise calculate percentage
  const fundingProgress = fundingGoal > 0
    ? Math.min((fundingRaised / fundingGoal) * 100, 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.short_description || project.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Project Image/Banner */}
          {project.banner_image && (
            <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={project.banner_image} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Funding Progress</span>
              <span className="font-semibold">
                ${fundingRaised.toLocaleString()} / ${fundingGoal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{fundingProgress.toFixed(1)}% funded</span>
              <span>{project.category || 'N/A'}</span>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="flex items-center space-x-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{project.views_count || 0}</span>
              <span className="text-muted-foreground">views</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="font-medium">{project.likes_count || 0}</span>
              <span className="text-muted-foreground">likes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Share2 className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{project.shares_count || 0}</span>
              <span className="text-muted-foreground">shares</span>
            </div>
          </div>

          {/* Timestamps */}
          {project.created_at && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              {project.updated_at && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-2 pt-4">
          <Link to={`/projects/${project.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          <Link to={`/student/projects/${project.id}/edit`} className="flex-1">
            <Button className="w-full" size="sm">
              Edit
            </Button>
          </Link>
          {onAnalyticsClick && (
            <Button 
              variant="default" 
              className="flex-1" 
              size="sm"
              onClick={onAnalyticsClick}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

