import { Donation } from '@/types';
import { triggerDonationUpdate } from '@/utils/realtime';

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

// Mock donations data
const mockDonations: Donation[] = [
  {
    id: 1,
    donor_id: 1,
    project_id: 1,
    amount: 100,
    currency: 'USD',
    status: 'completed',
    payment_method: 'credit_card',
    message: 'Great project! Keep up the good work.',
    is_anonymous: false,
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T10:30:00Z',
    donor: {
      id: 1,
      username: 'john_doe',
      full_name: 'John Doe',
      email: 'john@example.com'
    },
    project: {
      id: 1,
      title: 'Eco-Friendly Water Bottle',
      description: 'A sustainable water bottle made from recycled materials'
    }
  },
  {
    id: 2,
    donor_id: 2,
    project_id: 1,
    amount: 250,
    currency: 'USD',
    status: 'completed',
    payment_method: 'paypal',
    message: 'Love the sustainability focus!',
    is_anonymous: false,
    created_at: '2024-01-22T14:15:00Z',
    updated_at: '2024-01-22T14:15:00Z',
    donor: {
      id: 2,
      username: 'jane_smith',
      full_name: 'Jane Smith',
      email: 'jane@example.com'
    },
    project: {
      id: 1,
      title: 'Eco-Friendly Water Bottle',
      description: 'A sustainable water bottle made from recycled materials'
    }
  },
  {
    id: 3,
    donor_id: 3,
    project_id: 2,
    amount: 500,
    currency: 'USD',
    status: 'completed',
    payment_method: 'bank_transfer',
    message: 'This AI study assistant will help so many students!',
    is_anonymous: true,
    created_at: '2024-01-25T09:45:00Z',
    updated_at: '2024-01-25T09:45:00Z',
    donor: {
      id: 3,
      username: 'anonymous',
      full_name: 'Anonymous Donor',
      email: 'anonymous@example.com'
    },
    project: {
      id: 2,
      title: 'AI-Powered Study Assistant',
      description: 'An intelligent study companion that helps students organize their learning'
    }
  },
  {
    id: 4,
    donor_id: 1,
    project_id: 3,
    amount: 75,
    currency: 'USD',
    status: 'pending',
    payment_method: 'credit_card',
    message: 'Community gardens are so important for urban areas.',
    is_anonymous: false,
    created_at: '2024-01-28T16:20:00Z',
    updated_at: '2024-01-28T16:20:00Z',
    donor: {
      id: 1,
      username: 'john_doe',
      full_name: 'John Doe',
      email: 'john@example.com'
    },
    project: {
      id: 3,
      title: 'Community Garden Initiative',
      description: 'Transform urban spaces into productive community gardens'
    }
  }
];

export const donationsAPI = {
  async getDonations(filters?: DonationFilters): Promise<Donation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredDonations = [...mockDonations];
    
    // Apply filters
    if (filters?.donor_id) {
      filteredDonations = filteredDonations.filter(donation => 
        donation.donor_id === parseInt(filters.donor_id!)
      );
    }
    
    if (filters?.project_id) {
      filteredDonations = filteredDonations.filter(donation => 
        donation.project_id === parseInt(filters.project_id!)
      );
    }
    
    if (filters?.status) {
      filteredDonations = filteredDonations.filter(donation => 
        donation.status === filters.status
      );
    }
    
    return filteredDonations;
  },

  async createDonation(donationData: CreateDonationRequest): Promise<Donation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDonation: Donation = {
      id: mockDonations.length + 1,
      donor_id: 1, // Mock current user ID
      project_id: donationData.project_id,
      amount: donationData.amount,
      currency: donationData.currency,
      status: 'completed', // Mock successful payment
      payment_method: donationData.payment_method,
      message: donationData.message,
      is_anonymous: donationData.is_anonymous || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      donor: {
        id: 1,
        username: 'current_user',
        full_name: 'Current User',
        email: 'user@example.com'
      },
      project: {
        id: donationData.project_id,
        title: 'Mock Project',
        description: 'Mock project description'
      }
    };
    
    mockDonations.push(newDonation);
    
    // Trigger real-time update
    triggerDonationUpdate();
    
    return newDonation;
  },
};
