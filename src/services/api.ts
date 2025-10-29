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
  // Request deduplication: track in-flight requests to prevent duplicate calls
  private pendingRequests = new Map<string, Promise<ApiResponse<any>>>();

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

  // Generate a unique key for request deduplication
  private getRequestKey(endpoint: string, options: RequestInit = {}): string {
    const method = options.method || 'GET';
    const body = options.body ? String(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2
  ): Promise<ApiResponse<T>> {
    const requestKey = this.getRequestKey(endpoint, options);
    
    // If the same request is already in flight, return the existing promise
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)! as Promise<ApiResponse<T>>;
    }

    // Create the request promise
    const requestPromise = this.executeRequest<T>(endpoint, options, retries);
    
    // Store it in pending requests
    this.pendingRequests.set(requestKey, requestPromise);
    
    // Remove from pending requests when done (success or failure)
    requestPromise.finally(() => {
      this.pendingRequests.delete(requestKey);
    });

    return requestPromise;
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Handle rate limiting (429) with retry
        if (response.status === 429 && attempt < retries) {
          const retryAfter = response.headers.get('Retry-After');
          // Use longer backoff for rate limits: 2s, 4s, 8s
          const waitTime = retryAfter 
            ? parseInt(retryAfter, 10) * 1000 
            : Math.pow(2, attempt + 1) * 1000;
          
          console.warn(`Rate limited. Retrying after ${waitTime}ms... (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

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
          data: data.data || data, // Handle both wrapped and unwrapped responses
          status: response.status,
        };
      } catch (error: any) {
        // If this is the last attempt or not a 429 error, throw
        if (attempt === retries || (error.status !== undefined && error.status !== 429)) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Network error occurred');
        }
        // Otherwise, wait and retry
        const waitTime = Math.pow(2, attempt + 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error('Request failed after retries');
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request('/api/auth/login', {
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
    return this.request('/api/auth/signup', {
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
    return this.request('/api/auth/student-register', {
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
    return this.request('/api/auth/profile');
  }

  async updateProfile(profileData: {
    fullName?: string;
    phone?: string;
  }) {
    return this.request('/api/auth/profile', {
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
    const endpoint = queryString ? `/api/projects?${queryString}` : '/api/projects';
    
    return this.request(endpoint);
  }

  async getProject(id: string) {
    return this.request(`/api/projects/${id}`);
  }

  async createProject(projectData: any) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Campaign endpoints
  async getCampaigns(params?: {
    search?: string;
    status?: string;
    includeExpired?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.includeExpired) queryParams.append('includeExpired', 'true');

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/campaigns?${queryString}` : '/api/campaigns';
    
    return this.request(endpoint);
  }

  async getCampaign(id: string) {
    return this.request(`/api/campaigns/${id}`);
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
    const endpoint = queryString ? `/api/donations?${queryString}` : '/api/donations';
    
    return this.request(endpoint);
  }

  async createDonation(donationData: any) {
    return this.request('/api/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async getDonation(id: string) {
    return this.request(`/api/donations/${id}`);
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
    const endpoint = queryString ? `/api/posts?${queryString}` : '/api/posts';
    
    return this.request(endpoint);
  }

  async getPost(id: string) {
    return this.request(`/api/posts/${id}`);
  }

  async createPost(postData: any) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: string, postData: any) {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: string) {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id: string) {
    return this.request(`/api/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async sharePost(id: string) {
    return this.request(`/api/posts/${id}/share`, {
      method: 'POST',
    });
  }

  // Wallet endpoints
  async getWallet() {
    return this.request('/api/wallets');
  }

  async connectWallet(walletData: any) {
    return this.request('/api/wallets/connect', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  }

  // Admin endpoints
  async getPendingVerifications() {
    return this.request('/api/admin/verifications');
  }

  async getAllStudentVerifications() {
    return this.request('/api/admin/verifications/all');
  }

  async getAllProjects(params?: {
    search?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return this.request(`/api/admin/projects${queryString ? `?${queryString}` : ''}`);
  }

  async updateProjectStatus(projectId: string, status: string) {
    return this.request(`/api/admin/projects/${projectId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteAdminProject(projectId: string) {
    return this.request(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async approveVerification(id: string) {
    return this.request(`/api/admin/verify-student`, {
      method: 'POST',
      body: JSON.stringify({ user_id: parseInt(id), approve: true }),
    });
  }

  async rejectVerification(id: string) {
    return this.request(`/api/admin/verify-student`, {
      method: 'POST',
      body: JSON.stringify({ user_id: parseInt(id), approve: false }),
    });
  }

  async getAnalytics() {
    return this.request('/api/admin/stats');
  }

  async getDashboardStats() {
    return this.request('/api/admin/dashboard-stats');
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/admin/users?${queryString}` : '/api/admin/users';
    
    return this.request(endpoint);
  }

  async updateUserStatus(userId: number, status: string) {
    return this.request(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(userId: number) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getUserById(userId: number) {
    return this.request(`/api/admin/users/${userId}`);
  }

  async updateUser(userId: number, userData: {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
  }) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Student endpoints
  async getStudentProfile() {
    return this.request('/api/students/profile');
  }

  async updateStudentProfile(profileData: any) {
    return this.request('/api/students/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getMyProjects(status?: string) {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/students/my-projects?${queryString}` : '/api/students/my-projects';
    
    return this.request(endpoint);
  }

  async getProjectAnalytics(projectId: string) {
    return this.request(`/api/projects/${projectId}/analytics`);
  }

  // Project engagement endpoints
  async likeProject(projectId: string) {
    return this.request(`/api/projects/${projectId}/like`, {
      method: 'POST',
    });
  }

  async getProjectLikeStatus(projectId: string) {
    return this.request(`/api/projects/${projectId}/like-status`);
  }

  async trackProjectShare(projectId: string) {
    return this.request(`/api/projects/${projectId}/share`, {
      method: 'POST',
    });
  }

  async trackProjectView(projectId: string) {
    return this.request(`/api/projects/${projectId}/view`, {
      method: 'POST',
    });
  }

  // Upload endpoints
  async uploadImage(file: File): Promise<ApiResponse<{ imageUrl: string; fileName: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseURL}/api/upload/image`;
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async uploadProjectImage(
    file: File,
    projectData: {
      projectName: string;
      description: string;
      category: string;
      studentId?: string;
    }
  ): Promise<ApiResponse<{ project: any; imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectName', projectData.projectName);
    formData.append('description', projectData.description);
    formData.append('category', projectData.category);
    if (projectData.studentId) {
      formData.append('studentId', projectData.studentId);
    }

    const url = `${this.baseURL}/api/upload/project-image`;
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
