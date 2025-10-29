import { apiService } from './api';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  tags: string[];
  campaignType: 'custom' | 'mini';
  createdBy: number;
  startDate: string;
  endDate: string;
  heroImageUrl: string;
  fundingTrail: boolean;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  likesCount: number;
  
  // Submission-related fields
  submissionStartDate?: string;
  submissionEndDate?: string;
  resultsAnnouncementDate?: string;
  awardDistributionDate?: string;
  
  // Custom Campaign Fields
  rewardPool?: number;
  prizeFirstPosition?: {
    prize: string;
    gifts: string;
  };
  prizeSecondPosition?: {
    prize: string;
    gifts: string;
  };
  prizeThirdPosition?: {
    prize: string;
    gifts: string;
  };
  
  // Mini Campaign Fields
  prizePool?: number;
  prizesBreakdown?: {
    first: string;
    second: string;
    third: string;
  };
  
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    username: string;
    fullName?: string;
    email: string;
  };
}

export interface CreateCampaignRequest {
  title: string;
  description: string;
  tags: string[];
  campaignType: 'custom' | 'mini';
  startDate: string;
  endDate: string;
  heroImageUrl: string;
  fundingTrail?: boolean;
  
  // Submission-related fields
  submissionStartDate?: string;
  submissionEndDate?: string;
  resultsAnnouncementDate?: string;
  awardDistributionDate?: string;
  
  // Custom Campaign Fields
  rewardPool?: number;
  prizeFirstPosition?: {
    prize: string;
    gifts: string;
  };
  prizeSecondPosition?: {
    prize: string;
    gifts: string;
  };
  prizeThirdPosition?: {
    prize: string;
    gifts: string;
  };
  
  // Mini Campaign Fields
  prizePool?: number;
  prizesBreakdown?: {
    first: string;
    second: string;
    third: string;
  };
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  tags?: string[];
  campaignType?: 'custom' | 'mini';
  startDate?: string;
  endDate?: string;
  heroImageUrl?: string;
  fundingTrail?: boolean;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  
  // Submission-related fields
  submissionStartDate?: string;
  submissionEndDate?: string;
  resultsAnnouncementDate?: string;
  awardDistributionDate?: string;
  
  // Custom Campaign Fields
  rewardPool?: number;
  prizeFirstPosition?: {
    prize: string;
    gifts: string;
  };
  prizeSecondPosition?: {
    prize: string;
    gifts: string;
  };
  prizeThirdPosition?: {
    prize: string;
    gifts: string;
  };
  
  // Mini Campaign Fields
  prizePool?: number;
  prizesBreakdown?: {
    first: string;
    second: string;
    third: string;
  };
}

export const campaignsAPI = {
  async getCampaigns(params?: {
    search?: string;
    status?: string;
    includeExpired?: boolean;
  }): Promise<Campaign[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.includeExpired) queryParams.append('includeExpired', 'true');

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/campaigns?${queryString}` : '/api/campaigns';
      
      const response = await apiService.request(endpoint);
      return response.data as Campaign[];
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      throw error;
    }
  },

  async getCampaign(id: string): Promise<Campaign> {
    try {
      const response = await apiService.request(`/api/campaigns/${id}`);
      return response.data as Campaign;
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      throw error;
    }
  },

  async createCampaign(campaignData: CreateCampaignRequest): Promise<Campaign> {
    try {
      const response = await apiService.request('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      });
      return response.data as Campaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  },

  async updateCampaign(id: string, campaignData: UpdateCampaignRequest): Promise<Campaign> {
    try {
      const response = await apiService.request(`/api/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(campaignData),
      });
      return response.data as Campaign;
    } catch (error) {
      console.error('Failed to update campaign:', error);
      throw error;
    }
  },

  async deleteCampaign(id: string): Promise<void> {
    try {
      await apiService.request(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      throw error;
    }
  },

  async participateInCampaign(data: {
    campaignId: number;
    motivation: string;
    experience: string;
    portfolio?: string;
    additionalInfo?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.request('/api/campaigns/participate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Failed to participate in campaign:', error);
      throw error;
    }
  },

  // Like functionality
  async toggleLike(campaignId: number): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const response = await apiService.request(`/api/campaigns/${campaignId}/like`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to toggle like:', error);
      throw error;
    }
  },

  async getLikeStatus(campaignId: number): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const response = await apiService.request(`/api/campaigns/${campaignId}/like-status`, {
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get like status:', error);
      throw error;
    }
  },
};