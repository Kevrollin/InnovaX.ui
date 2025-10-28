import { apiService } from './api';
import { User } from '@/types';
import { getUserFriendlyMessage, getSuccessMessage } from '@/utils/errorHandler';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface StudentSignupRequest extends SignupRequest {
  schoolEmail: string;
  schoolName: string;
  admissionNumber: string;
  idNumber?: string;
  estimatedGraduationYear?: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.login(credentials.username, credentials.password);
      return response.data; // Backend returns { success: true, data: { access_token, token_type, user } }
    } catch (error) {
      console.error('Login error:', error);
      const friendlyError = new Error(getUserFriendlyMessage(error));
      (friendlyError as any).originalError = error;
      throw friendlyError;
    }
  },

  async signup(userData: SignupRequest): Promise<User> {
    try {
      const response = await apiService.signup(userData);
      return response.data; // Backend returns { success: true, data: user }
    } catch (error) {
      console.error('Signup error:', error);
      const friendlyError = new Error(getUserFriendlyMessage(error));
      (friendlyError as any).originalError = error;
      throw friendlyError;
    }
  },

  async signupStudent(studentData: StudentSignupRequest): Promise<User> {
    try {
      const response = await apiService.signupStudent(studentData);
      return response.data; // Backend returns { success: true, data: user }
    } catch (error) {
      console.error('Student signup error:', error);
      const friendlyError = new Error(getUserFriendlyMessage(error));
      (friendlyError as any).originalError = error;
      throw friendlyError;
    }
  },

  async getUserProfile(): Promise<User> {
    try {
      const response = await apiService.getUserProfile();
      return response.data; // Backend returns { success: true, data: user }
    } catch (error) {
      console.error('Get user profile error:', error);
      const friendlyError = new Error(getUserFriendlyMessage(error));
      (friendlyError as any).originalError = error;
      throw friendlyError;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      apiService.clearToken();
    }
  },

  setToken(token: string): void {
    apiService.setToken(token);
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    try {
      const response = await apiService.updateProfile(profileData);
      return response.data; // Backend returns { success: true, data: user }
    } catch (error) {
      console.error('Update profile error:', error);
      const friendlyError = new Error(getUserFriendlyMessage(error));
      (friendlyError as any).originalError = error;
      throw friendlyError;
    }
  },

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    try {
      // Note: This endpoint might not exist in the Express backend yet
      // You may need to implement it in the backend
      throw new Error('Change password not implemented yet');
    } catch (error) {
      console.error('Change password error:', error);
      const friendlyError = new Error(getUserFriendlyMessage(error));
      (friendlyError as any).originalError = error;
      throw friendlyError;
    }
  },
};
