import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Save,
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { projectsAPI } from '@/services/projects';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isVerifiedStudent, isPendingVerification, isVerificationRejected, refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  // Form state matching backend requirements
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: '',
    imageUrl: '',
    bannerImage: '',
    screenshots: [] as string[],
    repoUrl: '',
    demoUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState<Record<number, boolean>>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);

  // Backend-supported categories
  const categories = [
    { value: 'EDUCATION', label: 'Education' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'ENVIRONMENT', label: 'Environment' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'ARTS', label: 'Arts' },
    { value: 'OTHER', label: 'Other' }
  ];

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        if (!user || !user.studentProfile) {
          await refreshUserProfile();
        }
        
        if (!isVerifiedStudent()) {
          toast.error('You need to be verified as a student to create projects');
          navigate('/student/dashboard');
        }
      } catch (error: any) {
        console.error('Failed to check verification status:', error);
        if (!error.message?.includes('429')) {
          toast.error('Failed to verify your status');
        }
        navigate('/student/dashboard');
      } finally {
        setIsCheckingVerification(false);
      }
    };

    checkVerificationStatus();
  }, [isVerifiedStudent, refreshUserProfile, navigate, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be no more than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be no more than 2000 characters';
    }

    if (!formData.goalAmount.trim()) {
      newErrors.goalAmount = 'Funding goal is required';
    } else {
      const amount = parseFloat(formData.goalAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.goalAmount = 'Funding goal must be a positive number';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Validate optional URLs
    if (formData.repoUrl && formData.repoUrl.trim()) {
      try {
        new URL(formData.repoUrl.trim());
      } catch {
        newErrors.repoUrl = 'GitHub URL must be a valid URL';
      }
    }

    if (formData.demoUrl && formData.demoUrl.trim()) {
      try {
        new URL(formData.demoUrl.trim());
      } catch {
        newErrors.demoUrl = 'Demo URL must be a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleScreenshotFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if maximum screenshots reached
    if (formData.screenshots.length >= 5) {
      toast.error('Maximum 5 screenshots allowed');
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    const screenshotIndex = formData.screenshots.length;
    setUploadingScreenshots(prev => ({ ...prev, [screenshotIndex]: true }));

    try {
      const response = await apiService.uploadImage(file);
      const imageUrl = response.data.imageUrl;
      setFormData(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, imageUrl]
      }));
      toast.success('Screenshot uploaded successfully');
    } catch (error: any) {
      console.error('Failed to upload screenshot:', error);
      toast.error(error?.message || 'Failed to upload screenshot');
    } finally {
      setUploadingScreenshots(prev => {
        const newState = { ...prev };
        delete newState[screenshotIndex];
        return newState;
      });
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    setSelectedImageFile(file);
    setUploadingImage(true);

    try {
      const response = await apiService.uploadImage(file);
      const imageUrl = response.data.imageUrl;
      handleInputChange('imageUrl', imageUrl);
      toast.success('Image uploaded successfully');
      setSelectedImageFile(null);
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error(error?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleBannerFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    setSelectedBannerFile(file);
    setUploadingBanner(true);

    try {
      const response = await apiService.uploadImage(file);
      const imageUrl = response.data.imageUrl;
      handleInputChange('bannerImage', imageUrl);
      toast.success('Banner image uploaded successfully');
      setSelectedBannerFile(null);
    } catch (error: any) {
      console.error('Failed to upload banner image:', error);
      toast.error(error?.message || 'Failed to upload banner image');
    } finally {
      setUploadingBanner(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    
    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        goalAmount: parseFloat(formData.goalAmount),
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        bannerImage: formData.bannerImage || undefined,
        screenshots: formData.screenshots.length > 0 ? formData.screenshots : undefined,
        repo_url: formData.repoUrl.trim() || undefined,
        demo_url: formData.demoUrl.trim() || undefined
      };

      await projectsAPI.createProject(projectData);
      toast.success('Project created successfully!');
      navigate('/student/dashboard');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      const errorMessage = error?.details?.errors?.[0]?.msg || 
                          error?.message || 
                          'Failed to create project. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking verification
  if (isCheckingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking verification status...</p>
        </div>
      </div>
    );
  }

  // Show verification required message if not verified
  if (!isVerifiedStudent()) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="max-w-2xl mx-auto border-red-500/20 bg-red-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4">
                    {isPendingVerification() ? 'Verification Pending' : 
                     isVerificationRejected() ? 'Verification Required' : 
                     'Access Restricted'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {isPendingVerification() ? 
                      'Your student profile is under review. You\'ll be able to create projects once verified.' :
                     isVerificationRejected() ?
                      'Your student verification was rejected. Please contact support or update your profile.' :
                      'You need to be verified as a student to create projects.'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
                  Create New <span className="text-primary">Project</span>
                </h1>
                <p className="text-muted-foreground">Share your innovative ideas with the world</p>
              </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/student/dashboard')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
            </div>
          </motion.div>

          {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
            >
              <Card className="border-border bg-card">
                <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Fill in the details about your project. All fields marked with * are required.
                </CardDescription>
                </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                      <div className="space-y-2">
                    <Label htmlFor="title">
                      Project Title <span className="text-destructive">*</span>
                    </Label>
                        <Input
                          id="title"
                      placeholder="Enter your project title (3-100 characters)"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.title.length}/100 characters
                    </p>
                      </div>

                  {/* Description */}
                      <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                        <Textarea
                      id="description"
                      placeholder="Describe your project in detail. What problem does it solve? How does it work? What makes it unique? (10-2000 characters)"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={8}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.description}
                      </p>
                    )}
                        <p className="text-xs text-muted-foreground">
                      {formData.description.length}/2000 characters
                        </p>
                      </div>

                  {/* Funding Goal and Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                      <Label htmlFor="goalAmount">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Funding Goal <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="goalAmount"
                        type="number"
                        placeholder="10000"
                        min="1"
                        step="0.01"
                        value={formData.goalAmount}
                        onChange={(e) => handleInputChange('goalAmount', e.target.value)}
                        className={errors.goalAmount ? 'border-destructive' : ''}
                      />
                      {errors.goalAmount && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.goalAmount}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* GitHub and Demo URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="repoUrl">
                        GitHub Repository URL (Optional)
                      </Label>
                      <Input
                        id="repoUrl"
                        type="url"
                        placeholder="https://github.com/username/repository"
                        value={formData.repoUrl}
                        onChange={(e) => handleInputChange('repoUrl', e.target.value)}
                        className={errors.repoUrl ? 'border-destructive' : ''}
                      />
                      {errors.repoUrl && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.repoUrl}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="demoUrl">
                        Demo/Live URL (Optional)
                      </Label>
                      <Input
                        id="demoUrl"
                        type="url"
                        placeholder="https://your-demo-url.com"
                        value={formData.demoUrl}
                        onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                        className={errors.demoUrl ? 'border-destructive' : ''}
                      />
                      {errors.demoUrl && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.demoUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image File Uploads */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageFile">
                          <ImageIcon className="inline h-4 w-4 mr-1" />
                          Project Image (Optional)
                        </Label>
                        <div className="space-y-2">
                          <Input
                            id="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileSelect}
                            disabled={uploadingImage}
                            className="text-sm"
                          />
                          {uploadingImage && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary inline-block"></span>
                              Uploading image...
                            </p>
                          )}
                          {formData.imageUrl && !uploadingImage && (
                            <div className="mt-2">
                              <img 
                                src={formData.imageUrl} 
                                alt="Preview" 
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                        {errors.imageUrl && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.imageUrl}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bannerFile">
                          <ImageIcon className="inline h-4 w-4 mr-1" />
                          Banner Image (Optional)
                        </Label>
                        <div className="space-y-2">
                          <Input
                            id="bannerFile"
                            type="file"
                            accept="image/*"
                            onChange={handleBannerFileSelect}
                            disabled={uploadingBanner}
                            className="text-sm"
                          />
                          {uploadingBanner && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary inline-block"></span>
                              Uploading banner...
                            </p>
                          )}
                          {formData.bannerImage && !uploadingBanner && (
                            <div className="mt-2">
                              <img 
                                src={formData.bannerImage} 
                                alt="Banner Preview" 
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                        {errors.bannerImage && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.bannerImage}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Screenshots */}
                    <div className="space-y-2">
                      <Label htmlFor="screenshotFile">
                        <ImageIcon className="inline h-4 w-4 mr-1" />
                        Screenshots (Optional) - Max 5
                        {formData.screenshots.length > 0 && (
                          <span className="text-muted-foreground ml-2">
                            ({formData.screenshots.length}/5)
                          </span>
                        )}
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="screenshotFile"
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotFileSelect}
                          disabled={
                            Object.values(uploadingScreenshots).some(loading => loading) ||
                            formData.screenshots.length >= 5
                          }
                          className="text-sm"
                        />
                        {formData.screenshots.length >= 5 && (
                          <p className="text-xs text-muted-foreground">
                            Maximum of 5 screenshots reached. Remove one to add another.
                          </p>
                        )}
                        {Object.values(uploadingScreenshots).some(loading => loading) && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary inline-block"></span>
                            Uploading screenshot...
                          </p>
                        )}
                        {formData.screenshots.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {formData.screenshots.map((screenshot, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                <img 
                                  src={screenshot} 
                                  alt={`Screenshot ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23ccc"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate text-muted-foreground">Screenshot {index + 1}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveScreenshot(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

              {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                      type="button"
                  variant="outline"
                  onClick={() => navigate('/student/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                      type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto shadow-glow"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
              </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
