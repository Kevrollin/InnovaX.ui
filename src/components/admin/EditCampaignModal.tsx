import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar,
  Trophy,
  Gift
} from 'lucide-react';
import { Campaign, UpdateCampaignRequest } from '@/services/campaigns';
import { toast } from '@/hooks/use-toast';

interface EditCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaignId: number, data: UpdateCampaignRequest) => Promise<void>;
}

const EditCampaignModal = ({ campaign, isOpen, onClose, onSave }: EditCampaignModalProps) => {
  const [formData, setFormData] = useState<UpdateCampaignRequest>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when campaign changes
  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        description: campaign.description,
        tags: campaign.tags,
        campaignType: campaign.campaignType,
        startDate: campaign.startDate.split('T')[0], // Convert to YYYY-MM-DD format
        endDate: campaign.endDate.split('T')[0],
        heroImageUrl: campaign.heroImageUrl,
        fundingTrail: campaign.fundingTrail,
        status: campaign.status,
        // Submission-related fields
        submissionStartDate: campaign.submissionStartDate ? campaign.submissionStartDate.split('T')[0] : '',
        submissionEndDate: campaign.submissionEndDate ? campaign.submissionEndDate.split('T')[0] : '',
        resultsAnnouncementDate: campaign.resultsAnnouncementDate ? campaign.resultsAnnouncementDate.split('T')[0] : '',
        awardDistributionDate: campaign.awardDistributionDate ? campaign.awardDistributionDate.split('T')[0] : '',
        // Custom Campaign Fields
        rewardPool: campaign.rewardPool,
        prizeFirstPosition: campaign.prizeFirstPosition,
        prizeSecondPosition: campaign.prizeSecondPosition,
        prizeThirdPosition: campaign.prizeThirdPosition,
        // Mini Campaign Fields
        prizePool: campaign.prizePool,
        prizesBreakdown: campaign.prizesBreakdown,
      });
    }
  }, [campaign]);

  const handleSave = async () => {
    if (!campaign) return;

    try {
      setIsSaving(true);
      
      // Basic validation
      if (!formData.title || !formData.description || !formData.tags?.length || !formData.startDate || !formData.endDate || !formData.heroImageUrl) {
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

      if (new Date(formData.startDate!) >= new Date(formData.endDate!)) {
        toast({
          title: "Validation Error",
          description: "End date must be after start date.",
          variant: "destructive",
        });
        return;
      }

      await onSave(campaign.id, formData);
      
      toast({
        title: "Success",
        description: "Campaign updated successfully!",
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to update campaign:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Campaign: {campaign.title}</DialogTitle>
          <DialogDescription>
            Update the campaign details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Campaign Type Selection */}
          <div>
            <label className="text-sm font-medium">Campaign Type *</label>
            <Select 
              value={formData.campaignType || ''} 
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
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags *</label>
              <Input
                placeholder="tech, innovation, startup"
                value={formData.tags?.join(', ') || ''}
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
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Hero Image URL *</label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={formData.heroImageUrl || ''}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status *</label>
            <Select 
              value={formData.status || ''} 
              onValueChange={(value: 'draft' | 'active' | 'completed' | 'cancelled') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date *</label>
                <Input
                  type="date"
                  value={formData.endDate || ''}
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCampaignModal;
