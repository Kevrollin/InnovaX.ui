import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image, 
  FileText, 
  Link, 
  Github, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Trophy,
  Award,
  Calendar,
  Clock
} from 'lucide-react';
import { CampaignWithSubmissions } from '@/types';

interface SubmissionForm {
  projectTitle: string;
  projectDescription: string;
  projectScreenshots: File[];
  projectLinks: {
    demoUrl: string;
    githubUrl: string;
    filesUrl: string;
  };
  pitchDeck: File | null;
}

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithSubmissions;
  onSubmit: (submissionData: any) => Promise<void>;
  isSubmitting?: boolean;
}

const SubmissionModal = ({ 
  isOpen, 
  onClose, 
  campaign, 
  onSubmit, 
  isSubmitting = false 
}: SubmissionModalProps) => {
  const [form, setForm] = useState<SubmissionForm>({
    projectTitle: '',
    projectDescription: '',
    projectScreenshots: [],
    projectLinks: {
      demoUrl: '',
      githubUrl: '',
      filesUrl: ''
    },
    pitchDeck: null
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFileUpload = (files: FileList | null, type: 'screenshots' | 'pitchDeck') => {
    if (!files) return;

    if (type === 'screenshots') {
      const newScreenshots = Array.from(files).filter(file => 
        file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
      );
      
      if (newScreenshots.length !== files.length) {
        setErrors(prev => ({ 
          ...prev, 
          screenshots: 'Only image files under 5MB are allowed' 
        }));
      } else {
        setErrors(prev => ({ ...prev, screenshots: '' }));
      }

      setForm(prev => ({
        ...prev,
        projectScreenshots: [...prev.projectScreenshots, ...newScreenshots].slice(0, 5) // Max 5 screenshots
      }));
    } else if (type === 'pitchDeck') {
      const file = files[0];
      if (file && file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) { // 10MB limit
        setForm(prev => ({ ...prev, pitchDeck: file }));
        setErrors(prev => ({ ...prev, pitchDeck: '' }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          pitchDeck: 'Only PDF files under 10MB are allowed' 
        }));
      }
    }
  };

  const removeFile = (index: number, type: 'screenshots' | 'pitchDeck') => {
    if (type === 'screenshots') {
      setForm(prev => ({
        ...prev,
        projectScreenshots: prev.projectScreenshots.filter((_, i) => i !== index)
      }));
    } else if (type === 'pitchDeck') {
      setForm(prev => ({ ...prev, pitchDeck: null }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required';
    }

    if (!form.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
    }

    if (form.projectScreenshots.length === 0) {
      newErrors.screenshots = 'At least one screenshot is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Simulate file uploads (in real implementation, upload to cloud storage)
      const screenshotUrls: string[] = [];
      let pitchDeckUrl: string | undefined;

      // Upload screenshots
      for (let i = 0; i < form.projectScreenshots.length; i++) {
        setUploadProgress(prev => ({ ...prev, [`screenshot-${i}`]: 0 }));
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setUploadProgress(prev => ({ ...prev, [`screenshot-${i}`]: progress }));
        }
        
        // In real implementation, upload to cloud storage and get URL
        screenshotUrls.push(`https://example.com/screenshots/${Date.now()}-${i}.jpg`);
      }

      // Upload pitch deck
      if (form.pitchDeck) {
        setUploadProgress(prev => ({ ...prev, pitchDeck: 0 }));
        
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => ({ ...prev, pitchDeck: progress }));
        }
        
        pitchDeckUrl = `https://example.com/pitch-decks/${Date.now()}.pdf`;
      }

      const submissionData = {
        projectTitle: form.projectTitle,
        projectDescription: form.projectDescription,
        projectScreenshots: screenshotUrls,
        projectLinks: {
          demoUrl: form.projectLinks.demoUrl || undefined,
          githubUrl: form.projectLinks.githubUrl || undefined,
          filesUrl: form.projectLinks.filesUrl || undefined
        },
        pitchDeckUrl
      };

      await onSubmit(submissionData);
      
      // Reset form
      setForm({
        projectTitle: '',
        projectDescription: '',
        projectScreenshots: [],
        projectLinks: {
          demoUrl: '',
          githubUrl: '',
          filesUrl: ''
        },
        pitchDeck: null
      });
      setUploadProgress({});
      setErrors({});
      
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const getSubmissionDeadline = () => {
    if (!campaign.submissionEndDate) return null;
    const deadline = new Date(campaign.submissionEndDate);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getSubmissionDeadline();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-primary" />
            Submit Project for {campaign.title}
          </DialogTitle>
          <DialogDescription>
            Submit your project to compete for amazing prizes! Make sure to include all required materials.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-medium">Campaign Details</span>
                </div>
                {daysLeft !== null && (
                  <Badge variant={daysLeft > 0 ? "default" : "destructive"}>
                    <Clock className="mr-1 h-3 w-3" />
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Prize Pool:</span>
                  <span className="ml-2 font-medium">
                    {campaign.campaignType === 'custom' 
                      ? `${campaign.rewardPool || 0} XLM` 
                      : `${campaign.prizePool || 0} XLM`
                    }
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Submission Deadline:</span>
                  <span className="ml-2 font-medium">
                    {campaign.submissionEndDate 
                      ? new Date(campaign.submissionEndDate).toLocaleDateString()
                      : 'TBD'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="projectTitle" className="text-base font-medium">
              Project Title *
            </Label>
            <Input
              id="projectTitle"
              placeholder="Enter your project title..."
              value={form.projectTitle}
              onChange={(e) => setForm(prev => ({ ...prev, projectTitle: e.target.value }))}
              className={errors.projectTitle ? 'border-destructive' : ''}
            />
            {errors.projectTitle && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.projectTitle}
              </p>
            )}
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="projectDescription" className="text-base font-medium">
              Project Description *
            </Label>
            <Textarea
              id="projectDescription"
              placeholder="Describe your project, its features, technologies used, and what makes it special..."
              value={form.projectDescription}
              onChange={(e) => setForm(prev => ({ ...prev, projectDescription: e.target.value }))}
              rows={4}
              className={errors.projectDescription ? 'border-destructive' : ''}
            />
            {errors.projectDescription && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.projectDescription}
              </p>
            )}
          </div>

          {/* Project Screenshots */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Project Screenshots * (Max 5 images, 5MB each)
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Drag and drop images here, or click to select</p>
                  <p>PNG, JPG, GIF up to 5MB each</p>
                </div>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'screenshots')}
                  className="hidden"
                  id="screenshots-upload"
                />
                <Label htmlFor="screenshots-upload">
                  <Button variant="outline" asChild>
                    <span>Choose Images</span>
                  </Button>
                </Label>
              </div>
            </div>

            {/* Uploaded Screenshots */}
            {form.projectScreenshots.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {form.projectScreenshots.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index, 'screenshots')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {uploadProgress[`screenshot-${index}`] !== undefined && (
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <Progress value={uploadProgress[`screenshot-${index}`]} className="h-1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {errors.screenshots && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.screenshots}
              </p>
            )}
          </div>

          {/* Project Links */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Project Links</Label>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="demoUrl" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Demo URL
                </Label>
                <Input
                  id="demoUrl"
                  placeholder="https://your-project-demo.com"
                  value={form.projectLinks.demoUrl}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    projectLinks: { ...prev.projectLinks, demoUrl: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Repository
                </Label>
                <Input
                  id="githubUrl"
                  placeholder="https://github.com/username/project"
                  value={form.projectLinks.githubUrl}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    projectLinks: { ...prev.projectLinks, githubUrl: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filesUrl" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Additional Files/Documentation
                </Label>
                <Input
                  id="filesUrl"
                  placeholder="https://drive.google.com/your-files"
                  value={form.projectLinks.filesUrl}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    projectLinks: { ...prev.projectLinks, filesUrl: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Pitch Deck */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Pitch Deck (Optional - PDF, 10MB max)
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Upload your pitch deck presentation</p>
                  <p>PDF format, up to 10MB</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files, 'pitchDeck')}
                  className="hidden"
                  id="pitch-deck-upload"
                />
                <Label htmlFor="pitch-deck-upload">
                  <Button variant="outline" asChild>
                    <span>Choose PDF</span>
                  </Button>
                </Label>
              </div>
            </div>

            {/* Uploaded Pitch Deck */}
            {form.pitchDeck && (
              <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{form.pitchDeck.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(form.pitchDeck.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(0, 'pitchDeck')}
                >
                  <X className="h-4 w-4" />
                </Button>
                {uploadProgress.pitchDeck !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <Progress value={uploadProgress.pitchDeck} className="h-1" />
                  </div>
                )}
              </div>
            )}

            {errors.pitchDeck && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.pitchDeck}
              </p>
            )}
          </div>

          {/* Submission Guidelines */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Submission Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure all screenshots clearly show your project's functionality</li>
                    <li>• Provide working demo links when possible</li>
                    <li>• Include comprehensive project description</li>
                    <li>• Make sure all links are accessible</li>
                    <li>• Submit before the deadline to be considered</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || daysLeft !== null && daysLeft <= 0}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionModal;
