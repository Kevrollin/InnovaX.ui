import { Donation } from '@/types';
import { triggerDonationUpdate } from '@/utils/realtime';
import { apiService } from './api';

export interface DonationFilters {
  donor_id?: string;
  project_id?: string;
  status?: string;
}

export interface CreateDonationRequest {
  project_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  message?: string;
  is_anonymous?: boolean;
}

export const donationsAPI = {
  async getDonations(filters?: DonationFilters): Promise<Donation[]> {
    try {
      const response = await apiService.getDonations(filters);
      return response.data as Donation[];
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      throw error;
    }
  },

  async createDonation(donationData: CreateDonationRequest): Promise<Donation> {
    try {
      const response = await apiService.createDonation(donationData);
      
      // Trigger real-time update
      triggerDonationUpdate();
      
      return response.data as Donation;
    } catch (error) {
      console.error('Failed to create donation:', error);
      throw error;
    }
  },

  async getDonationById(id: string): Promise<Donation> {
    try {
      const response = await apiService.getDonation(id);
      return response.data as Donation;
    } catch (error) {
      console.error('Failed to fetch donation:', error);
      throw error;
    }
  },
};
