import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    description: options?.description,
    duration: options?.duration || 6000,
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  return toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    icon: <Info className="h-4 w-4 text-blue-600" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
};

// Enhanced toast for authentication errors
export const showAuthErrorToast = (error: any) => {
  const message = error instanceof Error ? error.message : 'Authentication failed';
  
  return showErrorToast(message, {
    title: 'Authentication Error',
    description: 'Please check your credentials and try again.',
    duration: 6000,
  });
};

// Enhanced toast for validation errors
export const showValidationErrorToast = (errors: any[]) => {
  const message = errors.length === 1 
    ? errors[0].msg 
    : `Multiple validation errors: ${errors.length} issues found`;
  
  return showErrorToast(message, {
    title: 'Validation Error',
    description: errors.length > 1 ? 'Please fix all the highlighted fields.' : 'Please check the highlighted field.',
    duration: 6000,
  });
};

// Enhanced toast for network errors
export const showNetworkErrorToast = () => {
  return showErrorToast('Network Error', {
    title: 'Connection Failed',
    description: 'Unable to connect to the server. Please check your internet connection.',
    duration: 8000,
    action: {
      label: 'Retry',
      onClick: () => window.location.reload(),
    },
  });
};

// Enhanced toast for success with additional info
export const showAuthSuccessToast = (message: string, userRole?: string) => {
  return showSuccessToast(message, {
    title: 'Welcome!',
    description: userRole 
      ? `You are logged in as a ${userRole.toLowerCase()}.` 
      : 'You have been successfully authenticated.',
    duration: 5000,
  });
};
