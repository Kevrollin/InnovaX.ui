export interface Post {
  id: number;
  authorId: number;
  title: string;
  content: string;
  mediaUrl: string[] | null;
  postType: 'insights' | 'achievements' | 'trends' | 'announcements';
  isFundable: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    username: string;
    fullName: string;
    profilePicture: string | null;
    role: string;
  };
}

export interface CreatePostData {
  title: string;
  content: string;
  postType?: 'insights' | 'achievements' | 'trends' | 'announcements';
  mediaUrl?: string[];
  isPublic?: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  postType?: 'insights' | 'achievements' | 'trends' | 'announcements';
  mediaUrl?: string[];
  isPublic?: boolean;
}

export interface GetPostsParams {
  skip?: number;
  limit?: number;
  postType?: 'insights' | 'achievements' | 'trends' | 'announcements';
  isFundable?: boolean;
  authorId?: number;
}

// Mock posts data
const mockPosts: Post[] = [
  {
    id: 1,
    authorId: 1,
    title: 'The Future of Sustainable Technology',
    content: 'As we move forward, sustainable technology will play a crucial role in addressing global challenges. From renewable energy solutions to eco-friendly materials, innovation is key to creating a better future.',
    mediaUrl: ['/placeholder.svg'],
    postType: 'insights',
    isFundable: true,
    likesCount: 42,
    commentsCount: 8,
    sharesCount: 12,
    viewsCount: 156,
    isPublic: true,
    status: 'published',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    author: {
      id: 1,
      username: 'tech_innovator',
      fullName: 'Sarah Johnson',
      profilePicture: '/placeholder.svg',
      role: 'student'
    }
  },
  {
    id: 2,
    authorId: 2,
    title: 'Project Milestone Achieved!',
    content: 'We are excited to announce that our AI-powered study assistant has reached its first major milestone. The prototype is now ready for user testing.',
    mediaUrl: ['/placeholder.svg'],
    postType: 'achievements',
    isFundable: false,
    likesCount: 28,
    commentsCount: 5,
    sharesCount: 7,
    viewsCount: 89,
    isPublic: true,
    status: 'published',
    createdAt: '2024-01-22T14:30:00Z',
    updatedAt: '2024-01-22T14:30:00Z',
    author: {
      id: 2,
      username: 'ai_developer',
      fullName: 'Mike Chen',
      profilePicture: '/placeholder.svg',
      role: 'student'
    }
  },
  {
    id: 3,
    authorId: 3,
    title: 'Trending: Community-Driven Innovation',
    content: 'Community-driven innovation is becoming the new norm. Projects that involve local communities in the development process are showing remarkable success rates.',
    mediaUrl: null,
    postType: 'trends',
    isFundable: true,
    likesCount: 67,
    commentsCount: 15,
    sharesCount: 23,
    viewsCount: 234,
    isPublic: true,
    status: 'published',
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-01-25T09:15:00Z',
    author: {
      id: 3,
      username: 'community_leader',
      fullName: 'Emma Rodriguez',
      profilePicture: '/placeholder.svg',
      role: 'donor'
    }
  },
  {
    id: 4,
    authorId: 1,
    title: 'New Funding Opportunities Available',
    content: 'We are pleased to announce new funding opportunities for innovative projects in the areas of sustainability and social impact. Applications are now open!',
    mediaUrl: ['/placeholder.svg'],
    postType: 'announcements',
    isFundable: false,
    likesCount: 34,
    commentsCount: 12,
    sharesCount: 18,
    viewsCount: 178,
    isPublic: true,
    status: 'published',
    createdAt: '2024-01-28T11:45:00Z',
    updatedAt: '2024-01-28T11:45:00Z',
    author: {
      id: 1,
      username: 'platform_admin',
      fullName: 'Admin User',
      profilePicture: '/placeholder.svg',
      role: 'admin'
    }
  }
];

export const postsAPI = {
  getPosts: async (params?: GetPostsParams): Promise<{ posts: Post[]; total: number; page: number; size: number; has_next: boolean }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredPosts = [...mockPosts];
    
    // Apply filters
    if (params?.postType) {
      filteredPosts = filteredPosts.filter(post => post.postType === params.postType);
    }
    
    if (params?.isFundable !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.isFundable === params.isFundable);
    }
    
    if (params?.authorId) {
      filteredPosts = filteredPosts.filter(post => post.authorId === params.authorId);
    }
    
    // Apply pagination
    const skip = params?.skip || 0;
    const limit = params?.limit || 10;
    const total = filteredPosts.length;
    const page = Math.floor(skip / limit) + 1;
    const has_next = skip + limit < total;
    
    const posts = filteredPosts.slice(skip, skip + limit);
    
    return {
      posts,
      total,
      page,
      size: limit,
      has_next
    };
  },

  getPost: async (id: number): Promise<Post> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const post = mockPosts.find(p => p.id === id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    return post;
  },

  createPost: async (data: CreatePostData): Promise<Post> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPost: Post = {
      id: mockPosts.length + 1,
      authorId: 1, // Mock current user ID
      title: data.title,
      content: data.content,
      mediaUrl: data.mediaUrl || null,
      postType: data.postType || 'insights',
      isFundable: false,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      isPublic: data.isPublic !== false,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: 1,
        username: 'current_user',
        fullName: 'Current User',
        profilePicture: '/placeholder.svg',
        role: 'student'
      }
    };
    
    mockPosts.unshift(newPost); // Add to beginning
    return newPost;
  },

  updatePost: async (id: number, data: UpdatePostData): Promise<Post> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const postIndex = mockPosts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    mockPosts[postIndex] = {
      ...mockPosts[postIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return mockPosts[postIndex];
  },

  deletePost: async (id: number): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const postIndex = mockPosts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    mockPosts.splice(postIndex, 1);
  },

  likePost: async (id: number): Promise<{ message: string; likesCount: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const post = mockPosts.find(p => p.id === id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    post.likesCount += 1;
    
    return {
      message: 'Post liked successfully',
      likesCount: post.likesCount
    };
  },

  sharePost: async (id: number): Promise<{ message: string; sharesCount: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const post = mockPosts.find(p => p.id === id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    post.sharesCount += 1;
    
    return {
      message: 'Post shared successfully',
      sharesCount: post.sharesCount
    };
  },
};
