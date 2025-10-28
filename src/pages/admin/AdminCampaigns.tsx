import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Tag,
  Image,
  Trophy,
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { campaignsAPI, Campaign, CreateCampaignRequest, UpdateCampaignRequest } from '@/services/campaigns';
import { toast } from '@/hooks/use-toast';
import EditCampaignModal from '@/components/admin/EditCampaignModal';
import CampaignDetailsModal from '@/components/admin/CampaignDetailsModal';

const AdminCampaigns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Details modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCampaignForDetails, setSelectedCampaignForDetails] = useState<Campaign | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    title: '',
    description: '',
    tags: [],
    campaignType: 'custom',
    startDate: '',
    endDate: '',
    heroImageUrl: '',
    fundingTrail: true,
    // Submission-related fields
    submissionStartDate: '',
    submissionEndDate: '',
    resultsAnnouncementDate: '',
    awardDistributionDate: '',
    rewardPool: 0,
    prizeFirstPosition: { prize: '', gifts: '' },
    prizeSecondPosition: { prize: '', gifts: '' },
    prizeThirdPosition: { prize: '', gifts: '' },
    prizePool: 0,
    prizesBreakdown: { first: '', second: '', third: '' },
  });

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await campaignsAPI.getCampaigns({
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [searchTerm, filterStatus]);

  // Handle form submission
  const handleCreateCampaign = async () => {
    try {
      setIsCreating(true);
      
      // Basic validation
      if (!formData.title || !formData.description || !formData.tags.length || !formData.startDate || !formData.endDate || !formData.heroImageUrl) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Campaign type specific validation
      if (formData.campaignType === 'custom') {
        if (!formData.rewardPool || formData.rewardPool <= 0) {
          toast({
            title: "Validation Error",
            description: "Reward pool is required for custom campaigns.",
            variant: "destructive",
          });
          return;
        }
        if (!formData.prizeFirstPosition?.prize || !formData.prizeFirstPosition?.gifts) {
          toast({
            title: "Validation Error",
            description: "First position prize and gifts are required for custom campaigns.",
            variant: "destructive",
          });
          return;
        }
      } else if (formData.campaignType === 'mini') {
        if (!formData.prizePool || formData.prizePool <= 0) {
          toast({
            title: "Validation Error",
            description: "Prize pool is required for mini campaigns.",
            variant: "destructive",
          });
          return;
        }
        if (!formData.prizesBreakdown?.first || !formData.prizesBreakdown?.second || !formData.prizesBreakdown?.third) {
          toast({
            title: "Validation Error",
            description: "All prize breakdown fields are required for mini campaigns.",
            variant: "destructive",
          });
          return;
        }
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        toast({
          title: "Validation Error",
          description: "End date must be after start date.",
          variant: "destructive",
        });
        return;
      }

      await campaignsAPI.createCampaign(formData);
      
      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });
      
      setIsCreateOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: [],
      campaignType: 'custom',
      startDate: '',
      endDate: '',
      heroImageUrl: '',
      fundingTrail: true,
      // Submission-related fields
      submissionStartDate: '',
      submissionEndDate: '',
      resultsAnnouncementDate: '',
      awardDistributionDate: '',
      rewardPool: 0,
      prizeFirstPosition: { prize: '', gifts: '' },
      prizeSecondPosition: { prize: '', gifts: '' },
      prizeThirdPosition: { prize: '', gifts: '' },
      prizePool: 0,
      prizesBreakdown: { first: '', second: '', third: '' },
    });
  };

  // Handle campaign actions
  const handleCampaignAction = async (campaignId: number, action: 'update' | 'delete', data?: any) => {
    try {
      setActionLoading(campaignId);
      
      if (action === 'delete') {
        await campaignsAPI.deleteCampaign(campaignId.toString());
        toast({
          title: "Success",
          description: "Campaign deleted successfully!",
        });
      } else if (action === 'update') {
        await campaignsAPI.updateCampaign(campaignId.toString(), data);
        toast({
          title: "Success",
          description: "Campaign updated successfully!",
        });
      }
      
      fetchCampaigns();
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} campaign. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit campaign
  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditOpen(true);
  };

  // Handle save edited campaign
  const handleSaveEditedCampaign = async (campaignId: number, data: UpdateCampaignRequest) => {
    await campaignsAPI.updateCampaign(campaignId.toString(), data);
    fetchCampaigns();
  };

  // Handle view campaign details
  const handleViewCampaignDetails = (campaign: Campaign) => {
    setSelectedCampaignForDetails(campaign);
    setIsDetailsOpen(true);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-600">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.campaignType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status counts
  const getStatusCounts = () => {
    return {
      all: campaigns.length,
      active: campaigns.filter(c => c.status === 'active').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      cancelled: campaigns.filter(c => c.status === 'cancelled').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Campaign Management</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage Custom and Mini fundraising campaigns
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Campaign</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                  <DialogDescription>
                    Choose between Custom or Mini campaign type and fill in the required details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Campaign Type Selection */}
                  <div>
                    <label className="text-sm font-medium">Campaign Type *</label>
                    <Select 
                      value={formData.campaignType} 
                      onValueChange={(value: 'custom' | 'mini') => setFormData({ ...formData, campaignType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Campaign</SelectItem>
                        <SelectItem value="mini">Mini Campaign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        placeholder="Campaign title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tags *</label>
                      <Input
                        placeholder="tech, innovation, startup"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none"
                      placeholder="Campaign description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Hero Image URL *</label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.heroImageUrl}
                      onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    />
                  </div>

                  {/* Custom Campaign Fields */}
                  {formData.campaignType === 'custom' && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Custom Campaign Details
                      </h3>
                      
                      <div>
                        <label className="text-sm font-medium">Reward Pool (XLM) *</label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={formData.rewardPool || ''}
                          onChange={(e) => setFormData({ ...formData, rewardPool: Number(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Prize Positions</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">First Position Prize *</label>
                            <Input
                              placeholder="e.g., $1000 cash prize"
                              value={formData.prizeFirstPosition?.prize || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizeFirstPosition: { 
                                  ...formData.prizeFirstPosition, 
                                  prize: e.target.value 
                                } 
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">First Position Gifts *</label>
                            <Input
                              placeholder="e.g., Trophy, Certificate, Mentorship"
                              value={formData.prizeFirstPosition?.gifts || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizeFirstPosition: { 
                                  ...formData.prizeFirstPosition, 
                                  gifts: e.target.value 
                                } 
                              })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Second Position Prize</label>
                            <Input
                              placeholder="e.g., $500 cash prize"
                              value={formData.prizeSecondPosition?.prize || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizeSecondPosition: { 
                                  ...formData.prizeSecondPosition, 
                                  prize: e.target.value 
                                } 
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Second Position Gifts</label>
                            <Input
                              placeholder="e.g., Certificate, Mentorship"
                              value={formData.prizeSecondPosition?.gifts || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizeSecondPosition: { 
                                  ...formData.prizeSecondPosition, 
                                  gifts: e.target.value 
                                } 
                              })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Third Position Prize</label>
                            <Input
                              placeholder="e.g., $250 cash prize"
                              value={formData.prizeThirdPosition?.prize || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizeThirdPosition: { 
                                  ...formData.prizeThirdPosition, 
                                  prize: e.target.value 
                                } 
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Third Position Gifts</label>
                            <Input
                              placeholder="e.g., Certificate"
                              value={formData.prizeThirdPosition?.gifts || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizeThirdPosition: { 
                                  ...formData.prizeThirdPosition, 
                                  gifts: e.target.value 
                                } 
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mini Campaign Fields */}
                  {formData.campaignType === 'mini' && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        Mini Campaign Details
                      </h3>
                      
                      <div>
                        <label className="text-sm font-medium">Prize Pool (XLM) *</label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={formData.prizePool || ''}
                          onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Prizes Breakdown *</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">First Place</label>
                            <Input
                              placeholder="e.g., $200 cash"
                              value={formData.prizesBreakdown?.first || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizesBreakdown: { 
                                  ...formData.prizesBreakdown, 
                                  first: e.target.value 
                                } 
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Second Place</label>
                            <Input
                              placeholder="e.g., $150 cash"
                              value={formData.prizesBreakdown?.second || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizesBreakdown: { 
                                  ...formData.prizesBreakdown, 
                                  second: e.target.value 
                                } 
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Third Place</label>
                            <Input
                              placeholder="e.g., $100 cash"
                              value={formData.prizesBreakdown?.third || ''}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                prizesBreakdown: { 
                                  ...formData.prizesBreakdown, 
                                  third: e.target.value 
                                } 
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Common Fields */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fundingTrail"
                        checked={formData.fundingTrail || false}
                        onChange={(e) => setFormData({ ...formData, fundingTrail: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="fundingTrail" className="text-sm font-medium">
                        Enable Funding Trail (Allow donors/users to fund the campaign)
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Start Date *</label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Date *</label>
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission Timeline */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Submission Timeline
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Submission Start Date</label>
                        <Input
                          type="date"
                          value={formData.submissionStartDate || ''}
                          onChange={(e) => setFormData({ ...formData, submissionStartDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Submission End Date</label>
                        <Input
                          type="date"
                          value={formData.submissionEndDate || ''}
                          onChange={(e) => setFormData({ ...formData, submissionEndDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Results Announcement Date</label>
                        <Input
                          type="date"
                          value={formData.resultsAnnouncementDate || ''}
                          onChange={(e) => setFormData({ ...formData, resultsAnnouncementDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Award Distribution Date</label>
                        <Input
                          type="date"
                          value={formData.awardDistributionDate || ''}
                          onChange={(e) => setFormData({ ...formData, awardDistributionDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign} disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{statusCounts.all}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{statusCounts.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Draft</p>
                  <p className="text-2xl font-bold">{statusCounts.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{statusCounts.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold">{statusCounts.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:w-48">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="mini">Mini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={fetchCampaigns} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Campaigns Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
              <CardDescription>
                Manage all fundraising campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading campaigns...</p>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No campaigns found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{campaign.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {campaign.description}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {campaign.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {campaign.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{campaign.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={campaign.campaignType === 'custom' ? 'default' : 'secondary'}>
                              {campaign.campaignType === 'custom' ? 'Custom' : 'Mini'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(campaign.status)}
                              {getStatusBadge(campaign.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">
                                {campaign.creator?.fullName || campaign.creator?.username}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{campaign.creator?.username}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                to {new Date(campaign.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCampaignDetails(campaign)}
                                disabled={actionLoading === campaign.id}
                                title="View Campaign Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCampaign(campaign)}
                                disabled={actionLoading === campaign.id}
                                title="Edit Campaign"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCampaignAction(campaign.id, 'update', { status: 'active' })}
                                disabled={actionLoading === campaign.id || campaign.status === 'active'}
                                title="Activate Campaign"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCampaignAction(campaign.id, 'update', { status: 'cancelled' })}
                                disabled={actionLoading === campaign.id || campaign.status === 'cancelled'}
                                title="Cancel Campaign"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCampaignAction(campaign.id, 'delete')}
                                disabled={actionLoading === campaign.id}
                                title="Delete Campaign"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      {/* Edit Campaign Modal */}
      <EditCampaignModal
        campaign={selectedCampaign}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedCampaign(null);
        }}
        onSave={handleSaveEditedCampaign}
      />
      
      {/* Campaign Details Modal */}
      <CampaignDetailsModal
        campaign={selectedCampaignForDetails}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCampaignForDetails(null);
        }}
      />
    </div>
  );
};

export default AdminCampaigns;