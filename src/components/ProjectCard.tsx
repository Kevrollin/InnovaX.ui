import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, ExternalLink, User, CheckCircle2, HelpCircle } from 'lucide-react';
import { Project } from '@/types';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const fundingPercentage = (project.funding_raised / project.funding_goal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden border-border bg-card hover:shadow-elegant transition-all duration-300">
        {/* Project Image/Thumbnail */}
        <div className="relative h-48 w-full overflow-hidden bg-secondary">
          {project.screenshots && project.screenshots[0] ? (
            <img
              src={project.screenshots[0]}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
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

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Funded</span>
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
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Heart className="mr-2 h-4 w-4" />
            {project.likes_count || 0}
          </Button>
          <Link to={`/projects/${project.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              View Project
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
