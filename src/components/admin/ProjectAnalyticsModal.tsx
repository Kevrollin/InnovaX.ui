import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  DollarSign, 
  Users,
  Calendar,
  MessageSquare,
  Lock,
  Globe,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { projectsAPI } from '@/services/projects';
import { toast } from '@/hooks/use-toast';

interface ProjectAnalyticsModalProps {
  projectId: number;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  project: {
    id: number;
    title: string;
    status: string;
    viewsCount: number;
    likesCount: number;
    sharesCount: number;
    goalAmount: number;
    currentAmount: number;
  };
  engagement: {
    likes: {
      count: number;
      users: Array<{
        user: {
          id: number;
          username: string;
          fullName: string;
          email: string;
          profilePicture?: string;
        };
        likedAt: string;
      }>;
    };
    shares: {
      count: number;
      byPlatform: any;
      all: Array<{
        user: {
          id: number;
          username: string;
          fullName: string;
          email: string;
          profilePicture?: string;
        };
        platform: string;
        sharedAt: string;
      }>;
    };
    donations: {
      totalCount: number;
      totalAmount: number;
      anonymousCount: number;
      publicCount: number;
      recent: Array<{
        donor: {
          id: number;
          username: string;
          fullName: string;
        } | null;
        amount: number;
        message?: string;
        isAnonymous: boolean;
        donatedAt: string;
      }>;
    };
  };
  performance: {
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalDonations: number;
    totalRaised: number;
    fundingProgress: number;
  };
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return <Facebook className="h-4 w-4" />;
    case 'twitter':
      return <Twitter className="h-4 w-4" />;
    case 'linkedin':
      return <Linkedin className="h-4 w-4" />;
    default:
      return <Share2 className="h-4 w-4" />;
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const ProjectAnalyticsModal = ({ 
  projectId, 
  projectTitle, 
  isOpen, 
  onClose 
}: ProjectAnalyticsModalProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchAnalytics();
    }
  }, [isOpen, projectId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await projectsAPI.getProjectAnalytics(projectId.toString());
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load project analytics. Please try again.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Analytics: {projectTitle}</DialogTitle>
          <DialogDescription>
            Track engagement, likes, shares, and donations for your project
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : analytics ? (
          <div className="space-y-6 mt-4">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{analytics.performance.totalViews}</div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">{analytics.performance.totalLikes}</div>
                    <div className="text-sm text-muted-foreground">Total Likes</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Share2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{analytics.performance.totalShares}</div>
                    <div className="text-sm text-muted-foreground">Total Shares</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">${analytics.performance.totalRaised.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Raised</div>
                  </div>
                </div>

                {/* Funding Progress */}
                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Funding Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {analytics.performance.fundingProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(analytics.performance.fundingProgress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>${analytics.project.currentAmount.toLocaleString()}</span>
                    <span>${analytics.project.goalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analytics Tabs */}
            <Tabs defaultValue="likes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="likes">
                  <Heart className="h-4 w-4 mr-2" />
                  Likes ({analytics.engagement.likes.count})
                </TabsTrigger>
                <TabsTrigger value="shares">
                  <Share2 className="h-4 w-4 mr-2" />
                  Shares ({analytics.engagement.shares.count})
                </TabsTrigger>
                <TabsTrigger value="donations">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Donations ({analytics.engagement.donations.totalCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="likes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>People Who Liked</CardTitle>
                    <CardDescription>
                      {analytics.engagement.likes.count} people liked this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.engagement.likes.users.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No likes yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {analytics.engagement.likes.users.map((like) => (
                          <div key={like.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={like.user.profilePicture} />
                                <AvatarFallback>{getInitials(like.user.fullName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{like.user.fullName}</p>
                                <p className="text-sm text-muted-foreground">@{like.user.username}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(like.likedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shares" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Shares</CardTitle>
                    <CardDescription>
                      {analytics.engagement.shares.count} shares across different platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.engagement.shares.all.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No shares yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {analytics.engagement.shares.all.map((share, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={share.user.profilePicture} />
                                <AvatarFallback>{getInitials(share.user.fullName)}</AvatarFallback>
                              </Avatar>
                              <div className="flex items-center space-x-2">
                                {getPlatformIcon(share.platform)}
                                <div>
                                  <p className="font-medium">{share.user.fullName}</p>
                                  <p className="text-sm text-muted-foreground">@{share.user.username}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{share.platform}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(share.sharedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="donations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Donations Received</CardTitle>
                    <CardDescription>
                      ${analytics.engagement.donations.totalAmount.toLocaleString()} from {analytics.engagement.donations.totalCount} donations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{analytics.engagement.donations.publicCount}</div>
                        <div className="text-sm text-muted-foreground">Public Donations</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{analytics.engagement.donations.anonymousCount}</div>
                        <div className="text-sm text-muted-foreground">Anonymous Donations</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold mb-3">Recent Donations</h4>
                      {analytics.engagement.donations.recent.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No donations yet
                        </div>
                      ) : (
                        analytics.engagement.donations.recent.map((donation, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {donation.isAnonymous ? (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                  </div>
                                ) : (
                                  <Avatar>
                                    <AvatarFallback>{getInitials(donation.donor?.fullName || 'A')}</AvatarFallback>
                                  </Avatar>
                                )}
                                <div>
                                  <p className="font-medium">
                                    {donation.isAnonymous ? 'Anonymous Donor' : donation.donor?.fullName}
                                  </p>
                                  {donation.message && (
                                    <p className="text-sm text-muted-foreground">{donation.message}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">${donation.amount.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(donation.donatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

