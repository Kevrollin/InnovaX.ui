import { Project } from '@/types';
import { triggerProjectLike, triggerProjectUnlike, triggerProjectShare, triggerProjectView, triggerProjectUpdate, triggerProjectStatusChange } from '@/utils/realtime';
import { apiService } from './api';

export interface ProjectFilters {
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  goalAmount: number;
  category: string;
  imageUrl?: string;
  bannerImage?: string;
  screenshots?: string[];
  // Legacy fields (for backward compatibility, but not sent to backend)
  short_description?: string;
  difficulty_level?: string;
  funding_goal?: number;
  currency?: string;
  repo_url?: string;
  demo_url?: string;
  website_url?: string;
  tags?: string[];
  milestones?: Array<{
    title: string;
    description: string;
    target_date: string;
    funding_required: number;
  }>;
  videos?: string[];
  documents?: string[];
}

// Helper function to safely parse funding amount from database
function parseFundingAmount(value: any): number {
  if (value == null) return 0;
  
  // Handle DECIMAL strings from database (Sequelize returns DECIMAL as strings)
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }
  
  // Handle number types
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : Math.max(0, value);
  }
  
  // Default to 0 for any other type
  return 0;
}

export const projectsAPI = {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.category && filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.sort) queryParams.append('sort', filters.sort);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/projects?${queryString}` : '/api/projects';
      
      const response = await apiService.getProjects({ 
        search: filters?.search, 
        category: filters?.category, 
        status: filters?.status as any 
      });
      
      // Handle API response - it returns an object with data array
      const projectsData = (Array.isArray(response) ? response : response.data || []) as any[];
      
      // Map backend project format to frontend format
      return projectsData.map((project: any) => ({
        id: project.id,
        owner_id: project.creatorId,
        title: project.title,
        description: project.description,
        short_description: project.description.substring(0, 150) + '...',
        repo_url: project.repoUrl,
        demo_url: project.demoUrl,
        website_url: project.websiteUrl,
        funding_goal: project.goalAmount,
        currency: 'USD', // Default currency
        tags: project.tags || [],
        category: project.category,
        difficulty_level: project.difficultyLevel || 'intermediate',
        milestones: project.milestones || [],
        status: project.status.toLowerCase(),
        is_featured: project.isFeatured || false,
        is_public: project.isPublic !== false,
        // Use helper function to safely parse currentAmount from database
        // This handles null, undefined, strings (DECIMAL), and numbers correctly
        funding_raised: parseFundingAmount(project.currentAmount),
        views_count: project.viewsCount || 0,
        likes_count: project.likesCount || 0,
        shares_count: project.sharesCount || 0,
        banner_image: project.bannerImage,
        screenshots: project.screenshots || [],
        videos: project.videos || [],
        documents: project.documents || [],
        created_at: project.createdAt,
        updated_at: project.updatedAt,
        published_at: project.publishedAt || project.createdAt,
        owner: {
          id: project.creator?.id || project.creatorId,
          username: project.creator?.username || 'unknown',
          full_name: project.creator?.fullName || project.creator?.username || 'Unknown User',
          university: project.creator?.university || project.creator?.schoolName,
          twitter_url: project.creator?.studentProfile?.twitterUrl,
          linkedin_url: project.creator?.studentProfile?.linkedinUrl,
          github_url: project.creator?.studentProfile?.githubUrl
        }
      }));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  async getProject(id: string): Promise<Project> {
    try {
      const response = await apiService.getProject(id);
      
      // Handle API response - it returns an object with data
      const projectData = (response.data || response) as any;
      
      // Map backend project format to frontend format
      return {
        id: projectData.id,
        owner_id: projectData.creatorId,
        title: projectData.title,
        description: projectData.description,
        short_description: projectData.description.substring(0, 150) + '...',
        repo_url: projectData.repoUrl,
        demo_url: projectData.demoUrl,
        website_url: projectData.websiteUrl,
        funding_goal: projectData.goalAmount,
        currency: 'USD', // Default currency
        tags: projectData.tags || [],
        category: projectData.category,
        difficulty_level: projectData.difficultyLevel || 'intermediate',
        milestones: projectData.milestones || [],
        status: projectData.status.toLowerCase(),
        is_featured: projectData.isFeatured || false,
        is_public: projectData.isPublic !== false,
        // Use helper function to safely parse currentAmount from database
        // This handles null, undefined, strings (DECIMAL), and numbers correctly
        funding_raised: parseFundingAmount(projectData.currentAmount),
        views_count: projectData.viewsCount || 0,
        likes_count: projectData.likesCount || 0,
        shares_count: projectData.sharesCount || 0,
        banner_image: projectData.bannerImage,
        screenshots: projectData.screenshots || [],
        videos: projectData.videos || [],
        documents: projectData.documents || [],
        created_at: projectData.createdAt,
        updated_at: projectData.updatedAt,
        published_at: projectData.publishedAt || projectData.createdAt,
        owner: {
          id: projectData.creator?.id || projectData.creatorId,
          username: projectData.creator?.username || 'unknown',
          full_name: projectData.creator?.fullName || projectData.creator?.username || 'Unknown User',
          university: projectData.creator?.university || projectData.creator?.schoolName,
          twitter_url: projectData.creator?.studentProfile?.twitterUrl,
          linkedin_url: projectData.creator?.studentProfile?.linkedinUrl,
          github_url: projectData.creator?.studentProfile?.githubUrl
        }
      };
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw new Error('Project not found');
    }
  },

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    try {
      // Map frontend data to backend API format
      const backendData = {
        title: projectData.title,
        description: projectData.description,
        goalAmount: projectData.goalAmount || projectData.funding_goal || 0,
        category: projectData.category,
        imageUrl: projectData.imageUrl || undefined,
        bannerImage: projectData.bannerImage || undefined,
        screenshots: projectData.screenshots || undefined,
        repoUrl: projectData.repo_url || undefined,
        demoUrl: projectData.demo_url || undefined
      };

      const response = await apiService.createProject(backendData);
      const projectData_response = response.data as any;
      
      // Map backend response to frontend Project format
      const project: Project = {
        id: projectData_response.id,
        owner_id: projectData_response.creatorId || projectData_response.creator_id,
        title: projectData_response.title,
        description: projectData_response.description,
        short_description: projectData_response.description?.substring(0, 150) + '...',
        funding_goal: parseFundingAmount(projectData_response.goalAmount),
        currency: 'USD',
        tags: [],
        category: projectData_response.category,
        difficulty_level: 'intermediate',
        milestones: [],
        status: projectData_response.status?.toLowerCase() || 'active',
        is_featured: false,
        is_public: true,
        funding_raised: parseFundingAmount(projectData_response.currentAmount || 0),
        views_count: projectData_response.viewsCount || 0,
        likes_count: projectData_response.likesCount || 0,
        shares_count: projectData_response.sharesCount || 0,
        banner_image: projectData_response.imageUrl || projectData_response.bannerImage,
        screenshots: projectData_response.screenshots || [],
        videos: [],
        documents: [],
        created_at: projectData_response.createdAt || new Date().toISOString(),
        updated_at: projectData_response.updatedAt,
        published_at: projectData_response.createdAt || new Date().toISOString(),
        owner: {
          id: projectData_response.creator?.id || projectData_response.creatorId,
          username: projectData_response.creator?.username || 'unknown',
          full_name: projectData_response.creator?.fullName || projectData_response.creator?.username || 'Unknown User',
          university: projectData_response.creator?.university || projectData_response.creator?.schoolName
        }
      };

      // Trigger project update event for real-time dashboard updates
      triggerProjectUpdate(String(project.id));
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  },

  async updateProject(id: string, projectData: Partial<CreateProjectRequest & { status?: string }>): Promise<Project> {
    try {
      const response = await apiService.updateProject(id, projectData);
      const project = response.data as Project;
      // Trigger project update event for real-time dashboard updates
      triggerProjectUpdate(id);
      // If status changed, trigger status change event
      if (projectData.status !== undefined) {
        triggerProjectStatusChange(id, projectData.status);
      }
      return project;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await apiService.deleteProject(id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  async likeProject(projectId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const response = await apiService.likeProject(projectId) as any;
      if (response.data.liked) {
        triggerProjectLike(projectId);
      } else {
        triggerProjectUnlike(projectId);
      }
      return {
        liked: response.data.liked,
        likesCount: response.data.likesCount
      };
    } catch (error) {
      console.error('Failed to like project:', error);
      throw error;
    }
  },


  async getLikeStatus(projectId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const response = await apiService.getProjectLikeStatus(projectId) as any;
      return {
        liked: response.data.liked,
        likesCount: response.data.likesCount
      };
    } catch (error) {
      console.error('Failed to get like status:', error);
      throw error;
    }
  },

  async trackShare(projectId: string): Promise<{ sharesCount: number }> {
    try {
      const response = await apiService.trackProjectShare(projectId) as any;
      triggerProjectShare(projectId);
      return {
        sharesCount: response.data.sharesCount
      };
    } catch (error) {
      console.error('Failed to track share:', error);
      throw error;
    }
  },

  async trackView(projectId: string): Promise<{ viewsCount: number }> {
    try {
      const response = await apiService.trackProjectView(projectId) as any;
      triggerProjectView(projectId);
      return {
        viewsCount: response.data.viewsCount
      };
    } catch (error) {
      console.error('Failed to track view:', error);
      throw error;
    }
  },

  async getProjectAnalytics(projectId: string) {
    try {
      return await apiService.getProjectAnalytics(projectId);
    } catch (error) {
      console.error('Failed to fetch project analytics:', error);
      throw error;
    }
  },
};
