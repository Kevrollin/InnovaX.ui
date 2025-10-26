import { Campaign } from '@/types';

export interface CampaignFilters {
  search?: string;
  status?: string;
}

// Mock campaigns data
const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Tech Innovation Challenge',
    description: 'A competition to find the most innovative tech solutions for social good.',
    short_description: 'Innovation competition for social good',
    status: 'active',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-06-30T23:59:59Z',
    funding_goal: 100000,
    total_funding: 45000,
    currency: 'USD',
    created_by: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    tags: ['technology', 'innovation', 'social-good'],
    image_url: '/placeholder.svg',
    organizer: {
      id: 1,
      name: 'Tech for Good Foundation',
      email: 'contact@techforgood.org',
      website: 'https://techforgood.org'
    }
  },
  {
    id: 2,
    name: 'Environmental Sustainability Drive',
    description: 'Supporting projects that promote environmental sustainability and green technology.',
    short_description: 'Green technology and sustainability',
    status: 'active',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    funding_goal: 200000,
    total_funding: 125000,
    currency: 'USD',
    created_by: 2,
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-25T12:15:00Z',
    tags: ['environment', 'sustainability', 'green-tech'],
    image_url: '/placeholder.svg',
    organizer: {
      id: 2,
      name: 'Green Future Initiative',
      email: 'info@greenfuture.org',
      website: 'https://greenfuture.org'
    }
  },
  {
    id: 3,
    name: 'Student Entrepreneurship Program',
    description: 'Empowering student entrepreneurs with funding and mentorship opportunities.',
    short_description: 'Student startup funding program',
    status: 'completed',
    start_date: '2023-09-01T00:00:00Z',
    end_date: '2023-12-31T23:59:59Z',
    funding_goal: 50000,
    total_funding: 50000,
    currency: 'USD',
    created_by: 3,
    created_at: '2023-08-15T09:00:00Z',
    updated_at: '2023-12-31T18:00:00Z',
    tags: ['education', 'entrepreneurship', 'students'],
    image_url: '/placeholder.svg',
    organizer: {
      id: 3,
      name: 'University Innovation Hub',
      email: 'innovation@university.edu',
      website: 'https://university.edu/innovation'
    }
  }
];

export const campaignsAPI = {
  async getCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredCampaigns = [...mockCampaigns];
    
    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.title.toLowerCase().includes(searchLower) ||
        campaign.description.toLowerCase().includes(searchLower) ||
        campaign.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters?.status) {
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.status === filters.status
      );
    }
    
    return filteredCampaigns;
  },

  async getCampaign(id: string): Promise<Campaign> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const campaign = mockCampaigns.find(c => c.id === parseInt(id));
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    return campaign;
  },
};
