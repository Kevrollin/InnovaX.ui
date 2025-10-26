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
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Campaign } from '@/types';
import { campaignsAPI } from '@/services/campaigns';


const Campaigns = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = status === 'all' || campaign.status === status;
    const matchesTab = activeTab === 'all' || campaign.status === activeTab;
    return matchesSearch && matchesStatus && matchesTab;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'completed':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Completed</Badge>;
      case 'paused':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Paused</Badge>;
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

  const getProgressPercentage = (campaign: Campaign) => {
    return (campaign.total_funding / campaign.funding_goal) * 100;
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
                Discover and support platform-wide funding campaigns that empower student innovation.
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
                  <SelectItem value="paused">Paused</SelectItem>
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
                {filteredCampaigns.length === 0 ? (
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
                      const progressPercentage = getProgressPercentage(campaign);
                      const daysLeft = getDaysLeft(campaign.end_date);
                      
                      return (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="group overflow-hidden border-border bg-card hover:shadow-elegant transition-all duration-300">
                            {/* Campaign Header */}
                            <CardHeader className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusBadge(campaign.status)}
                                    {campaign.status === 'active' && (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {daysLeft} days left
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                    {campaign.name}
                                  </h3>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {campaign.description}
                              </p>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              {/* Progress */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-semibold text-primary">
                                    {progressPercentage.toFixed(0)}%
                                  </span>
                                </div>
                                <Progress value={progressPercentage} className="h-2" />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>
                                    {campaign.total_funding.toLocaleString()} {campaign.currency}
                                  </span>
                                  <span>
                                    Goal: {campaign.funding_goal.toLocaleString()} {campaign.currency}
                                  </span>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-primary">{campaign.total_applications}</div>
                                  <div className="text-xs text-muted-foreground">Applications</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-accent">{campaign.total_distributions}</div>
                                  <div className="text-xs text-muted-foreground">Winners</div>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                                </span>
                              </div>
                            </CardContent>

                            <CardContent className="pt-0">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Heart className="mr-2 h-4 w-4" />
                                  Follow
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Link to={`/campaigns/${campaign.id}`}>
                                  <Button size="sm" className="flex-1">
                                    View Details
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </Link>
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
                Support student innovation by participating in funding campaigns. 
                Help talented students bring their ideas to life and make a real impact.
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link to="/projects">
                  <Button size="lg" className="shadow-glow">
                    <Target className="mr-2 h-5 w-5" />
                    Browse Projects
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
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