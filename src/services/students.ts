import { apiService } from './api';
import { Project } from '../types';

export interface StudentProfile {
  id: number;
  userId: number;
  schoolEmail: string;
  schoolName: string;
  admissionNumber: string;
  idNumber?: string;
  estimatedGraduationYear?: number;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationReason?: string;
  verifiedAt?: string;
  verifiedBy?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    role: string;
    status: string;
    createdAt: string;
  };
}

export interface StudentStats {
  totalRaised: number;
  activeProjects: number;
  totalViews: number;
  totalDonations: number;
  completedProjects: number;
}

// Use the Project type directly from types
export type StudentProject = Project;

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

export const studentsAPI = {
  /**
   * Get student profile
   */
  async getStudentProfile(): Promise<StudentProfile> {
    try {
      const response = await apiService.getStudentProfile();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student profile:', error);
      throw error;
    }
  },

  /**
   * Update student profile
   */
  async updateStudentProfile(profileData: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const response = await apiService.updateStudentProfile(profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update student profile:', error);
      throw error;
    }
  },

  /**
   * Get student's projects with all data
   */
  async getMyProjects(status?: string): Promise<StudentProject[]> {
    try {
      const response = await apiService.getMyProjects(status);
      const projectsData = (response.data || []) as any[];
      
      // Map backend project format to frontend format with all fields
      return projectsData.map((project: any) => ({
        id: project.id,
        owner_id: project.creatorId,
        title: project.title,
        description: project.description,
        short_description: project.description?.substring(0, 150) + '...',
        repo_url: project.repoUrl,
        demo_url: project.demoUrl,
        website_url: project.websiteUrl,
        funding_goal: project.goalAmount,
        currency: 'USD',
        tags: project.tags || [],
        category: project.category,
        difficulty_level: project.difficultyLevel || 'intermediate',
        milestones: project.milestones || [],
        status: project.status?.toLowerCase(),
        is_featured: project.isFeatured || false,
        is_public: project.isPublic !== false,
        // Use helper function to safely parse currentAmount from database
        // This handles null, undefined, strings (DECIMAL), and numbers correctly
        funding_raised: parseFundingAmount(project.currentAmount),
        views_count: parseInt(String(project.viewsCount || 0)),
        likes_count: parseInt(String(project.likesCount || 0)),
        shares_count: parseInt(String(project.sharesCount || 0)),
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
          university: project.creator?.university || project.creator?.schoolName
        }
      }));
    } catch (error) {
      console.error('Failed to fetch student projects:', error);
      throw error;
    }
  },

  /**
   * Get student dashboard statistics
   * Uses real API data - no mock data
   * Accepts projects as parameter to avoid duplicate API calls
   */
  async getStudentStats(projects?: StudentProject[]): Promise<StudentStats> {
    try {
      let projectList = projects;
      
      // Only fetch projects if not provided
      if (!projectList) {
        const projectsResponse = await apiService.getMyProjects();
        projectList = projectsResponse.data || [];
      }

      if (!projectList || projectList.length === 0) {
        return {
          totalRaised: 0,
          activeProjects: 0,
          totalViews: 0,
          totalDonations: 0,
          completedProjects: 0
        };
      }

      // Calculate stats from real project data
      const activeProjects = projectList.filter((p: any) => 
        p.status === 'published' || p.status === 'fundable' || p.status === 'active'
      ).length;
      const completedProjects = projectList.filter((p: any) => 
        p.status === 'completed'
      ).length;
      
      // Use real views count from projects
      const totalViews = projectList.reduce((sum: number, p: any) => 
        sum + (parseInt(String(p.views_count || p.viewsCount || 0))), 0
      );
      
      // Use real funding_raised from projects (which comes from backend currentAmount)
      const totalRaised = projectList.reduce((sum: number, p: any) => 
        sum + parseFundingAmount(p.funding_raised || p.currentAmount), 0
      );

      // Calculate total donations from actual donations API
      // Filter by student's project IDs and only count completed donations
      let totalDonations = 0;
      try {
        const projectIds = projectList.map((p: any) => p.id);
        const donationsResponse = await apiService.getDonations();
        const allDonations = donationsResponse.data || [];
        
        // Filter donations for student's projects that are completed
        const studentDonations = allDonations.filter((d: any) => 
          projectIds.includes(d.projectId || d.project_id) && 
          (d.status === 'COMPLETED' || d.status === 'completed' || d.status === 'confirmed')
        );
        
        totalDonations = studentDonations.length;
      } catch (error: any) {
        // If we can't fetch donations, calculate from project funding
        // This is a fallback - ideally we should have donation data
        console.warn('Could not fetch donation count from API, using project data:', error.message);
        // We'll use 0 to be safe - donations should come from API
        totalDonations = 0;
      }

      return {
        totalRaised: Math.round(totalRaised * 100) / 100, // Round to 2 decimal places
        activeProjects,
        totalViews,
        totalDonations,
        completedProjects
      };
    } catch (error: any) {
      console.error('Failed to fetch student stats:', error);
      // Return default stats if there's an error
      return {
        totalRaised: 0,
        activeProjects: 0,
        totalViews: 0,
        totalDonations: 0,
        completedProjects: 0
      };
    }
  },

  /**
   * Get student's donations received
   * Optimized to fetch all donations in one call instead of per-project
   */
  async getDonationsReceived(): Promise<any[]> {
    try {
      // Get student's projects first
      const projectsResponse = await apiService.getMyProjects();
      const projects = projectsResponse.data || [];
      
      if (projects.length === 0) {
        return [];
      }

      const projectIds = projects.map((p: any) => p.id);

      // Get all donations in a single call
      try {
        const donationsResponse = await apiService.getDonations();
        const allDonations = donationsResponse.data || [];
        
        // Filter donations for student's projects
        const studentDonations = allDonations.filter((d: any) => 
          projectIds.includes(d.projectId)
        );

        return studentDonations.sort((a, b) => 
          new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
        );
      } catch (error: any) {
        // If rate limited or error, return empty array
        if (error.status === 429) {
          console.warn('Rate limited while fetching donations');
        } else {
          console.warn('Failed to fetch donations:', error);
        }
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch donations received:', error);
      return [];
    }
  }
};
