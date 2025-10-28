import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Eye, 
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Award,
  Trophy,
  FileText,
  Image,
  ExternalLink,
  Github,
  RefreshCw,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { submissionsAPI, CampaignSubmission, GradeSubmissionData } from '@/services/submissions';
import { campaignsAPI, Campaign } from '@/services/campaigns';
import { toast } from '@/hooks/use-toast';

const AdminSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<CampaignSubmission | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingData, setGradingData] = useState<GradeSubmissionData>({
    score: 0,
    grade: 'A',
    feedback: '',
    status: 'graded',
    position: undefined,
    prizeAmount: undefined
  });

  // Fetch submissions and campaigns
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch campaigns first
      const campaignsData = await campaignsAPI.getCampaigns();
      setCampaigns(campaignsData);
      
      // Fetch submissions for each campaign
      const allSubmissions: CampaignSubmission[] = [];
      for (const campaign of campaignsData) {
        try {
          const campaignSubmissions = await submissionsAPI.getCampaignSubmissions(campaign.id);
          allSubmissions.push(...campaignSubmissions);
        } catch (error) {
          console.error(`Failed to fetch submissions for campaign ${campaign.id}:`, error);
        }
      }
      
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle grading submission
  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      setIsGrading(true);
      
      // Basic validation
      if (gradingData.score < 0 || gradingData.score > 100) {
        toast({
          title: "Validation Error",
          description: "Score must be between 0 and 100.",
          variant: "destructive",
        });
        return;
      }

      await submissionsAPI.gradeSubmission(selectedSubmission.id, gradingData);
      
      toast({
        title: "Success",
        description: "Submission graded successfully!",
      });
      
      setIsGradingOpen(false);
      setSelectedSubmission(null);
      resetGradingData();
      fetchData();
    } catch (error) {
      console.error('Failed to grade submission:', error);
      toast({
        title: "Error",
        description: "Failed to grade submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGrading(false);
    }
  };

  const resetGradingData = () => {
    setGradingData({
      score: 0,
      grade: 'A',
      feedback: '',
      status: 'graded',
      position: undefined,
      prizeAmount: undefined
    });
  };

  const openGradingDialog = (submission: CampaignSubmission) => {
    setSelectedSubmission(submission);
    setGradingData({
      score: submission.score || 0,
      grade: submission.grade || 'A',
      feedback: submission.feedback || '',
      status: submission.status === 'submitted' ? 'graded' : submission.status,
      position: submission.position,
      prizeAmount: submission.prizeAmount
    });
    setIsGradingOpen(true);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'under_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'graded':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Graded</Badge>;
      case 'winner':
        return <Badge variant="default" className="bg-yellow-600">Winner</Badge>;
      case 'runner_up':
        return <Badge variant="default" className="bg-gray-600">Runner Up</Badge>;
      case 'not_selected':
        return <Badge variant="destructive">Not Selected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get grade badge variant
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return <Badge variant="default" className="bg-green-600">A</Badge>;
      case 'B+':
      case 'B':
        return <Badge variant="default" className="bg-blue-600">B</Badge>;
      case 'C+':
      case 'C':
        return <Badge variant="default" className="bg-yellow-600">C</Badge>;
      case 'D':
        return <Badge variant="default" className="bg-orange-600">D</Badge>;
      case 'F':
        return <Badge variant="destructive">F</Badge>;
      default:
        return <Badge variant="outline">{grade}</Badge>;
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.submitter?.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesCampaign = filterCampaign === 'all' || submission.campaignId.toString() === filterCampaign;
    return matchesSearch && matchesStatus && matchesCampaign;
  });

  // Get status counts
  const getStatusCounts = () => {
    return {
      all: submissions.length,
      submitted: submissions.filter(s => s.status === 'submitted').length,
      under_review: submissions.filter(s => s.status === 'under_review').length,
      graded: submissions.filter(s => s.status === 'graded').length,
      winner: submissions.filter(s => s.status === 'winner').length,
      runner_up: submissions.filter(s => s.status === 'runner_up').length,
      not_selected: submissions.filter(s => s.status === 'not_selected').length,
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
              <h1 className="text-3xl font-bold text-foreground">Campaign Submissions</h1>
              <p className="text-muted-foreground mt-2">
                Review and grade student project submissions
              </p>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{statusCounts.all}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">{statusCounts.under_review}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Winners</p>
                  <p className="text-2xl font-bold">{statusCounts.winner}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Runner Ups</p>
                  <p className="text-2xl font-bold">{statusCounts.runner_up}</p>
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
                      placeholder="Search submissions..."
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
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                      <SelectItem value="winner">Winner</SelectItem>
                      <SelectItem value="runner_up">Runner Up</SelectItem>
                      <SelectItem value="not_selected">Not Selected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:w-48">
                  <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campaigns</SelectItem>
                      {campaigns.map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.id.toString()}>
                          {campaign.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
              <CardDescription>
                Review and grade student project submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading submissions...</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No submissions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{submission.projectTitle}</div>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {submission.projectDescription}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {submission.projectScreenshots.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Image className="h-3 w-3 mr-1" />
                                    {submission.projectScreenshots.length} screenshots
                                  </Badge>
                                )}
                                {submission.pitchDeckUrl && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Pitch Deck
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">
                                {submission.submitter?.fullName || submission.submitter?.username}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{submission.submitter?.username}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {submission.campaign?.title || 'Unknown Campaign'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(submission.status)}
                          </TableCell>
                          <TableCell>
                            {submission.score !== undefined ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{submission.score}/100</span>
                                {submission.grade && getGradeBadge(submission.grade)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not graded</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {new Date(submission.submissionDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openGradingDialog(submission)}
                              >
                                <Eye className="h-4 w-4" />
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

        {/* Grading Dialog */}
        <Dialog open={isGradingOpen} onOpenChange={setIsGradingOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
              <DialogDescription>
                Review and grade the student's project submission
              </DialogDescription>
            </DialogHeader>
            
            {selectedSubmission && (
              <div className="space-y-6">
                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Project Title</label>
                      <p className="text-sm font-medium">{selectedSubmission.projectTitle}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Student</label>
                      <p className="text-sm font-medium">
                        {selectedSubmission.submitter?.fullName || selectedSubmission.submitter?.username}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-1">{selectedSubmission.projectDescription}</p>
                  </div>
                </div>

                {/* Screenshots */}
                {selectedSubmission.projectScreenshots.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Screenshots</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedSubmission.projectScreenshots.map((screenshot, index) => (
                        <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Links */}
                {(selectedSubmission.projectLinks.demoUrl || 
                  selectedSubmission.projectLinks.githubUrl || 
                  selectedSubmission.projectLinks.filesUrl) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Project Links</h3>
                    <div className="space-y-2">
                      {selectedSubmission.projectLinks.demoUrl && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          <a 
                            href={selectedSubmission.projectLinks.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Demo Link
                          </a>
                        </div>
                      )}
                      {selectedSubmission.projectLinks.githubUrl && (
                        <div className="flex items-center gap-2">
                          <Github className="h-4 w-4" />
                          <a 
                            href={selectedSubmission.projectLinks.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            GitHub Repository
                          </a>
                        </div>
                      )}
                      {selectedSubmission.projectLinks.filesUrl && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <a 
                            href={selectedSubmission.projectLinks.filesUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Additional Files
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pitch Deck */}
                {selectedSubmission.pitchDeckUrl && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pitch Deck</h3>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <a 
                        href={selectedSubmission.pitchDeckUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Pitch Deck
                      </a>
                    </div>
                  </div>
                )}

                {/* Grading Form */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">Grading</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Score (0-100) *</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={gradingData.score}
                        onChange={(e) => setGradingData({ ...gradingData, score: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Grade *</label>
                      <Select value={gradingData.grade} onValueChange={(value) => setGradingData({ ...gradingData, grade: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C+">C+</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Feedback</label>
                    <Textarea
                      placeholder="Provide detailed feedback on the project..."
                      value={gradingData.feedback}
                      onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Final Status</label>
                      <Select value={gradingData.status} onValueChange={(value) => setGradingData({ ...gradingData, status: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="graded">Graded</SelectItem>
                          <SelectItem value="winner">Winner</SelectItem>
                          <SelectItem value="runner_up">Runner Up</SelectItem>
                          <SelectItem value="not_selected">Not Selected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Position (1-3)</label>
                      <Input
                        type="number"
                        min="1"
                        max="3"
                        value={gradingData.position || ''}
                        onChange={(e) => setGradingData({ ...gradingData, position: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Prize Amount (XLM)</label>
                      <Input
                        type="number"
                        min="0"
                        value={gradingData.prizeAmount || ''}
                        onChange={(e) => setGradingData({ ...gradingData, prizeAmount: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGradingOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGradeSubmission} disabled={isGrading}>
                {isGrading ? 'Grading...' : 'Submit Grade'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminSubmissions;
