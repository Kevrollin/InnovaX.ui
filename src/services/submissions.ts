import { apiService } from './api';
import { CampaignSubmission, CampaignParticipation } from '@/types';

export interface SubmitProjectData {
  projectTitle: string;
  projectDescription: string;
  projectScreenshots: string[];
  projectLinks: {
    demoUrl?: string;
    githubUrl?: string;
    filesUrl?: string;
  };
  pitchDeckUrl?: string;
}

export interface GradeSubmissionData {
  score: number;
  grade: string;
  feedback?: string;
  status?: 'graded' | 'winner' | 'runner_up' | 'not_selected';
  position?: number;
  prizeAmount?: number;
}

export interface ParticipationStatusResponse {
  success: boolean;
  data: {
    campaign: {
      id: number;
      title: string;
      status: string;
      submissionStartDate?: string;
      submissionEndDate?: string;
      resultsAnnouncementDate?: string;
      awardDistributionDate?: string;
    };
    participation: {
      id: number;
      status: string;
      submissionStatus: string;
      submittedAt: string;
      reviewedAt?: string;
      reviewNotes?: string;
      submission?: CampaignSubmission;
    } | null;
  };
}

export const submissionsAPI = {
  // Submit project for a campaign
  async submitProject(campaignId: number, data: SubmitProjectData): Promise<CampaignSubmission> {
    const response = await apiService.post(`/submissions/campaigns/${campaignId}/submit`, data);
    return response.data;
  },

  // Get campaign submissions (admin/campaign creator only)
  async getCampaignSubmissions(campaignId: number): Promise<CampaignSubmission[]> {
    const response = await apiService.request(`/api/submissions/campaigns/${campaignId}/submissions`, {
      method: 'GET',
    });
    return response.data;
  },

  // Get submission details
  async getSubmission(submissionId: number): Promise<CampaignSubmission> {
    const response = await apiService.request(`/api/submissions/submissions/${submissionId}`, {
      method: 'GET',
    });
    return response.data;
  },

  // Grade a submission (admin/campaign creator only)
  async gradeSubmission(submissionId: number, data: GradeSubmissionData): Promise<CampaignSubmission> {
    const response = await apiService.put(`/submissions/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  // Get user's submissions
  async getUserSubmissions(userId: number): Promise<CampaignSubmission[]> {
    const response = await apiService.request(`/api/submissions/submissions/user/${userId}`, {
      method: 'GET',
    });
    return response.data;
  },

  // Get participation status for a campaign
  async getParticipationStatus(campaignId: number): Promise<ParticipationStatusResponse> {
    const response = await apiService.request(`/api/campaigns/${campaignId}/participation-status`, {
      method: 'GET',
    });
    return response.data;
  }
};

export default submissionsAPI;
