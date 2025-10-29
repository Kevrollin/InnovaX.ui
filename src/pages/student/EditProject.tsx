import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { projectsAPI } from '@/services/projects';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

const categories = [
  'EDUCATION',
  'TECHNOLOGY',
  'HEALTH',
  'ENVIRONMENT',
  'SOCIAL',
  'ARTS',
  'OTHER',
];

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: '',
    imageUrl: '',
    bannerImage: '',
    screenshots: [] as string[],
    repoUrl: '',
    demoUrl: '',
    websiteUrl: '',
  });
  const [initialData, setInitialData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: '',
    imageUrl: '',
    bannerImage: '',
    screenshots: [] as string[],
    repoUrl: '',
    demoUrl: '',
    websiteUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getChangedFields = useMemo(() => {
    const changed: Record<string, any> = {};
    const numericChanged = (a: string, b: string) => {
      const pa = parseFloat(a);
      const pb = parseFloat(b);
      if (Number.isNaN(pa) && Number.isNaN(pb)) return false;
      return pa !== pb;
    };
    if (formData.title !== initialData.title) changed.title = formData.title;
    if (formData.description !== initialData.description) changed.description = formData.description;
    if (numericChanged(formData.goalAmount, initialData.goalAmount)) changed.goalAmount = formData.goalAmount;
    if (formData.category !== initialData.category) changed.category = formData.category;
    if (formData.imageUrl !== initialData.imageUrl) changed.imageUrl = formData.imageUrl;
    if (formData.bannerImage !== initialData.bannerImage) changed.bannerImage = formData.bannerImage;
    if (JSON.stringify(formData.screenshots) !== JSON.stringify(initialData.screenshots)) changed.screenshots = formData.screenshots;
    if (formData.repoUrl !== initialData.repoUrl) changed.repoUrl = formData.repoUrl;
    if (formData.demoUrl !== initialData.demoUrl) changed.demoUrl = formData.demoUrl;
    if (formData.websiteUrl !== initialData.websiteUrl) changed.websiteUrl = formData.websiteUrl;
    return changed;
  }, [formData, initialData]);

  const canSubmit = useMemo(() => {
    // Allow save if at least one field changed and no validation errors
    return Object.keys(getChangedFields).length > 0 && Object.keys(errors).length === 0;
  }, [getChangedFields, errors]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const project = await projectsAPI.getProject(id);
        // Basic ownership check if available
        const creatorId = (project as any)?.creatorId ?? (project as any)?.creator?.id;
        if (creatorId && user?.id && creatorId !== user.id) {
          toast.error('You can only edit your own projects');
          navigate(`/projects/${id}`);
          return;
        }

        const next = {
          title: (project as any).title || '',
          description: (project as any).description || '',
          goalAmount: String((project as any).goalAmount ?? ''),
          category: (project as any).category || '',
          imageUrl: (project as any).imageUrl || '',
          bannerImage: (project as any).bannerImage || (project as any).banner_image || '',
          screenshots: (project as any).screenshots || [],
          repoUrl: (project as any).repo_url || (project as any).repoUrl || '',
          demoUrl: (project as any).demo_url || (project as any).demoUrl || '',
          websiteUrl: (project as any).website_url || (project as any).websiteUrl || '',
        };
        setFormData(next);
        setInitialData(next);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, navigate, user?.id]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const changed = getChangedFields;
    if (changed.title !== undefined && formData.title.trim().length < 3) next.title = 'Title must be at least 3 characters';
    if (changed.description !== undefined && formData.description.trim().length < 10) next.description = 'Description must be at least 10 characters';
    if (changed.category !== undefined && !formData.category) next.category = 'Category is required';
    if (changed.goalAmount !== undefined) {
      const amount = parseFloat(formData.goalAmount);
      if (Number.isNaN(amount) || amount <= 0) next.goalAmount = 'Goal amount must be a positive number';
    }
    if (formData.repoUrl && formData.repoUrl.trim()) {
      try { new URL(formData.repoUrl.trim()); } catch { next.repoUrl = 'GitHub URL must be a valid URL'; }
    }
    if (formData.demoUrl && formData.demoUrl.trim()) {
      try { new URL(formData.demoUrl.trim()); } catch { next.demoUrl = 'Demo URL must be a valid URL'; }
    }
    if (formData.websiteUrl && formData.websiteUrl.trim()) {
      try { new URL(formData.websiteUrl.trim()); } catch { next.websiteUrl = 'Website URL must be a valid URL'; }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const uploadSingleImage = async (setter: (url: string) => void, file?: File | null) => {
    if (!file) return;
    try {
      const res = await apiService.uploadImage(file);
      setter(res.data.imageUrl);
      toast.success('Image uploaded');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    }
  };

  const onChangeMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await uploadSingleImage((url) => handleInputChange('imageUrl', url), file || null);
    e.currentTarget.value = '';
  };

  const onChangeBannerImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await uploadSingleImage((url) => handleInputChange('bannerImage', url), file || null);
    e.currentTarget.value = '';
  };

  const onAddScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formData.screenshots.length >= 5) {
      toast.error('Maximum 5 screenshots allowed');
      e.currentTarget.value = '';
      return;
    }
    try {
      const res = await apiService.uploadImage(file);
      setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, res.data.imageUrl] }));
      toast.success('Screenshot uploaded');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      e.currentTarget.value = '';
    }
  };

  const removeScreenshot = (idx: number) => {
    setFormData(prev => ({ ...prev, screenshots: prev.screenshots.filter((_, i) => i !== idx) }));
  };

  const onSubmit = async () => {
    if (!id) return;
    if (!validate()) return;
    try {
      setIsSaving(true);
      // Build partial payload only with changed fields
      const changed = getChangedFields;
      const payload: Record<string, any> = {};
      if (changed.title !== undefined) payload.title = formData.title.trim();
      if (changed.description !== undefined) payload.description = formData.description.trim();
      if (changed.goalAmount !== undefined) payload.goalAmount = parseFloat(formData.goalAmount);
      if (changed.category !== undefined) payload.category = formData.category;
      if (changed.imageUrl !== undefined) payload.imageUrl = formData.imageUrl || undefined;
      if (changed.bannerImage !== undefined) payload.bannerImage = formData.bannerImage || undefined;
      if (changed.screenshots !== undefined) payload.screenshots = formData.screenshots;
      if (changed.repoUrl !== undefined) {
        payload.repoUrl = formData.repoUrl || undefined;
        payload.repo_url = formData.repoUrl || undefined;
      }
      if (changed.demoUrl !== undefined) {
        payload.demoUrl = formData.demoUrl || undefined;
        payload.demo_url = formData.demoUrl || undefined;
      }
      if (changed.websiteUrl !== undefined) {
        payload.websiteUrl = formData.websiteUrl || undefined;
        payload.website_url = formData.websiteUrl || undefined;
      }
      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        setIsSaving(false);
        return;
      }
      await projectsAPI.updateProject(id, payload);
      toast.success('Project updated successfully');
      navigate(`/projects/${id}`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Project</CardTitle>
            <CardDescription>Update your project details and media</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">Loading project…</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder="Enter project title"
                    />
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e => handleInputChange('description', e.target.value)}
                      placeholder="Describe your project"
                      className="min-h-[160px]"
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goal">Funding Goal</Label>
                      <Input
                        id="goal"
                        type="number"
                        step="0.01"
                        value={formData.goalAmount}
                        onChange={e => handleInputChange('goalAmount', e.target.value)}
                        placeholder="e.g. 5000"
                      />
                      {errors.goalAmount && <p className="text-sm text-red-500 mt-1">{errors.goalAmount}</p>}
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={formData.category} onValueChange={v => handleInputChange('category', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="repoUrl">GitHub Repository URL</Label>
                      <Input
                        id="repoUrl"
                        value={formData.repoUrl}
                        onChange={e => handleInputChange('repoUrl', e.target.value)}
                        placeholder="https://github.com/username/repo"
                      />
                      {errors.repoUrl && <p className="text-sm text-red-500 mt-1">{errors.repoUrl}</p>}
                    </div>
                    <div>
                      <Label htmlFor="demoUrl">Live Demo URL</Label>
                      <Input
                        id="demoUrl"
                        value={formData.demoUrl}
                        onChange={e => handleInputChange('demoUrl', e.target.value)}
                        placeholder="https://example.com/demo"
                      />
                      {errors.demoUrl && <p className="text-sm text-red-500 mt-1">{errors.demoUrl}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="websiteUrl">Project Website URL</Label>
                      <Input
                        id="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={e => handleInputChange('websiteUrl', e.target.value)}
                        placeholder="https://project-website.com"
                      />
                      {errors.websiteUrl && <p className="text-sm text-red-500 mt-1">{errors.websiteUrl}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button disabled={!canSubmit || isSaving} onClick={onSubmit} className="gap-2">
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving…' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>Cancel</Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Main Image</Label>
                    {formData.imageUrl ? (
                      <motion.div layout className="relative">
                        <img src={formData.imageUrl} alt="Main" className="w-full rounded-md border" />
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => handleInputChange('imageUrl', '')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <label className="flex items-center justify-center h-36 border rounded-md cursor-pointer gap-2">
                        <ImageIcon className="h-5 w-5" />
                        <span>Upload Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onChangeMainImage} />
                      </label>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    {formData.bannerImage ? (
                      <motion.div layout className="relative">
                        <img src={formData.bannerImage} alt="Banner" className="w-full rounded-md border" />
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => handleInputChange('bannerImage', '')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <label className="flex items-center justify-center h-36 border rounded-md cursor-pointer gap-2">
                        <ImageIcon className="h-5 w-5" />
                        <span>Upload Banner</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onChangeBannerImage} />
                      </label>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Screenshots (max 5)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {formData.screenshots.map((src, idx) => (
                        <div key={src + idx} className="relative">
                          <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full rounded-md border" />
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2"
                            onClick={() => removeScreenshot(idx)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {formData.screenshots.length < 5 && (
                        <label className="flex items-center justify-center h-28 border rounded-md cursor-pointer gap-2">
                          <ImageIcon className="h-4 w-4" />
                          <span>Add Screenshot</span>
                          <input type="file" accept="image/*" className="hidden" onChange={onAddScreenshot} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditProject;


