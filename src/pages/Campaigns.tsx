import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Target, 
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Heart,
  Share2,
  Award,
  Gift,
  UserPlus,
  DollarSign,
  Eye,
  Lock,
  Zap,
  Trophy,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Campaign } from '@/services/campaigns';
import { campaignsAPI } from '@/services/campaigns';
import { useAuth } from '@/hooks/useAuth';

interface CampaignParticipationForm {
  motivation: string;
  experience: string;
  portfolio?: string;
  additionalInfo?: string;
}

const Campaigns = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [participationForm, setParticipationForm] = useState<CampaignParticipationForm>({
    motivation: '',
    experience: '',
    portfolio: '',
    additionalInfo: ''
  });
  const [isSubmittingParticipation, setIsSubmittingParticipation] = useState(false);
  const [likedCampaigns, setLikedCampaigns] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignsAPI.getCampaigns({
          search: searchQuery,
          status: status === 'all' ? undefined : status
        });
        
        // Handle API response - it returns an object with campaigns array
        const campaignsData = Array.isArray(response) ? response : (response as { campaigns: Campaign[] })?.campaigns || [];
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [searchQuery, status]);

  const filteredCampaigns = Array.isArray(campaigns) ? campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = status === 'all' || campaign.status === status;
    const matchesTab = activeTab === 'all' || campaign.status === activeTab;
    
    // Additional client-side filtering for expired campaigns
    const isExpired = new Date(campaign.endDate) < new Date();
    const matchesExpiredFilter = activeTab !== 'expired' || isExpired;
    const excludesExpired = activeTab !== 'expired' && !isExpired;
    
    return matchesSearch && matchesStatus && matchesTab && matchesExpiredFilter && excludesExpired;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-accent/20 text-accent border-accent/30">Active</Badge>;
      case 'completed':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Completed</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getCampaignTypeIcon = (campaignType: string) => {
    switch (campaignType) {
      case 'custom':
        return <Award className="h-4 w-4 text-purple-600" />;
      case 'mini':
        return <Zap className="h-4 w-4 text-orange-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getCampaignTypeBadge = (campaignType: string) => {
    switch (campaignType) {
      case 'custom':
        return <Badge variant="outline" className="text-purple-400 border-purple-400/30 bg-purple-500/10">Custom Campaign</Badge>;
      case 'mini':
        return <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-500/10">Mini Campaign</Badge>;
      default:
        return <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">Campaign</Badge>;
    }
  };

  const handleParticipationSubmit = async () => {
    if (!selectedCampaign || !user) return;
    
    setIsSubmittingParticipation(true);
    try {
      await campaignsAPI.participateInCampaign({
        campaignId: selectedCampaign.id,
        motivation: participationForm.motivation,
        experience: participationForm.experience,
        portfolio: participationForm.portfolio,
        additionalInfo: participationForm.additionalInfo,
      });
      
      // Reset form
      setParticipationForm({
        motivation: '',
        experience: '',
        portfolio: '',
        additionalInfo: ''
      });
      setSelectedCampaign(null);
      
      // Show success message
      alert('Participation submitted successfully!');
    } catch (error: any) {
      console.error('Failed to submit participation:', error);
      
      // Handle verification errors
      if (error.message?.includes('verification') || error.message?.includes('Verification')) {
        alert('Student verification required. Please complete your student verification to participate in campaigns.');
      } else {
        alert('Failed to submit participation. Please try again.');
      }
    } finally {
      setIsSubmittingParticipation(false);
    }
  };

  const handleLike = async (campaignId: number) => {
    if (!isAuthenticated) {
      alert('Please login to like campaigns');
      return;
    }

    try {
      const response = await campaignsAPI.toggleLike(campaignId);
      
      // Update the liked campaigns set
      setLikedCampaigns(prev => {
        const newSet = new Set(prev);
        if (response.liked) {
          newSet.add(campaignId);
        } else {
          newSet.delete(campaignId);
        }
        return newSet;
      });

      // Update the campaigns list with new likes count
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, likesCount: response.likesCount }
          : campaign
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('Failed to update like status. Please try again.');
    }
  };

  const handleShare = (campaign: Campaign) => {
    const url = `${window.location.origin}/campaigns/${campaign.id}`;
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
  };

  const canParticipate = (campaign: Campaign) => {
    return isAuthenticated && 
           user?.role === 'STUDENT' && 
           user?.studentProfile?.verificationStatus === 'APPROVED' &&
           campaign.status === 'active' &&
           campaign.fundingTrail;
  };

  const needsVerification = () => {
    return isAuthenticated && 
           user?.role === 'STUDENT' && 
           user?.studentProfile?.verificationStatus !== 'APPROVED';
  };

  const canFund = (campaign: Campaign) => {
    return campaign.status === 'active' && campaign.fundingTrail;
  };

  const canViewDetails = (campaign: Campaign) => {
    return isAuthenticated || campaign.status === 'active';
  };

  const getActionButtons = (campaign: Campaign) => {
    const buttons = [];

    // Participate button for verified students
    if (canParticipate(campaign)) {
      buttons.push(
        <Dialog key="participate">
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/90 text-white shadow-glow"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Participate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Participate in {campaign.title}
              </DialogTitle>
              <DialogDescription>
                Join this campaign and showcase your skills to win amazing prizes!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Campaign Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getCampaignTypeIcon(campaign.campaignType)}
                    <span className="text-sm capitalize">{campaign.campaignType}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prize Pool</Label>
                  <div className="text-sm font-semibold text-green-600 mt-1">
                    {campaign.campaignType === 'custom' 
                      ? `${campaign.rewardPool} XLM` 
                      : `${campaign.prizePool} XLM`
                    }
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="motivation">Why do you want to participate? *</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Tell us what motivates you to join this campaign..."
                    value={participationForm.motivation}
                    onChange={(e) => setParticipationForm(prev => ({ ...prev, motivation: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="experience">Relevant Experience *</Label>
                  <Textarea
                    id="experience"
                    placeholder="Describe your relevant experience and skills..."
                    value={participationForm.experience}
                    onChange={(e) => setParticipationForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="portfolio">Portfolio/Links (Optional)</Label>
                  <Input
                    id="portfolio"
                    placeholder="GitHub, Behance, or other relevant links..."
                    value={participationForm.portfolio}
                    onChange={(e) => setParticipationForm(prev => ({ ...prev, portfolio: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any additional information you'd like to share..."
                    value={participationForm.additionalInfo}
                    onChange={(e) => setParticipationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCampaign(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleParticipationSubmit}
                  disabled={!participationForm.motivation || !participationForm.experience || isSubmittingParticipation}
                  className="bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/90 text-white shadow-glow"
                >
                  {isSubmittingParticipation ? 'Submitting...' : 'Submit Participation'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    // Verification required button for non-verified students
    if (needsVerification() && campaign.status === 'active' && campaign.fundingTrail) {
      buttons.push(
        <Dialog key="verification-required">
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Shield className="mr-2 h-4 w-4" />
              Complete Verification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Student Verification Required
              </DialogTitle>
              <DialogDescription>
                Complete your student verification to participate in campaigns and access student features.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800">Verification Status</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      {user?.studentProfile?.verificationStatus === 'PENDING' 
                        ? 'Your student verification is pending review. Please wait for admin approval.'
                        : user?.studentProfile?.verificationStatus === 'REJECTED'
                        ? 'Your student verification was rejected. Please update your information and resubmit.'
                        : 'Please complete your student registration to participate in campaigns.'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">What you can do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• View campaign details</li>
                  <li>• Fund campaigns</li>
                  <li>• Complete student verification</li>
                </ul>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCampaign(null)}
                >
                  Close
                </Button>
                <Link to="/student/profile">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Complete Verification
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    // Fund button for all users (if campaign allows funding)
    if (canFund(campaign)) {
      buttons.push(
        <Button 
          key="fund"
          variant="outline" 
          size="sm" 
          className="flex-1 bg-card border-border hover:bg-secondary hover:border-primary/30 text-foreground"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Fund Campaign
        </Button>
      );
    }


    return buttons;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-background to-card py-8 sm:py-12 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                Funding <span className="text-primary">Campaigns</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Discover and participate in exciting campaigns. Students can compete for prizes, while supporters can fund innovative projects.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 sm:py-8 bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Campaign Tabs */}
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="active">Active Campaigns</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All Campaigns</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6">
                {isLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-20 bg-gray-200 rounded mb-4"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredCampaigns.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                      <p className="text-muted-foreground mb-4">
                        No campaigns match your current filters.
                      </p>
                      <Button variant="outline" onClick={() => {
                        setSearchQuery('');
                        setStatus('all');
                        setActiveTab('all');
                      }}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredCampaigns.map((campaign, index) => {
                      const daysLeft = getDaysLeft(campaign.endDate);
                      
                      return (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant hover:bg-card transition-all duration-300 hover:border-primary/20">
                            {/* Campaign Header */}
                            <CardHeader className="space-y-3 pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    {getStatusBadge(campaign.status)}
                                    {getCampaignTypeBadge(campaign.campaignType)}
                                    {campaign.status === 'active' && (
                                      <Badge variant="outline" className="text-xs bg-card border-border text-muted-foreground">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {daysLeft} days left
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                    {campaign.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {campaign.description}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              {/* Prize Pool Section */}
                              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-lg">
                                    <Trophy className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                      {campaign.campaignType === 'custom' ? 'Custom Campaign' : 'Prize Pool'}
                                    </div>
                                    <div className="text-lg font-bold text-primary">
                                      {campaign.campaignType === 'custom' 
                                        ? `${campaign.rewardPool || 0} XLM` 
                                        : `${campaign.prizePool || 0} XLM`
                                      }
                                    </div>
                                </div>
                                </div>
                              </div>

                              {/* Tags */}
                              {campaign.tags && campaign.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {campaign.tags.slice(0, 3).map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs bg-secondary/50 text-secondary-foreground border-secondary">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {campaign.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs bg-secondary/50 text-secondary-foreground border-secondary">
                                      +{campaign.tags.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Like, Share, View Details Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {/* Like Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLike(campaign.id)}
                                    className="h-8 px-2 hover:bg-accent/10"
                                  >
                                    <Heart className={`h-4 w-4 ${likedCampaigns.has(campaign.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      {campaign.likesCount || 0}
                                    </span>
                                  </Button>

                                  {/* Share Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare(campaign)}
                                    className="h-8 px-2 hover:bg-accent/10"
                                  >
                                    <Share2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>

                                {/* View Details Button */}
                                {canViewDetails(campaign) ? (
                                  <Link to={`/campaigns/${campaign.id}`}>
                                    <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                                      <Eye className="mr-1 h-3 w-3" />
                                      View Details
                                    </Button>
                                  </Link>
                                ) : (
                                  <Link to="/login">
                                    <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                                      <Lock className="mr-1 h-3 w-3" />
                                      Login to View
                                    </Button>
                                  </Link>
                                )}
                              </div>

                              {/* Timeline */}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </CardContent>

                            <CardContent className="pt-0">
                              <div className="flex gap-2">
                                {getActionButtons(campaign)}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
                Join the Movement
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {isAuthenticated ? (
                  user?.role === 'STUDENT' ? (
                    user?.studentProfile?.verificationStatus === 'APPROVED' ? (
                      "Participate in campaigns to showcase your skills and win amazing prizes!"
                    ) : (
                      "Complete your student verification to participate in campaigns and access student features."
                    )
                  ) : (
                    "Support student innovation by funding campaigns and helping talented students bring their ideas to life."
                  )
                ) : (
                  "Support student innovation by participating in funding campaigns. Help talented students bring their ideas to life and make a real impact."
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login">
                      <Button size="lg" className="shadow-glow">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="lg" variant="outline">
                        Create Account
                      </Button>
                    </Link>
                  </>
                ) : user?.role === 'STUDENT' ? (
                  user?.studentProfile?.verificationStatus === 'APPROVED' ? (
                <Link to="/projects">
                  <Button size="lg" className="shadow-glow">
                    <Target className="mr-2 h-5 w-5" />
                    Browse Projects
                  </Button>
                </Link>
                  ) : (
                    <Link to="/student/profile">
                      <Button size="lg" className="shadow-glow bg-orange-600 hover:bg-orange-700">
                        <Shield className="mr-2 h-5 w-5" />
                        Complete Verification
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link to="/projects">
                    <Button size="lg" className="shadow-glow">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Fund Projects
                  </Button>
                </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Campaigns;