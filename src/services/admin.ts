import { apiService } from './api';

export interface PendingVerification {
  id: number;
  name: string;
  email: string;
  school: string;
  date: string;
  userId: number;
  schoolEmail: string;
  schoolName: string;
  admissionNumber: string;
  verificationStatus: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    createdAt: string;
  };
}

export interface StudentVerification {
  id: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  schoolEmail: string;
  schoolName: string;
  admissionNumber: string;
  idNumber?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationReason?: string;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  estimatedGraduationYear?: number;
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    createdAt: string;
  };
}

export interface Project {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  status: 'DRAFT' | 'ACTIVE' | 'FUNDED' | 'COMPLETED' | 'CANCELLED';
  category: 'EDUCATION' | 'TECHNOLOGY' | 'HEALTH' | 'ENVIRONMENT' | 'SOCIAL' | 'ARTS' | 'OTHER';
  creatorId: number;
  imageUrl?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  short_description?: string;
  difficulty_level?: string;
  is_featured?: boolean;
  creator?: {
    id: number;
    username: string;
    fullName?: string;
    email: string;
  };
}

export interface ProjectsResponse {
  data: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalUsers: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  activeProjects: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  totalFunded: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  pendingVerifications: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  recentActivity: {
    newUsersThisWeek: number;
    projectsFundedToday: number;
    totalDonations: number;
    completedDonations: number;
  };
}

export interface Analytics {
  users: {
    total: number;
    students: number;
    donors: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  donations: {
    total: number;
    totalAmount: number;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  studentProfile?: {
    id: number;
    schoolName: string;
    verificationStatus: string;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminAPI = {
  async getPendingVerifications(): Promise<PendingVerification[]> {
    try {
      const response = await apiService.getPendingVerifications();
      return response.data.map((student: any) => ({
        id: student.id,
        name: student.user?.fullName || student.user?.username || 'Unknown',
        email: student.user?.email || '',
        school: student.schoolName,
        date: student.createdAt,
        userId: student.userId,
        schoolEmail: student.schoolEmail,
        schoolName: student.schoolName,
        admissionNumber: student.admissionNumber,
        verificationStatus: student.verificationStatus,
        createdAt: student.createdAt,
        user: student.user
      }));
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
      throw error;
    }
  },

  async getAllStudentVerifications(): Promise<StudentVerification[]> {
    try {
      const response = await apiService.getAllStudentVerifications();
      return response.data.map((student: any) => ({
        id: student.id,
        userId: student.userId,
        username: student.user?.username || '',
        email: student.user?.email || '',
        fullName: student.user?.fullName || student.user?.username || 'Unknown',
        phone: student.user?.phone,
        schoolEmail: student.schoolEmail,
        schoolName: student.schoolName,
        admissionNumber: student.admissionNumber,
        idNumber: student.idNumber,
        verificationStatus: student.verificationStatus,
        verificationReason: student.verificationReason,
        verifiedBy: student.verifiedBy,
        verifiedAt: student.verifiedAt,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        estimatedGraduationYear: student.estimatedGraduationYear,
        user: student.user
      }));
    } catch (error) {
      console.error('Failed to fetch student verifications:', error);
      throw error;
    }
  },

  async approveVerification(userId: number, reason?: string): Promise<void> {
    try {
      await apiService.approveVerification(userId.toString());
    } catch (error) {
      console.error('Failed to approve verification:', error);
      throw error;
    }
  },

  async rejectVerification(userId: number, reason?: string): Promise<void> {
    try {
      await apiService.rejectVerification(userId.toString());
    } catch (error) {
      console.error('Failed to reject verification:', error);
      throw error;
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.getDashboardStats();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  async getAnalytics(): Promise<Analytics> {
    try {
      const response = await apiService.getAnalytics();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  },

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<UsersResponse> {
    try {
      const response = await apiService.getUsers(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  async updateUserStatus(userId: number, status: string): Promise<void> {
    try {
      await apiService.updateUserStatus(userId, status);
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  },

  async deleteUser(userId: number): Promise<void> {
    try {
      await apiService.deleteUser(userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  async getUserById(userId: number): Promise<User> {
    try {
      const response = await apiService.getUserById(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      throw error;
    }
  },

  async updateUser(userId: number, userData: {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
  }): Promise<User> {
    try {
      const response = await apiService.updateUser(userId, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  // Project management methods
  async getAllProjects(params?: {
    search?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ProjectsResponse> {
    try {
      const response = await apiService.getAllProjects(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  },

  async updateProjectStatus(projectId: number, status: string): Promise<void> {
    try {
      await apiService.updateProjectStatus(projectId.toString(), status);
    } catch (error) {
      console.error('Failed to update project status:', error);
      throw error;
    }
  },

  async deleteProject(projectId: number): Promise<void> {
    try {
      await apiService.deleteAdminProject(projectId.toString());
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  // Campaign management methods
  async getCampaignParticipants(campaignId: number): Promise<{
    campaign: any;
    participants: any[];
    totalParticipants: number;
    participantsByStatus: {
      pending: number;
      approved: number;
      rejected: number;
    };
  }> {
    try {
      const response = await apiService.request(`/api/admin/campaigns/${campaignId}/participants`, {
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch campaign participants:', error);
      throw error;
    }
  },

  async reviewParticipation(participationId: number, status: 'approved' | 'rejected', reviewNotes?: string): Promise<void> {
    try {
      await apiService.request(`/api/campaigns/participations/${participationId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status, reviewNotes }),
      });
    } catch (error) {
      console.error('Failed to review participation:', error);
      throw error;
    }
  }
};
