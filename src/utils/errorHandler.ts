interface ApiError {
  message: string;
  errors?: Array<{ msg: string; param: string; value: string }>;
  status?: number;
  details?: any;
}

export const getErrorMessage = (error: any): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object with a message
  if (error instanceof Error) {
    return error.message;
  }

  // If it's an object with a message property
  if (error && typeof error === 'object' && error.message) {
    return error.message;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

export const getErrorDetails = (error: any): any => {
  if (error && typeof error === 'object') {
    return error.details || error.errors || null;
  }
  return null;
};

export const getErrorStatus = (error: any): number => {
  if (error && typeof error === 'object' && error.status) {
    return error.status;
  }
  return 500;
};

// User-friendly error messages for common scenarios
export const getUserFriendlyMessage = (error: any): string => {
  const message = getErrorMessage(error);
  const status = getErrorStatus(error);

  // Handle specific error cases
  if (message.includes('Incorrect username or password')) {
    return 'Invalid credentials. Please check your username and password.';
  }

  if (message.includes('Username already registered')) {
    return 'This username is already taken. Please choose a different one.';
  }

  if (message.includes('Email already registered')) {
    return 'This email is already registered. Please use a different email or try logging in.';
  }

  if (message.includes('School email already registered')) {
    return 'This school email is already registered. Please use a different email.';
  }

  if (message.includes('Inactive user')) {
    return 'Your account is inactive. Please contact support for assistance.';
  }

  if (message.includes('Invalid token')) {
    return 'Your session has expired. Please log in again.';
  }

  if (message.includes('Network error')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Handle HTTP status codes
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication failed. Please check your credentials.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict detected. The resource already exists or is in use.';
    case 422:
      return 'Validation failed. Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later or contact support.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return message || 'An unexpected error occurred. Please try again.';
  }
};

// Success message helper
export const getSuccessMessage = (action: string, resource?: string): string => {
  const messages: Record<string, string> = {
    login: 'Welcome back! You have been successfully logged in.',
    signup: 'Account created successfully! Welcome to FundHub.',
    studentSignup: 'Student account created! Your account is pending verification.',
    logout: 'You have been successfully logged out.',
    profileUpdate: 'Your profile has been updated successfully.',
    projectCreate: 'Project created successfully!',
    projectUpdate: 'Project updated successfully.',
    projectDelete: 'Project deleted successfully.',
    donationCreate: 'Thank you for your donation!',
    postCreate: 'Post published successfully.',
    postUpdate: 'Post updated successfully.',
    postDelete: 'Post deleted successfully.',
    verificationApprove: 'Student verification approved successfully.',
    verificationReject: 'Student verification rejected.',
  };

  return messages[action] || `${resource || 'Action'} completed successfully.`;
};
