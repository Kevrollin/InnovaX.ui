// User Types
export type UserRole = 'GUEST' | 'BASE_USER' | 'STUDENT' | 'ADMIN' | 'INSTITUTION' | 'SPONSOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  profilePicture?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  studentProfile?: StudentProfile;
}

export interface StudentProfile {
  id: number;
  userId: number;
  schoolEmail: string;
  schoolName: string;
  admissionNumber: string;
  idNumber?: string;
  estimatedGraduationYear?: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationMessage?: string;
  verifiedAt?: string;
  createdAt: string;
}

// Project Types
export type ProjectStatus = 'draft' | 'pending_review' | 'published' | 'fundable' | 'funded' | 'completed' | 'archived';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Project {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  short_description?: string;
  repo_url?: string;
  demo_url?: string;
  website_url?: string;
  funding_goal: number;
  currency: string;
  tags?: string[];
  category?: string;
  difficulty_level?: DifficultyLevel;
  milestones?: Milestone[];
  status: ProjectStatus;
  is_featured: boolean;
  is_public: boolean;
  funding_raised: number;
  views_count: number;
  likes_count: number;
  shares_count: number;
  screenshots?: string[];
  videos?: string[];
  documents?: string[];
  created_at: string;
  updated_at?: string;
  published_at?: string;
  owner?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

export interface Milestone {
  title: string;
  description: string;
  target_date: string;
  funding_required: number;
}

// Donation Types
export type DonationStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';
export type PaymentMethod = 'stellar_xlm' | 'stellar_usdc' | 'stripe_card' | 'mpesa' | 'bank_transfer';

export interface Donation {
  id: number;
  donor_id?: number;
  recipient_id?: number;
  project_id?: number;
  campaign_id?: number;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  message?: string;
  is_anonymous: boolean;
  status: DonationStatus;
  tx_hash?: string;
  stellar_transaction_id?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at?: string;
  donor?: {
    id: number;
    username: string;
    full_name?: string;
  };
  recipient?: {
    id: number;
    username: string;
    full_name?: string;
  };
  project?: {
    id: number;
    title: string;
  };
  campaign?: {
    id: number;
    name: string;
  };
}

// Wallet Types
export interface Wallet {
  id: number;
  user_id: number;
  public_key: string;
  is_connected: boolean;
  is_verified: boolean;
  xlm_balance: number;
  usdc_balance: number;
  last_balance_update: string;
  connected_via?: string;
}

// Campaign Types
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Campaign {
  id: number;
  created_by: number;
  name: string;
  description: string;
  short_description?: string;
  funding_goal: number;
  currency: string;
  start_date: string;
  end_date: string;
  eligibility_criteria?: any;
  distribution_method?: string;
  status: CampaignStatus;
  total_funding: number;
  total_applications: number;
  total_distributions: number;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  image_url?: string;
  organizer?: {
    id: number;
    name: string;
    email: string;
    website: string;
  };
}
