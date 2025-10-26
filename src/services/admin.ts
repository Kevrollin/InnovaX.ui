export interface PendingVerification {
  id: number;
  name: string;
  email: string;
  school: string;
  date: string;
}

export interface Analytics {
  total_users: number;
  active_projects: number;
  total_funded: number;
  pending_verifications: number;
}

// Mock data
const mockPendingVerifications: PendingVerification[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    school: 'University of Technology',
    date: '2024-01-20T10:00:00Z'
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria.garcia@college.edu',
    school: 'State College',
    date: '2024-01-22T14:30:00Z'
  },
  {
    id: 3,
    name: 'David Kim',
    email: 'david.kim@institute.edu',
    school: 'Tech Institute',
    date: '2024-01-25T09:15:00Z'
  }
];

const mockAnalytics: Analytics = {
  total_users: 1250,
  active_projects: 45,
  total_funded: 250000,
  pending_verifications: 3
};

export const adminAPI = {
  async getPendingVerifications(): Promise<PendingVerification[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return mockPendingVerifications;
  },

  async approveVerification(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const verificationIndex = mockPendingVerifications.findIndex(v => v.id === parseInt(id));
    if (verificationIndex !== -1) {
      mockPendingVerifications.splice(verificationIndex, 1);
    }
  },

  async rejectVerification(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const verificationIndex = mockPendingVerifications.findIndex(v => v.id === parseInt(id));
    if (verificationIndex !== -1) {
      mockPendingVerifications.splice(verificationIndex, 1);
    }
  },

  async getAnalytics(): Promise<Analytics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return mockAnalytics;
  },
};
