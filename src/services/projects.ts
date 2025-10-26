import { Project } from '@/types';
import { triggerProjectLike, triggerProjectUnlike } from '@/utils/realtime';

export interface ProjectFilters {
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  short_description: string;
  category: string;
  difficulty_level?: string;
  funding_goal: number;
  currency: string;
  repo_url?: string;
  demo_url?: string;
  website_url?: string;
  tags: string[];
  milestones?: Array<{
    title: string;
    description: string;
    target_date: string;
    funding_required: number;
  }>;
  screenshots?: string[];
  videos?: string[];
  documents?: string[];
}

// Mock projects data
const mockProjects: Project[] = [
  {
    id: 1,
    title: "Eco-Friendly Water Bottle",
    description: "A sustainable water bottle made from recycled materials with smart temperature monitoring.",
    short_description: "Smart eco water bottle",
    category: "Technology",
    difficulty_level: "Intermediate",
    funding_goal: 50000,
    currency: "USD",
    funding_raised: 25000,
    status: "active",
    repo_url: "https://github.com/example/water-bottle",
    demo_url: "https://demo.example.com",
    website_url: "https://example.com",
    tags: ["sustainability", "technology", "health"],
    screenshots: ["/placeholder.svg"],
    videos: [],
    documents: [],
    milestones: [
      {
        id: 1,
        title: "Prototype Development",
        description: "Create initial prototype",
        target_date: "2024-03-01",
        funding_required: 15000,
        is_completed: true
      },
      {
        id: 2,
        title: "Manufacturing Setup",
        description: "Set up production line",
        target_date: "2024-06-01",
        funding_required: 25000,
        is_completed: false
      }
    ],
    owner_id: 1,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z",
    likes_count: 42,
    is_liked: false,
    is_featured: true,
    is_public: true,
    views_count: 156,
    shares_count: 12,
    owner: {
      id: 1,
      username: "eco_innovator",
      full_name: "Sarah Johnson"
    }
  },
  {
    id: 2,
    title: "AI-Powered Study Assistant",
    description: "An intelligent study companion that helps students organize their learning and track progress.",
    short_description: "AI study companion",
    category: "Education",
    difficulty_level: "Advanced",
    funding_goal: 75000,
    currency: "USD",
    funding_raised: 12000,
    status: "active",
    repo_url: "https://github.com/example/study-assistant",
    demo_url: "https://demo.example.com/study",
    website_url: "https://study.example.com",
    tags: ["AI", "education", "productivity"],
    screenshots: ["/placeholder.svg"],
    videos: [],
    documents: [],
    milestones: [
      {
        id: 3,
        title: "AI Model Training",
        description: "Train the core AI model",
        target_date: "2024-04-01",
        funding_required: 30000,
        is_completed: false
      }
    ],
    owner_id: 2,
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-18T14:20:00Z",
    likes_count: 28,
    is_liked: true,
    is_featured: false,
    is_public: true,
    views_count: 89,
    shares_count: 7,
    owner: {
      id: 2,
      username: "ai_developer",
      full_name: "Mike Chen"
    }
  },
  {
    id: 3,
    title: "Community Garden Initiative",
    description: "Transform urban spaces into productive community gardens with smart irrigation systems.",
    short_description: "Smart community gardens",
    category: "Community",
    difficulty_level: "Beginner",
    funding_goal: 30000,
    currency: "USD",
    funding_raised: 30000,
    status: "completed",
    repo_url: "https://github.com/example/community-garden",
    demo_url: "https://demo.example.com",
    website_url: "https://garden.example.com",
    tags: ["community", "sustainability", "urban-farming"],
    screenshots: ["/placeholder.svg"],
    videos: [],
    documents: [],
    milestones: [
      {
        id: 4,
        title: "Site Preparation",
        description: "Prepare garden sites",
        target_date: "2024-02-01",
        funding_required: 10000,
        is_completed: true
      },
      {
        id: 5,
        title: "Irrigation System",
        description: "Install smart irrigation",
        target_date: "2024-03-01",
        funding_required: 20000,
        is_completed: true
      }
    ],
    owner_id: 3,
    created_at: "2024-01-05T08:00:00Z",
    updated_at: "2024-01-25T16:45:00Z",
    likes_count: 67,
    is_liked: false,
    is_featured: true,
    is_public: true,
    views_count: 234,
    shares_count: 23,
    owner: {
      id: 3,
      username: "community_leader",
      full_name: "Emma Rodriguez"
    }
  }
];

export const projectsAPI = {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredProjects = [...mockProjects];
    
    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProjects = filteredProjects.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters?.category && filters.category !== 'all') {
      filteredProjects = filteredProjects.filter(project => 
        project.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    
    if (filters?.status) {
      filteredProjects = filteredProjects.filter(project => 
        project.status === filters.status
      );
    }
    
    // Apply sorting
    if (filters?.sort) {
      switch (filters.sort) {
        case 'newest':
          filteredProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'oldest':
          filteredProjects.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'most_funded':
          filteredProjects.sort((a, b) => b.current_funding - a.current_funding);
          break;
        case 'least_funded':
          filteredProjects.sort((a, b) => a.current_funding - b.current_funding);
          break;
        case 'most_liked':
          filteredProjects.sort((a, b) => b.likes_count - a.likes_count);
          break;
      }
    }
    
    return filteredProjects;
  },

  async getProject(id: string): Promise<Project> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const project = mockProjects.find(p => p.id === parseInt(id));
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project;
  },

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newProject: Project = {
      id: mockProjects.length + 1,
      ...projectData,
      funding_raised: 0,
      status: 'active',
      owner_id: 1, // Mock user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      is_liked: false,
      is_featured: false,
      is_public: true,
      views_count: 0,
      shares_count: 0,
      screenshots: projectData.screenshots || [],
      videos: projectData.videos || [],
      documents: projectData.documents || [],
      milestones: projectData.milestones?.map((milestone, index) => ({
        id: index + 1,
        ...milestone,
        is_completed: false
      })) || [],
      owner: {
        id: 1,
        username: 'current_user',
        full_name: 'Current User'
      }
    };
    
    mockProjects.push(newProject);
    return newProject;
  },

  async updateProject(id: string, projectData: Partial<CreateProjectRequest>): Promise<Project> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const projectIndex = mockProjects.findIndex(p => p.id === parseInt(id));
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...projectData,
      updated_at: new Date().toISOString()
    };
    
    return mockProjects[projectIndex];
  },

  async deleteProject(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const projectIndex = mockProjects.findIndex(p => p.id === parseInt(id));
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    mockProjects.splice(projectIndex, 1);
  },

  async likeProject(projectId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const project = mockProjects.find(p => p.id === parseInt(projectId));
    if (project) {
      project.likes_count += 1;
      project.is_liked = true;
      triggerProjectLike();
    }
  },

  async unlikeProject(projectId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const project = mockProjects.find(p => p.id === parseInt(projectId));
    if (project) {
      project.likes_count = Math.max(0, project.likes_count - 1);
      project.is_liked = false;
      triggerProjectUnlike();
    }
  },
};
