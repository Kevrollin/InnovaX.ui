import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import SubmissionModal from '@/components/SubmissionModal';
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Award,
  Gift,
  UserPlus,
  DollarSign,
  Eye,
  Lock,
  Zap,
  Trophy,
  Shield,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Heart,
  ExternalLink,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  School,
  IdCard,
  Upload,
  FileText,
  CheckCircle2,
  Hourglass,
  Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CampaignWithSubmissions, CampaignParticipation, SubmissionStatus } from '@/types';
import { campaignsAPI } from '@/services/campaigns';
import { submissionsAPI } from '@/services/submissions';
import { useAuth } from '@/hooks/useAuth';
import VerificationStatus from '@/components/VerificationStatus';

interface CampaignParticipationForm {
  motivation: string;
  experience: string;
  portfolio?: string;
  additionalInfo?: string;
}

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState<CampaignWithSubmissions | null>(null);
  const [participationStatus, setParticipationStatus] = useState<CampaignParticipation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithSubmissions | null>(null);
  const [participationForm, setParticipationForm] = useState<CampaignParticipationForm>({
    motivation: '',
    experience: '',
    portfolio: '',
    additionalInfo: ''
  });
  const [isSubmittingParticipation, setIsSubmittingParticipation] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await campaignsAPI.getCampaign(id);
        setCampaign(response as unknown as CampaignWithSubmissions);
        
        // Fetch like status
        try {
          const likeStatus = await campaignsAPI.getLikeStatus(parseInt(id));
          setIsLiked(likeStatus.liked);
          setLikesCount(likeStatus.likesCount);
        } catch (likeError) {
          console.error('Failed to fetch like status:', likeError);
          // Set default values if like status fails
          setIsLiked(false);
          setLikesCount(response.likesCount || 0);
        }

        // Fetch participation status if user is authenticated
        if (isAuthenticated) {
          try {
            const participationResponse = await submissionsAPI.getParticipationStatus(parseInt(id));
            console.log('Participation response:', participationResponse);
            
            // Handle response structure
            if (participationResponse?.data?.participation) {
              setParticipationStatus(participationResponse.data.participation as unknown as CampaignParticipation);
            } else {
              // No participation found, set to null
              setParticipationStatus(null);
            }
          } catch (participationError) {
            console.error('Failed to fetch participation status:', participationError);
            // If it's a 404, user hasn't participated yet
            if (participationError.message?.includes('404') || participationError.message?.includes('not found')) {
              setParticipationStatus(null);
            } else {
              // For other errors, we'll assume no participation to be safe
              setParticipationStatus(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch campaign:', error);
        setError('Failed to load campaign details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [id, isAuthenticated]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>;
      case 'completed':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Completed</Badge>;
      case 'draft':
        return <Badge className="bg-secondary/10 text-secondary-foreground border-secondary/20">Draft</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCampaignTypeIcon = (campaignType: string) => {
    switch (campaignType) {
      case 'custom':
        return <Award className="h-5 w-5 text-primary" />;
      case 'mini':
        return <Zap className="h-5 w-5 text-accent" />;
      default:
        return <Target className="h-5 w-5 text-primary" />;
    }
  };

  const getCampaignTypeBadge = (campaignType: string) => {
    switch (campaignType) {
      case 'custom':
        return <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Custom Campaign</Badge>;
      case 'mini':
        return <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5">Mini Campaign</Badge>;
      default:
        return <Badge variant="outline">Campaign</Badge>;
    }
  };

  const getDaysLeft = (endDate: string) => {
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(end.getTime())) return 0;
    
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const canParticipate = () => {
    return isAuthenticated && 
           user?.role === 'STUDENT' && 
           user?.studentProfile?.verificationStatus === 'APPROVED' &&
           campaign?.status === 'active';
  };

  const needsVerification = () => {
    return isAuthenticated && 
           user?.role === 'STUDENT' && 
           user?.studentProfile?.verificationStatus !== 'APPROVED';
  };

  const canFund = () => {
    return campaign?.status === 'active' && campaign?.fundingTrail;
  };

  const canViewDetails = () => {
    return isAuthenticated || campaign?.status === 'active';
  };

  const handleParticipationSubmit = async () => {
    if (!campaign || !user) return;
    
    // Check if user has already participated
    if (participationStatus) {
      alert('You have already participated in this campaign.');
      return;
    }
    
    // Validate required fields
    if (!participationForm.motivation.trim() || !participationForm.experience.trim()) {
      alert('Please fill in all required fields (motivation and experience).');
      return;
    }
    
    setIsSubmittingParticipation(true);
    try {
      await campaignsAPI.participateInCampaign({
        campaignId: campaign.id,
        motivation: participationForm.motivation.trim(),
        experience: participationForm.experience.trim(),
        portfolio: participationForm.portfolio?.trim() || '',
        additionalInfo: participationForm.additionalInfo?.trim() || '',
      });
      
      // Reset form
      setParticipationForm({
        motivation: '',
        experience: '',
        portfolio: '',
        additionalInfo: ''
      });
      setSelectedCampaign(null);
      
      // Refresh participation status
      try {
        const participationResponse = await submissionsAPI.getParticipationStatus(campaign.id);
        if (participationResponse?.data?.participation) {
          setParticipationStatus(participationResponse.data.participation as unknown as CampaignParticipation);
        }
      } catch (refreshError) {
        console.error('Failed to refresh participation status:', refreshError);
      }
      
      // Show success message
      alert('Participation submitted successfully! You will be notified when your application is reviewed.');
    } catch (error: any) {
      console.error('Failed to submit participation:', error);
      
      // Handle specific error cases
      if (error.message?.includes('verification') || error.message?.includes('Verification')) {
        alert('Student verification required. Please complete your student verification to participate in campaigns.');
      } else if (error.message?.includes('already participated') || error.message?.includes('duplicate')) {
        alert('You have already participated in this campaign.');
        // Refresh participation status to get the current state
        try {
          const participationResponse = await submissionsAPI.getParticipationStatus(campaign.id);
          if (participationResponse?.data?.participation) {
            setParticipationStatus(participationResponse.data.participation as unknown as CampaignParticipation);
          }
        } catch (refreshError) {
          console.error('Failed to refresh participation status:', refreshError);
        }
      } else if (error.message?.includes('campaign not active')) {
        alert('This campaign is no longer accepting participants.');
      } else {
        alert('Failed to submit participation. Please try again.');
      }
    } finally {
      setIsSubmittingParticipation(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like campaigns');
      return;
    }

    if (!campaign) return;

    try {
      const response = await campaignsAPI.toggleLike(campaign.id);
      setIsLiked(response.liked);
      setLikesCount(response.likesCount);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('Failed to update like status. Please try again.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // TODO: Show toast notification
  };

  const handleDonate = () => {
    if (!isAuthenticated) {
      alert('Please login to make a donation');
      return;
    }
    // TODO: Navigate to donation flow
    alert('Redirecting to donation page...');
  };

  const handleProjectSubmission = async (submissionData: any) => {
    if (!campaign) return;
    
    setIsSubmittingProject(true);
    try {
      await submissionsAPI.submitProject(campaign.id, submissionData);
      
      // Refresh participation status
      const participationResponse = await submissionsAPI.getParticipationStatus(campaign.id);
      console.log('Participation response after submission:', participationResponse);
      
      // Handle response structure
      if (participationResponse?.data?.participation) {
        setParticipationStatus(participationResponse.data.participation as unknown as CampaignParticipation);
      }
      
      setShowSubmissionModal(false);
      alert('Project submitted successfully!');
    } catch (error: any) {
      console.error('Failed to submit project:', error);
      alert('Failed to submit project. Please try again.');
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const getSubmissionButtonState = () => {
    if (!campaign || !isAuthenticated || !user) return null;

    // Check if user is a verified student
    if (user.role !== 'STUDENT' || user.studentProfile?.verificationStatus !== 'APPROVED') {
      return null;
    }

    // Check if campaign allows submissions
    if (!campaign.fundingTrail || campaign.status !== 'active') {
      return null;
    }

    // Check submission period
    const now = new Date();
    if (campaign.submissionStartDate && now < new Date(campaign.submissionStartDate)) {
      return {
        text: 'Submission Period Not Started',
        disabled: true,
        icon: Timer,
        variant: 'outline' as const
      };
    }

    if (campaign.submissionEndDate && now > new Date(campaign.submissionEndDate)) {
      return {
        text: 'Submission Period Ended',
        disabled: true,
        icon: XCircle,
        variant: 'outline' as const
      };
    }

    // Check participation status
    if (!participationStatus) {
      return {
        text: 'Participate First',
        disabled: true,
        icon: UserPlus,
        variant: 'outline' as const
      };
    }

    if (participationStatus.status === 'pending') {
      return {
        text: 'Wait for Approval',
        disabled: true,
        icon: Hourglass,
        variant: 'outline' as const
      };
    }

    if (participationStatus.status === 'rejected') {
      return {
        text: 'Participation Rejected',
        disabled: true,
        icon: XCircle,
        variant: 'outline' as const
      };
    }

    if (participationStatus.status === 'approved') {
      switch (participationStatus.submissionStatus) {
        case 'not_submitted':
          return {
            text: 'Submit Your Project',
            disabled: false,
            icon: Upload,
            variant: 'default' as const,
            onClick: () => setShowSubmissionModal(true)
          };
        case 'submitted':
          return {
            text: 'Under Review',
            disabled: true,
            icon: Hourglass,
            variant: 'outline' as const
          };
        case 'under_review':
          return {
            text: 'Under Review',
            disabled: true,
            icon: Hourglass,
            variant: 'outline' as const
          };
        case 'graded':
          return {
            text: 'Graded - View Results',
            disabled: false,
            icon: CheckCircle2,
            variant: 'outline' as const,
            onClick: () => {
              // TODO: Navigate to results page
              alert('View your submission results');
            }
          };
        case 'winner':
          return {
            text: 'Winner! 🏆',
            disabled: false,
            icon: Trophy,
            variant: 'default' as const,
            onClick: () => {
              // TODO: Navigate to results page
              alert('Congratulations! You won!');
            }
          };
        case 'runner_up':
          return {
            text: 'Runner Up! 🥈',
            disabled: false,
            icon: Award,
            variant: 'default' as const,
            onClick: () => {
              // TODO: Navigate to results page
              alert('Congratulations! You are a runner up!');
            }
          };
        case 'not_selected':
          return {
            text: 'Not Selected',
            disabled: true,
            icon: XCircle,
            variant: 'outline' as const
          };
        default:
          return null;
      }
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaign details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'The campaign you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const daysLeft = getDaysLeft(campaign.end_date);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-background via-background to-card py-6 sm:py-8 lg:py-12 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Navigation and Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/campaigns')}
                  className="w-fit self-start"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Campaigns
                </Button>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {getStatusBadge(campaign.status)}
                  {getCampaignTypeBadge(campaign.campaignType)}
                  {campaign.status === 'active' && (
                    <Badge variant="outline" className="text-xs bg-card border-border text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {daysLeft} days left
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title and Description */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4 text-foreground leading-tight">
                {campaign.title}
              </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-4xl leading-relaxed">
                {campaign.description}
              </p>
              </div>

              {/* Hero Image */}
              <div className="relative rounded-xl overflow-hidden mb-6 sm:mb-8 shadow-elegant">
                <img 
                  src={campaign.heroImageUrl} 
                  alt={campaign.title}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      {getCampaignTypeIcon(campaign.campaignType)}
                      <span className="text-sm font-medium">
                        {campaign.campaignType === 'custom' ? 'Custom Campaign' : 'Mini Campaign'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={handleLike}
                      >
                        <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={handleShare}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-1">
                      {campaign.campaignType === 'custom' 
                        ? `${campaign.rewardPool || 0} XLM` 
                        : `${campaign.prizePool || 0} XLM`
                      }
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Prize Pool</div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-accent mb-1">
                      {campaign.fundingTrail ? 'Yes' : 'No'}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Funding Enabled</div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-1">
                      {daysLeft}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Days Left</div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-accent mb-1">
                      {campaign.tags?.length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Tags</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 sm:py-8 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-card border-border">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
                    <TabsTrigger value="prizes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Prizes</TabsTrigger>
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg sm:text-xl text-foreground">Campaign Overview</CardTitle>
                          <CardDescription className="text-sm sm:text-base">
                          Learn more about this campaign and what makes it special.
                        </CardDescription>
                      </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                        <div>
                            <h4 className="font-medium mb-2 text-foreground text-sm sm:text-base">Description</h4>
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{campaign.description}</p>
                        </div>
                        
                        {campaign.tags && campaign.tags.length > 0 && (
                          <div>
                              <h4 className="font-medium mb-2 text-foreground text-sm sm:text-base">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-secondary/50 text-secondary-foreground border-secondary text-xs sm:text-sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                            <h4 className="font-medium mb-2 text-foreground text-sm sm:text-base">Campaign Type</h4>
                          <div className="flex items-center gap-2">
                            {getCampaignTypeIcon(campaign.campaignType)}
                              <span className="capitalize text-foreground text-sm sm:text-base">{campaign.campaignType} Campaign</span>
                          </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2 text-foreground text-sm sm:text-base">Funding Trail</h4>
                          <div className="flex items-center gap-2">
                            {campaign.fundingTrail ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-accent" />
                                  <span className="text-accent text-sm sm:text-base">Enabled - Users can fund this campaign</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-destructive" />
                                  <span className="text-destructive text-sm sm:text-base">Disabled - No funding allowed</span>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="prizes" className="space-y-6">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl text-foreground">Prize Information</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          Details about prizes and rewards for this campaign.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6">
                        <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            <h4 className="font-medium text-foreground text-sm sm:text-base">Total Prize Pool</h4>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-primary">
                            {campaign.campaignType === 'custom' 
                              ? `${campaign.rewardPool || 0} XLM` 
                              : `${campaign.prizePool || 0} XLM`
                            }
                          </div>
                        </div>

                        {campaign.campaignType === 'custom' && (
                          <div className="space-y-3 sm:space-y-4">
                            <h4 className="font-medium text-foreground text-sm sm:text-base">Custom Campaign Prizes</h4>
                            
                            {campaign.prizeFirstPosition && (
                              <Card className="border-primary/20 bg-primary/5">
                                <CardContent className="p-3 sm:p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground text-sm sm:text-base">1st Place</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium text-foreground">Prize</Label>
                                      <p className="text-xs sm:text-sm text-muted-foreground">{campaign.prizeFirstPosition.prize}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium text-foreground">Gifts</Label>
                                      <p className="text-xs sm:text-sm text-muted-foreground">{campaign.prizeFirstPosition.gifts}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {campaign.prizeSecondPosition && (
                              <Card className="border-secondary/20 bg-secondary/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-secondary-foreground" />
                                    <span className="font-medium text-foreground">2nd Place</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-sm font-medium text-foreground">Prize</Label>
                                      <p className="text-sm text-muted-foreground">{campaign.prizeSecondPosition.prize}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-foreground">Gifts</Label>
                                      <p className="text-sm text-muted-foreground">{campaign.prizeSecondPosition.gifts}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {campaign.prizeThirdPosition && (
                              <Card className="border-accent/20 bg-accent/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Gift className="h-4 w-4 text-accent" />
                                    <span className="font-medium text-foreground">3rd Place</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-sm font-medium text-foreground">Prize</Label>
                                      <p className="text-sm text-muted-foreground">{campaign.prizeThirdPosition.prize}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-foreground">Gifts</Label>
                                      <p className="text-sm text-muted-foreground">{campaign.prizeThirdPosition.gifts}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}

                        {campaign.campaignType === 'mini' && campaign.prizesBreakdown && (
                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground">Mini Campaign Prizes</h4>
                            
                            <div className="grid gap-4">
                              <Card className="border-primary/20 bg-primary/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground">1st Place</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{campaign.prizesBreakdown.first}</p>
                                </CardContent>
                              </Card>

                              <Card className="border-secondary/20 bg-secondary/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-secondary-foreground" />
                                    <span className="font-medium text-foreground">2nd Place</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{campaign.prizesBreakdown.second}</p>
                                </CardContent>
                              </Card>

                              <Card className="border-accent/20 bg-accent/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Gift className="h-4 w-4 text-accent" />
                                    <span className="font-medium text-foreground">3rd Place</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{campaign.prizesBreakdown.third}</p>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-6">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl text-foreground">Campaign Timeline</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          Important dates and milestones for this campaign.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          <div>
                            <h4 className="font-medium text-foreground text-sm sm:text-base">Campaign Duration</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-accent rounded-full"></div>
                            <div>
                              <h4 className="font-medium text-foreground text-sm sm:text-base">Campaign Started</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {new Date(campaign.start_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${campaign.status === 'active' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                            <div>
                              <h4 className="font-medium text-foreground text-sm sm:text-base">Campaign Ends</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {new Date(campaign.end_date).toLocaleDateString()}
                                {campaign.status === 'active' && (
                                  <span className="ml-2 text-primary text-xs sm:text-sm">({daysLeft} days left)</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Registration Period */}
                          {campaign.registrationStartDate && campaign.registrationEndDate && (
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                new Date() >= new Date(campaign.registrationStartDate) && 
                                new Date() <= new Date(campaign.registrationEndDate) 
                                  ? 'bg-green-500' 
                                  : new Date() < new Date(campaign.registrationStartDate)
                                  ? 'bg-blue-500'
                                  : 'bg-gray-500'
                              }`}></div>
                              <div>
                                <h4 className="font-medium text-foreground text-sm sm:text-base">Registration Period</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {new Date(campaign.registrationStartDate).toLocaleDateString()} - {new Date(campaign.registrationEndDate).toLocaleDateString()}
                                  {new Date() >= new Date(campaign.registrationStartDate) && new Date() <= new Date(campaign.registrationEndDate) && (
                                    <span className="ml-2 text-green-600 text-xs sm:text-sm">(Active)</span>
                                  )}
                                  {new Date() < new Date(campaign.registrationStartDate) && (
                                    <span className="ml-2 text-blue-600 text-xs sm:text-sm">(Upcoming)</span>
                                  )}
                                  {new Date() > new Date(campaign.registrationEndDate) && (
                                    <span className="ml-2 text-gray-600 text-xs sm:text-sm">(Ended)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Submission Period */}
                          {campaign.submissionStartDate && campaign.submissionEndDate && (
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                new Date() >= new Date(campaign.submissionStartDate) && 
                                new Date() <= new Date(campaign.submissionEndDate) 
                                  ? 'bg-green-500' 
                                  : new Date() < new Date(campaign.submissionStartDate)
                                  ? 'bg-blue-500'
                                  : 'bg-gray-500'
                              }`}></div>
                              <div>
                                <h4 className="font-medium text-foreground text-sm sm:text-base">Submission Period</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {new Date(campaign.submissionStartDate).toLocaleDateString()} - {new Date(campaign.submissionEndDate).toLocaleDateString()}
                                  {new Date() >= new Date(campaign.submissionStartDate) && new Date() <= new Date(campaign.submissionEndDate) && (
                                    <span className="ml-2 text-green-600 text-xs sm:text-sm">(Active)</span>
                                  )}
                                  {new Date() < new Date(campaign.submissionStartDate) && (
                                    <span className="ml-2 text-blue-600 text-xs sm:text-sm">(Upcoming)</span>
                                  )}
                                  {new Date() > new Date(campaign.submissionEndDate) && (
                                    <span className="ml-2 text-gray-600 text-xs sm:text-sm">(Ended)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Results Announcement */}
                          {campaign.resultsAnnouncementDate && (
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                new Date() >= new Date(campaign.resultsAnnouncementDate) 
                                  ? 'bg-purple-500' 
                                  : 'bg-purple-300'
                              }`}></div>
                              <div>
                                <h4 className="font-medium text-foreground text-sm sm:text-base">Results Announcement</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {new Date(campaign.resultsAnnouncementDate).toLocaleDateString()}
                                  {new Date() >= new Date(campaign.resultsAnnouncementDate) && (
                                    <span className="ml-2 text-purple-600 text-xs sm:text-sm">(Announced)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Award Distribution */}
                          {campaign.awardDistributionDate && (
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                new Date() >= new Date(campaign.awardDistributionDate) 
                                  ? 'bg-yellow-500' 
                                  : 'bg-yellow-300'
                              }`}></div>
                              <div>
                                <h4 className="font-medium text-foreground text-sm sm:text-base">Award Distribution</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {new Date(campaign.awardDistributionDate).toLocaleDateString()}
                                  {new Date() >= new Date(campaign.awardDistributionDate) && (
                                    <span className="ml-2 text-yellow-600 text-xs sm:text-sm">(Distributed)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-secondary-foreground rounded-full"></div>
                            <div>
                              <h4 className="font-medium text-foreground text-sm sm:text-base">Created</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {new Date(campaign.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - Actions & Info */}
              <div className="space-y-4 sm:space-y-6">
                {/* Action Buttons */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl text-foreground">Take Action</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Participate or support this campaign.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {/* Dynamic submission button based on status */}
                    {(() => {
                      const buttonState = getSubmissionButtonState();
                      if (buttonState) {
                        const IconComponent = buttonState.icon;
                        return (
                          <Button 
                            variant={buttonState.variant}
                            className="w-full"
                            disabled={buttonState.disabled}
                            onClick={buttonState.onClick}
                          >
                            <IconComponent className="mr-2 h-4 w-4" />
                            {buttonState.text}
                          </Button>
                        );
                      }
                      return null;
                    })()}

                    {/* Dynamic participation buttons based on status */}
                    {(() => {
                      // If user is not authenticated
                      if (!isAuthenticated) {
                        return (
                          <Link to="/login">
                            <Button variant="outline" className="w-full">
                              <Lock className="mr-2 h-4 w-4" />
                              Login to Participate
                            </Button>
                          </Link>
                        );
                      }

                      // If user is not a verified student
                      if (!canParticipate()) {
                        if (needsVerification()) {
                          return (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                                  variant="outline"
                                  className="w-full border-accent/50 text-accent hover:bg-accent/10"
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Complete Verification
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md mx-4 sm:mx-0">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-foreground text-lg sm:text-xl">
                                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                                    Student Verification Required
                                  </DialogTitle>
                                  <DialogDescription className="text-sm sm:text-base">
                                    Complete your student verification to participate in campaigns and access student features.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                                    <div className="flex items-start gap-3">
                                      <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                                      <div>
                                        <h4 className="font-medium text-foreground">Verification Status</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
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
                                  
                                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setSelectedCampaign(null)}
                                      className="w-full sm:w-auto"
                                    >
                                      Close
                                    </Button>
                                    <Link to="/student/profile" className="w-full sm:w-auto">
                                      <Button className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                                        Complete Verification
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          );
                        }
                        return null;
                      }

                      // If user is a verified student but hasn't participated yet
                      if (!participationStatus) {
                        // Check campaign status first
                        if (campaign.status !== 'active') {
                          return (
                            <Button 
                              variant="outline" 
                              className="w-full border-gray-500/50 text-gray-600 hover:bg-gray-500/10"
                              disabled
                            >
                              <Lock className="mr-2 h-4 w-4" />
                              Campaign Not Active
                              <br />
                              <span className="text-xs">Campaign status: {campaign.status}</span>
                            </Button>
                          );
                        }

                        // Check registration period status
                        const now = new Date();
                        const registrationStart = campaign.registrationStartDate ? new Date(campaign.registrationStartDate) : null;
                        const registrationEnd = campaign.registrationEndDate ? new Date(campaign.registrationEndDate) : null;
                        
                        // Determine registration period status
                        const isBeforeRegistrationPeriod = registrationStart && now < registrationStart;
                        const isDuringRegistrationPeriod = registrationStart && registrationEnd && now >= registrationStart && now <= registrationEnd;
                        const isAfterRegistrationPeriod = registrationEnd && now > registrationEnd;
                        
                        if (isBeforeRegistrationPeriod) {
                          return (
                            <Button 
                              variant="outline" 
                              className="w-full border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
                              disabled
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Registration Not Open Yet
                              <br />
                              <span className="text-xs">Opens on {registrationStart?.toLocaleDateString()}</span>
                            </Button>
                          );
                        } else if (isAfterRegistrationPeriod) {
                          return (
                            <Button 
                              variant="outline" 
                              className="w-full border-red-500/50 text-red-600 hover:bg-red-500/10"
                              disabled
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Registration Period Ended
                              <br />
                              <span className="text-xs">Ended on {registrationEnd?.toLocaleDateString()}</span>
                            </Button>
                          );
                        } else {
                          // During registration period or no registration period set
                          return (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  className="w-full shadow-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                                  onClick={() => setSelectedCampaign(campaign)}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Participate in Campaign
                                  {isDuringRegistrationPeriod && (
                                    <>
                                      <br />
                                      <span className="text-xs">Registration ends {registrationEnd?.toLocaleDateString()}</span>
                                    </>
                                  )}
                                </Button>
                              </DialogTrigger>
                        <DialogContent className="max-w-lg mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="space-y-3">
                            <DialogTitle className="flex items-center gap-2 text-foreground text-xl font-bold">
                              <Trophy className="h-5 w-5 text-primary" />
                              Participate in Campaign
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground">
                              Join this campaign and showcase your skills to win amazing prizes!
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Campaign Info Card */}
                            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Campaign Type</Label>
                                  <div className="flex items-center gap-2">
                                  {getCampaignTypeIcon(campaign.campaignType)}
                                    <span className="text-sm font-medium capitalize text-foreground">{campaign.campaignType}</span>
                                </div>
                              </div>
                                <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Prize Pool</Label>
                                  <div className="text-lg font-bold text-primary">
                                  {campaign.campaignType === 'custom' 
                                      ? `${campaign.rewardPool || 0} XLM` 
                                      : `${campaign.prizePool || 0} XLM`
                                  }
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Form Fields */}
                            <div className="space-y-5">
                              <div className="space-y-2">
                                <Label htmlFor="motivation" className="text-sm font-medium text-foreground">
                                  Why do you want to participate? <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                  id="motivation"
                                  placeholder="Tell us what motivates you to join this campaign..."
                                  value={participationForm.motivation}
                                  onChange={(e) => setParticipationForm(prev => ({ ...prev, motivation: e.target.value }))}
                                  className="min-h-[100px] resize-none"
                                  rows={4}
                                />
                                {!participationForm.motivation && (
                                  <p className="text-xs text-red-500">This field is required</p>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="experience" className="text-sm font-medium text-foreground">
                                  Relevant Experience <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                  id="experience"
                                  placeholder="Describe your relevant experience and skills..."
                                  value={participationForm.experience}
                                  onChange={(e) => setParticipationForm(prev => ({ ...prev, experience: e.target.value }))}
                                  className="min-h-[100px] resize-none"
                                  rows={4}
                                />
                                {!participationForm.experience && (
                                  <p className="text-xs text-red-500">This field is required</p>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="portfolio" className="text-sm font-medium text-foreground">
                                  Portfolio/Links <span className="text-muted-foreground">(Optional)</span>
                                </Label>
                                <Input
                                  id="portfolio"
                                  placeholder="GitHub, Behance, or other relevant links..."
                                  value={participationForm.portfolio}
                                  onChange={(e) => setParticipationForm(prev => ({ ...prev, portfolio: e.target.value }))}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="additionalInfo" className="text-sm font-medium text-foreground">
                                  Additional Information <span className="text-muted-foreground">(Optional)</span>
                                </Label>
                                <Textarea
                                  id="additionalInfo"
                                  placeholder="Any additional information you'd like to share..."
                                  value={participationForm.additionalInfo}
                                  onChange={(e) => setParticipationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                                  className="min-h-[80px] resize-none"
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                              <Button 
                                variant="outline" 
                                onClick={() => setSelectedCampaign(null)}
                                className="w-full sm:w-auto order-2 sm:order-1"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleParticipationSubmit}
                                disabled={!participationForm.motivation || !participationForm.experience || isSubmittingParticipation}
                                className="w-full sm:w-auto order-1 sm:order-2 bg-primary hover:bg-primary/90"
                              >
                                {isSubmittingParticipation ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Submit Participation
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  }

                  // If user has already participated, show status-based buttons
                  if (participationStatus) {
                    switch (participationStatus.status) {
                      case 'pending':
                        return (
                          <Button 
                            variant="outline"
                            className="w-full border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10"
                            disabled
                          >
                            <Hourglass className="mr-2 h-4 w-4" />
                            Waiting for Approval
                          </Button>
                        );
                      
                      case 'approved':
                        // Check submission period status
                        const now = new Date();
                        const submissionStart = campaign.submissionStartDate ? new Date(campaign.submissionStartDate) : null;
                        const submissionEnd = campaign.submissionEndDate ? new Date(campaign.submissionEndDate) : null;
                        
                        // Determine submission period status
                        const isBeforeSubmissionPeriod = submissionStart && now < submissionStart;
                        const isDuringSubmissionPeriod = submissionStart && submissionEnd && now >= submissionStart && now <= submissionEnd;
                        const isAfterSubmissionPeriod = submissionEnd && now > submissionEnd;
                        
                        switch (participationStatus.submissionStatus) {
                          case 'not_submitted':
                            if (isBeforeSubmissionPeriod) {
                              return (
                                <Button 
                                  variant="outline" 
                                  className="w-full border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
                                  disabled
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  Wait for Submission Period
                                  <br />
                                  <span className="text-xs">Starts on {submissionStart?.toLocaleDateString()}</span>
                                </Button>
                              );
                            } else if (isDuringSubmissionPeriod) {
                              return (
                                <div className="space-y-3">
                                  <Button 
                                    variant="outline" 
                                    className="w-full border-green-500/50 text-green-600 hover:bg-green-500/10"
                                    disabled
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Submission Period Active
                                    <br />
                                    <span className="text-xs">Ends on {submissionEnd?.toLocaleDateString()}</span>
                                  </Button>
                                  <Button 
                                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                                    onClick={() => setShowSubmissionModal(true)}
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Submit Your Project
                                  </Button>
                                </div>
                              );
                            } else if (isAfterSubmissionPeriod) {
                              return (
                                <Button 
                                  variant="outline" 
                                  className="w-full border-red-500/50 text-red-600 hover:bg-red-500/10"
                                  disabled
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Submission Period Ended
                                  <br />
                                  <span className="text-xs">Ended on {submissionEnd?.toLocaleDateString()}</span>
                                </Button>
                              );
                            } else {
                              // Fallback if no submission dates are set
                              return (
                                <Button 
                                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                                  onClick={() => setShowSubmissionModal(true)}
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Submit Your Project
                                </Button>
                              );
                            }
                          
                          case 'submitted':
                          case 'under_review':
                            return (
                              <Button 
                                variant="outline" 
                                className="w-full border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
                                disabled
                              >
                                <Hourglass className="mr-2 h-4 w-4" />
                                Project Under Review
                                <br />
                                <span className="text-xs">Your submission is being evaluated</span>
                              </Button>
                            );
                          
                          case 'graded':
                            return (
                              <div className="space-y-3">
                                <Button 
                                  variant="outline" 
                                  className="w-full border-green-500/50 text-green-600 hover:bg-green-500/10"
                                  onClick={() => {
                                    // Show submission results modal
                                    alert('View your submission results');
                                  }}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  View Results
                                  <br />
                                  <span className="text-xs">Your project has been graded</span>
                                </Button>
                              </div>
                            );
                          
                          case 'winner':
                            return (
                              <div className="space-y-3">
                                <Button 
                                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                                  onClick={() => {
                                    // Show winner details
                                    alert('Congratulations! You won!');
                                  }}
                                >
                                  <Trophy className="mr-2 h-4 w-4" />
                                  Winner! 🏆
                                  <br />
                                  <span className="text-xs">Congratulations on winning!</span>
                                </Button>
                              </div>
                            );
                          
                          case 'runner_up':
                            return (
                              <div className="space-y-3">
                                <Button 
                                  className="w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
                                  onClick={() => {
                                    // Show runner up details
                                    alert('Congratulations! You are a runner up!');
                                  }}
                                >
                                  <Award className="mr-2 h-4 w-4" />
                                  Runner Up! 🥈
                                  <br />
                                  <span className="text-xs">Great job on your submission!</span>
                                </Button>
                              </div>
                            );
                          
                          case 'not_selected':
                            return (
                              <Button 
                                variant="outline" 
                                className="w-full border-red-500/50 text-red-600 hover:bg-red-500/10"
                                disabled
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Not Selected
                                <br />
                                <span className="text-xs">Thank you for participating</span>
                              </Button>
                            );
                          
                          default:
                            return (
                              <Button 
                                variant="outline" 
                                className="w-full"
                                disabled
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Participation Approved
                              </Button>
                            );
                        }
                      
                      case 'rejected':
                        return (
                          <Button 
                            variant="outline" 
                            className="w-full border-red-500/50 text-red-600 hover:bg-red-500/10"
                            disabled
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Participation Rejected
                          </Button>
                        );
                      
                      default:
                        return (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            disabled
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Participation Submitted
                          </Button>
                        );
                    }
                  }
                }

                return null;
                })()}

                    {/* Fund button for all users (if campaign allows funding) */}
                    {canFund() && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleDonate}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Fund Campaign
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Verification Status */}
                {isAuthenticated && user?.role === 'STUDENT' && (
                  <VerificationStatus showCard={true} />
                )}

                {/* Campaign Creator Info */}
                {campaign.creator && (
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl text-foreground">Campaign Creator</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Meet the person behind this campaign.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                            {campaign.creator.fullName?.charAt(0) || campaign.creator.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{campaign.creator.fullName || campaign.creator.username}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{campaign.creator.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Campaign Stats */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl text-foreground">Campaign Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Type</span>
                      <span className="text-xs sm:text-sm font-medium capitalize text-foreground">{campaign.campaignType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Funding</span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {campaign.fundingTrail ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Created</span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Submission Modal */}
      {campaign && (
        <SubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          campaign={campaign}
          onSubmit={handleProjectSubmission}
          isSubmitting={isSubmittingProject}
        />
      )}
    </div>
  );
};

export default CampaignDetail;
