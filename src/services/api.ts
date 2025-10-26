// API service for Express backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

interface ApiError {
  message: string;
  errors?: Array<{ msg: string; param: string; value: string }>;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth-token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth-token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth-token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        let errorDetails: any = null;
        
        try {
          const errorData: ApiError = await response.json();
          errorDetails = errorData;
          
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors.map(err => err.msg).join(', ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        // Create a more detailed error object
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).details = errorDetails;
        throw error;
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async signup(userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signupStudent(studentData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
    schoolEmail: string;
    schoolName: string;
    admissionNumber: string;
    idNumber?: string;
    estimatedGraduationYear?: number;
  }) {
    return this.request('/auth/student-register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async logout() {
    // JWT tokens are stateless, so logout is handled client-side
    // Just clear the token - no server call needed
    this.clearToken();
    return Promise.resolve({ data: {}, status: 200 });
  }

  async getUserProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: {
    fullName?: string;
    phone?: string;
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Project endpoints
  async getProjects(params?: {
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    
    return this.request(endpoint);
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Campaign endpoints
  async getCampaigns(params?: {
    search?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/campaigns?${queryString}` : '/campaigns';
    
    return this.request(endpoint);
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`);
  }

  // Donation endpoints
  async getDonations(params?: {
    donor_id?: string;
    project_id?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.donor_id) queryParams.append('donor_id', params.donor_id);
    if (params?.project_id) queryParams.append('project_id', params.project_id);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/donations?${queryString}` : '/donations';
    
    return this.request(endpoint);
  }

  async createDonation(donationData: any) {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  // Posts endpoints
  async getPosts(params?: {
    skip?: number;
    limit?: number;
    postType?: string;
    isFundable?: boolean;
    authorId?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.postType) queryParams.append('postType', params.postType);
    if (params?.isFundable !== undefined) queryParams.append('isFundable', params.isFundable.toString());
    if (params?.authorId) queryParams.append('authorId', params.authorId.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/posts?${queryString}` : '/posts';
    
    return this.request(endpoint);
  }

  async getPost(id: string) {
    return this.request(`/posts/${id}`);
  }

  async createPost(postData: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: string, postData: any) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id: string) {
    return this.request(`/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async sharePost(id: string) {
    return this.request(`/posts/${id}/share`, {
      method: 'POST',
    });
  }

  // Wallet endpoints
  async getWallet() {
    return this.request('/wallets');
  }

  async connectWallet(walletData: any) {
    return this.request('/wallets/connect', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  }

  // Admin endpoints
  async getPendingVerifications() {
    return this.request('/admin/verifications');
  }

  async approveVerification(id: string) {
    return this.request(`/admin/verify-student`, {
      method: 'POST',
      body: JSON.stringify({ user_id: parseInt(id), approve: true }),
    });
  }

  async rejectVerification(id: string) {
    return this.request(`/admin/verify-student`, {
      method: 'POST',
      body: JSON.stringify({ user_id: parseInt(id), approve: false }),
    });
  }

  async getAnalytics() {
    return this.request('/admin/stats');
  }

  // Student endpoints
  async getStudentProfile() {
    return this.request('/students/profile');
  }

  async updateStudentProfile(profileData: any) {
    return this.request('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
