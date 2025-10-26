import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  X, 
  Upload, 
  Link as LinkIcon, 
  Target, 
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Video,
  FileText,
  Save,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { projectsAPI } from '@/services/projects';
import { toast } from 'sonner';
import { Project, Milestone } from '@/types';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    category: '',
    difficulty_level: '',
    funding_goal: '',
    currency: 'XLM',
    repo_url: '',
    demo_url: '',
    website_url: '',
    tags: [] as string[],
    milestones: [] as Milestone[],
    screenshots: [] as string[],
    videos: [] as string[],
    documents: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    target_date: '',
    funding_required: ''
  });

  const categories = [
    'Technology',
    'Sustainability',
    'Social Impact',
    'Healthcare',
    'Education',
    'Arts & Culture',
    'Sports & Fitness',
    'Business & Finance',
    'Science & Research',
    'Other'
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddMilestone = () => {
    if (newMilestone.title && newMilestone.description && newMilestone.target_date && newMilestone.funding_required) {
      const milestone: Milestone = {
        title: newMilestone.title,
        description: newMilestone.description,
        target_date: newMilestone.target_date,
        funding_required: parseFloat(newMilestone.funding_required)
      };
      
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestone]
      }));
      
      setNewMilestone({
        title: '',
        description: '',
        target_date: '',
        funding_required: ''
      });
    }
  };

  const handleRemoveMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (type: 'screenshots' | 'videos' | 'documents', files: FileList | null) => {
    if (files) {
      const fileUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...fileUrls]
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.funding_goal) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      await projectsAPI.createProject(formData);
      toast.success('Project created successfully!');
      setIsLoading(false);
      navigate('/student/dashboard');
    } catch (error) {
      toast.error('Failed to create project. Please try again.');
      setIsLoading(false);
    }
  };

  // TODO: Create project preview object from form data
  const projectPreview: Project = {
    id: 0,
    owner_id: user?.id || 0,
    title: formData.title || 'Your Project Title',
    description: formData.description || 'Your project description will appear here...',
    short_description: formData.short_description || 'A brief description of your project',
    funding_goal: parseFloat(formData.funding_goal) || 0,
    currency: formData.currency,
    tags: formData.tags,
    category: formData.category,
    difficulty_level: formData.difficulty_level as any,
    milestones: formData.milestones,
    status: 'draft',
    is_featured: false,
    is_public: false,
    funding_raised: 0,
    views_count: 0,
    likes_count: 0,
    shares_count: 0,
    screenshots: formData.screenshots,
    videos: formData.videos,
    documents: formData.documents,
    created_at: new Date().toISOString(),
    owner: {
      id: user?.id || 0,
      username: user?.username || 'user',
      full_name: user?.full_name
    }
  };

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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/student/dashboard')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPreview(!isPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isPreview ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </div>
          </motion.div>

          {isPreview ? (
            /* Preview Mode */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{formData.category || 'Category'}</Badge>
                    <Badge variant="outline">{formData.difficulty_level || 'Difficulty'}</Badge>
                    <Badge className="bg-primary/10 text-primary">Draft</Badge>
                  </div>
                  <h2 className="text-2xl font-heading font-bold">{formData.title || 'Project Title'}</h2>
                  <p className="text-muted-foreground">{formData.short_description || 'Short description'}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <div className="prose prose-invert max-w-none">
                      {formData.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-muted-foreground">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {formData.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.milestones.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Milestones</h3>
                      <div className="space-y-3">
                        {formData.milestones.map((milestone, index) => (
                          <div key={index} className="p-3 rounded-lg border border-border">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Target: {new Date(milestone.target_date).toLocaleDateString()}</span>
                              <span>Funding: {milestone.funding_required} {formData.currency}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-border">
                      <h4 className="font-semibold text-primary">Funding Goal</h4>
                      <p className="text-2xl font-bold">{formData.funding_goal} {formData.currency}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <h4 className="font-semibold text-accent">Status</h4>
                      <p className="text-lg">Draft - Not Published</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Edit Mode */
            <div className="max-w-4xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Tell us about your project</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Project Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter your project title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="short_description">Short Description *</Label>
                        <Textarea
                          id="short_description"
                          placeholder="Brief description of your project (max 500 characters)"
                          value={formData.short_description}
                          onChange={(e) => handleInputChange('short_description', e.target.value)}
                          maxLength={500}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.short_description.length}/500 characters
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              {difficultyLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="funding_goal">Funding Goal *</Label>
                          <div className="flex">
                            <Input
                              id="funding_goal"
                              type="number"
                              placeholder="10000"
                              value={formData.funding_goal}
                              onChange={(e) => handleInputChange('funding_goal', e.target.value)}
                              className="rounded-r-none"
                            />
                            <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                              <SelectTrigger className="w-20 rounded-l-none border-l-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="XLM">XLM</SelectItem>
                                <SelectItem value="USDC">USDC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>Project Details</CardTitle>
                      <CardDescription>Provide detailed information about your project</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Full Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your project in detail. What problem does it solve? How does it work? What makes it unique?"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={8}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a tag"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                            <Button type="button" onClick={handleAddTag} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {formData.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                  {tag}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => handleRemoveTag(tag)}
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="font-semibold">Project Links</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="repo_url">GitHub Repository</Label>
                          <div className="flex">
                            <LinkIcon className="h-4 w-4 m-3 text-muted-foreground" />
                            <Input
                              id="repo_url"
                              placeholder="https://github.com/username/repository"
                              value={formData.repo_url}
                              onChange={(e) => handleInputChange('repo_url', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="demo_url">Demo URL</Label>
                          <div className="flex">
                            <LinkIcon className="h-4 w-4 m-3 text-muted-foreground" />
                            <Input
                              id="demo_url"
                              placeholder="https://demo.yourproject.com"
                              value={formData.demo_url}
                              onChange={(e) => handleInputChange('demo_url', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website_url">Project Website</Label>
                          <div className="flex">
                            <LinkIcon className="h-4 w-4 m-3 text-muted-foreground" />
                            <Input
                              id="website_url"
                              placeholder="https://yourproject.com"
                              value={formData.website_url}
                              onChange={(e) => handleInputChange('website_url', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>Media & Files</CardTitle>
                      <CardDescription>Upload images, videos, and documents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Screenshots</Label>
                          <div className="mt-2">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleFileUpload('screenshots', e.target.files)}
                              className="hidden"
                              id="screenshots-upload"
                            />
                            <label
                              htmlFor="screenshots-upload"
                              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-card/50 transition-colors"
                            >
                              <div className="text-center">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Upload screenshots</p>
                              </div>
                            </label>
                          </div>
                          {formData.screenshots.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                              {formData.screenshots.map((screenshot, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={screenshot}
                                    alt={`Screenshot ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg"
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                    onClick={() => {
                                      const newScreenshots = formData.screenshots.filter((_, i) => i !== index);
                                      handleInputChange('screenshots', newScreenshots);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>Videos</Label>
                          <div className="mt-2">
                            <input
                              type="file"
                              multiple
                              accept="video/*"
                              onChange={(e) => handleFileUpload('videos', e.target.files)}
                              className="hidden"
                              id="videos-upload"
                            />
                            <label
                              htmlFor="videos-upload"
                              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-card/50 transition-colors"
                            >
                              <div className="text-center">
                                <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Upload videos</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div>
                          <Label>Documents</Label>
                          <div className="mt-2">
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.txt"
                              onChange={(e) => handleFileUpload('documents', e.target.files)}
                              className="hidden"
                              id="documents-upload"
                            />
                            <label
                              htmlFor="documents-upload"
                              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-card/50 transition-colors"
                            >
                              <div className="text-center">
                                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Upload documents</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-6">
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>Project Milestones</CardTitle>
                      <CardDescription>Define key milestones and funding requirements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="milestone-title">Milestone Title</Label>
                          <Input
                            id="milestone-title"
                            placeholder="e.g., MVP Development"
                            value={newMilestone.title}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="milestone-date">Target Date</Label>
                          <Input
                            id="milestone-date"
                            type="date"
                            value={newMilestone.target_date}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, target_date: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="milestone-description">Description</Label>
                        <Textarea
                          id="milestone-description"
                          placeholder="Describe what this milestone involves"
                          value={newMilestone.description}
                          onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="milestone-funding">Funding Required</Label>
                        <div className="flex">
                          <Input
                            id="milestone-funding"
                            type="number"
                            placeholder="1000"
                            value={newMilestone.funding_required}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, funding_required: e.target.value }))}
                            className="rounded-r-none"
                          />
                          <div className="flex items-center px-3 bg-secondary rounded-r-md border border-l-0 border-border">
                            <span className="text-sm text-muted-foreground">{formData.currency}</span>
                          </div>
                        </div>
                      </div>

                      <Button onClick={handleAddMilestone} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Milestone
                      </Button>

                      {formData.milestones.length > 0 && (
                        <div className="space-y-3">
                          <Separator />
                          <h4 className="font-semibold">Added Milestones</h4>
                          {formData.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold">{milestone.title}</h5>
                                <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(milestone.target_date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {milestone.funding_required} {formData.currency}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMilestone(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-4 mt-8"
              >
                <Button
                  variant="outline"
                  onClick={() => navigate('/student/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
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
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
