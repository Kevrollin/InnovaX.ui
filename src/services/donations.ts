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
      const donationsData = (response.data || []) as any[];
      
      // Map backend donation format to frontend format
      return donationsData.map((donation: any) => ({
        id: donation.id,
        donor_id: donation.donorId,
        project_id: donation.projectId,
        amount: parseFloat(donation.amount),
        currency: 'USD', // Default currency
        payment_method: donation.paymentMethod || 'stripe_card',
        message: donation.message,
        is_anonymous: donation.anonymous || false,
        status: donation.status?.toLowerCase(),
        tx_hash: donation.transactionId,
        stellar_transaction_id: donation.transactionId,
        confirmed_at: donation.status === 'COMPLETED' ? donation.updatedAt : undefined,
        created_at: donation.createdAt,
        updated_at: donation.updatedAt,
        donor: donation.donor ? {
          id: donation.donor.id,
          username: donation.donor.username,
          full_name: donation.donor.fullName
        } : undefined,
        project: donation.project ? {
          id: donation.project.id,
          title: donation.project.title
        } : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      throw error;
    }
  },

  async createDonation(donationData: CreateDonationRequest): Promise<Donation> {
    try {
      const response = await apiService.createDonation(donationData);
      const donation = (response.data || response) as any;
      
      // Trigger real-time update with project ID so dashboard can update specific project
      triggerDonationUpdate();
      
      // Also trigger project funding update event with the updated project data
      // The backend returns the project with updated currentAmount in the donation response
      // This ensures funding progress bars update immediately with real database values
      if (donation.project?.id || donation.projectId) {
        const projectId = donation.project?.id || donation.projectId;
        // Use currentAmount from the project object which reflects the updated database value
        const updatedAmount = donation.project?.currentAmount;
        
        if (updatedAmount !== undefined) {
          console.log(`Project ${projectId} funding updated to $${updatedAmount} (from database)`);
          window.dispatchEvent(new CustomEvent('project-funding-updated', { 
            detail: { 
              projectId: projectId,
              newAmount: parseFloat(String(updatedAmount)), // Real database value
              donationAmount: parseFloat(String(donation.amount))
            } 
          }));
        }
      }
      
      // Map backend donation format to frontend format
      return {
        id: donation.id,
        donor_id: donation.donorId,
        project_id: donation.projectId,
        amount: parseFloat(donation.amount),
        currency: 'USD', // Default currency
        payment_method: donation.paymentMethod || 'stripe_card',
        message: donation.message,
        is_anonymous: donation.anonymous || false,
        status: donation.status?.toLowerCase(),
        tx_hash: donation.transactionId,
        stellar_transaction_id: donation.transactionId,
        confirmed_at: donation.status === 'COMPLETED' ? donation.updatedAt : undefined,
        created_at: donation.createdAt,
        updated_at: donation.updatedAt,
        donor: donation.donor ? {
          id: donation.donor.id,
          username: donation.donor.username,
          full_name: donation.donor.fullName
        } : undefined,
        project: donation.project ? {
          id: donation.project.id,
          title: donation.project.title
        } : undefined
      };
    } catch (error) {
      console.error('Failed to create donation:', error);
      throw error;
    }
  },

  async getDonationById(id: string): Promise<Donation> {
    try {
      const response = await apiService.getDonation(id);
      const donation = (response.data || response) as any;
      
      // Map backend donation format to frontend format
      return {
        id: donation.id,
        donor_id: donation.donorId,
        project_id: donation.projectId,
        amount: parseFloat(donation.amount),
        currency: 'USD', // Default currency
        payment_method: donation.paymentMethod || 'stripe_card',
        message: donation.message,
        is_anonymous: donation.anonymous || false,
        status: donation.status?.toLowerCase(),
        tx_hash: donation.transactionId,
        stellar_transaction_id: donation.transactionId,
        confirmed_at: donation.status === 'COMPLETED' ? donation.updatedAt : undefined,
        created_at: donation.createdAt,
        updated_at: donation.updatedAt,
        donor: donation.donor ? {
          id: donation.donor.id,
          username: donation.donor.username,
          full_name: donation.donor.fullName
        } : undefined,
        project: donation.project ? {
          id: donation.project.id,
          title: donation.project.title
        } : undefined
      };
    } catch (error) {
      console.error('Failed to fetch donation:', error);
      throw error;
    }
  },
};
