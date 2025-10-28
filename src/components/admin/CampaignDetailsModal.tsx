import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Award,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Github,
  Globe,
  Download,
  Star,
  Trophy,
  Gift
} from 'lucide-react';
import { Campaign } from '@/services/campaigns';
import { adminAPI } from '@/services/admin';
import { submissionsAPI } from '@/services/submissions';
import { toast } from '@/hooks/use-toast';
import StudentDetailsModal from './StudentDetailsModal';

interface Participant {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  submissionStatus: 'not_submitted' | 'submitted' | 'under_review' | 'graded' | 'winner' | 'runner_up' | 'not_selected';
  motivation: string;
  experience: string;
  portfolio?: string;
  additionalInfo?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName?: string;
    role: string;
    studentProfile?: {
      id: number;
      university: string;
      studentId: string;
      verificationStatus: string;
      verifiedAt?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  id: number;
  projectTitle: string;
  projectDescription: string;
  projectScreenshots: string[];
  projectLinks: {
    demoUrl?: string;
    githubUrl?: string;
    filesUrl?: string;
  };
  pitchDeckUrl?: string;
  status: 'submitted' | 'under_review' | 'graded' | 'winner' | 'runner_up' | 'not_selected';
  submissionDate: string;
  score?: number;
  grade?: string;
  feedback?: string;
  position?: number;
  prizeAmount?: number;
  prizeDistributed: boolean;
  user: {
    id: number;
    username: string;
    fullName?: string;
    email: string;
  };
}

interface CampaignDetailsModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
}

const CampaignDetailsModal = ({ campaign, isOpen, onClose }: CampaignDetailsModalProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState<{ [key: number]: string }>({});
  const [activeTab, setActiveTab] = useState('participants');
  
  // Student details modal state
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Fetch participants and submissions when modal opens
  useEffect(() => {
    if (isOpen && campaign) {
      fetchCampaignData();
    }
  }, [isOpen, campaign]);

  const fetchCampaignData = async () => {
    if (!campaign) return;

    try {
      setIsLoading(true);
      
      // Fetch participants
      const participantsData = await adminAPI.getCampaignParticipants(campaign.id);
      setParticipants(participantsData.participants || []);

      // Fetch submissions if any
      try {
        const submissionsData = await submissionsAPI.getCampaignSubmissions(campaign.id);
        setSubmissions(submissionsData || []);
      } catch (error) {
        // Submissions might not exist yet
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewParticipation = async (participationId: number, status: 'approved' | 'rejected') => {
    try {
      setIsReviewing(participationId);
      
      const notes = reviewNotes[participationId] || '';
      
      await adminAPI.reviewParticipation(participationId, status, notes);
      
      toast({
        title: "Success",
        description: `Participation ${status} successfully!`,
      });
      
      // Refresh data
      await fetchCampaignData();
    } catch (error) {
      console.error('Failed to review participation:', error);
      toast({
        title: "Error",
        description: "Failed to review participation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(null);
    }
  };

  const handleViewStudentDetails = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsStudentDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'winner':
        return <Badge variant="default" className="bg-yellow-600">Winner</Badge>;
      case 'runner_up':
        return <Badge variant="default" className="bg-gray-600">Runner Up</Badge>;
      case 'graded':
        return <Badge variant="default" className="bg-blue-600">Graded</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'under_review':
        return <Badge variant="outline">Under Review</Badge>;
      case 'not_selected':
        return <Badge variant="outline">Not Selected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Campaign Details: {campaign.title}
          </DialogTitle>
          <DialogDescription>
            Manage participants, review submissions, and handle awards for this campaign.
          </DialogDescription>
        </DialogHeader>

        {/* Campaign Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">{participants.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">
                    {participants.filter(p => p.status === 'approved').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Participants and Submissions */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants ({participants.length})
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Submissions ({submissions.length})
            </TabsTrigger>
          </TabsList>

          {/* Participants Tab */}
          <TabsContent value="participants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Participants</CardTitle>
                <CardDescription>
                  Review and approve/reject student participation requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading participants...</p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No participants yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>University</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Motivation</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants.map((participant) => (
                          <TableRow key={participant.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {participant.user.fullName || participant.user.username}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  @{participant.user.username}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {participant.user.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {participant.user.studentProfile?.university || 'N/A'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {participant.user.studentProfile?.studentId || 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(participant.status)}
                                {getStatusBadge(participant.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate">
                                {participant.motivation}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate">
                                {participant.experience}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(participant.submittedAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {participant.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleReviewParticipation(participant.id, 'approved')}
                                      disabled={isReviewing === participant.id}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleReviewParticipation(participant.id, 'rejected')}
                                      disabled={isReviewing === participant.id}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewStudentDetails(participant)}
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
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Submissions</CardTitle>
                <CardDescription>
                  Review submitted projects and assign grades/awards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No submissions yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Submissions will appear here when students submit their projects
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{submission.projectTitle}</h3>
                              {getSubmissionStatusBadge(submission.status)}
                              {submission.position && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  Position {submission.position}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {submission.user.fullName || submission.user.username}
                            </p>
                            <p className="text-sm mb-3">{submission.projectDescription}</p>
                            
                            {/* Project Links */}
                            <div className="flex items-center gap-4 mb-3">
                              {submission.projectLinks.demoUrl && (
                                <a 
                                  href={submission.projectLinks.demoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <Globe className="h-4 w-4" />
                                  Demo
                                </a>
                              )}
                              {submission.projectLinks.githubUrl && (
                                <a 
                                  href={submission.projectLinks.githubUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  <Github className="h-4 w-4" />
                                  GitHub
                                </a>
                              )}
                              {submission.pitchDeckUrl && (
                                <a 
                                  href={submission.pitchDeckUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                                >
                                  <Download className="h-4 w-4" />
                                  Pitch Deck
                                </a>
                              )}
                            </div>

                            {/* Screenshots */}
                            {submission.projectScreenshots.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-2">Screenshots:</p>
                                <div className="flex gap-2 flex-wrap">
                                  {submission.projectScreenshots.map((screenshot, index) => (
                                    <img
                                      key={index}
                                      src={screenshot}
                                      alt={`Screenshot ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                                      onClick={() => window.open(screenshot, '_blank')}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Grading Info */}
                            {(submission.score || submission.grade || submission.feedback) && (
                              <div className="mt-3 p-3 bg-gray-50 rounded">
                                <h4 className="text-sm font-medium mb-2">Grading Information</h4>
                                {submission.score && (
                                  <p className="text-sm">Score: {submission.score}/100</p>
                                )}
                                {submission.grade && (
                                  <p className="text-sm">Grade: {submission.grade}</p>
                                )}
                                {submission.feedback && (
                                  <p className="text-sm">Feedback: {submission.feedback}</p>
                                )}
                                {submission.prizeAmount && (
                                  <p className="text-sm font-medium text-green-600">
                                    Prize Amount: ${submission.prizeAmount}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Show detailed submission view
                                alert(`Project Title: ${submission.projectTitle}\n\nDescription: ${submission.projectDescription}\n\nStatus: ${submission.status}\n\nSubmitted: ${new Date(submission.submissionDate).toLocaleString()}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {submission.status === 'submitted' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Grade submission
                                  alert('Grading functionality would be implemented here');
                                }}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Student Details Modal */}
        <StudentDetailsModal
          participant={selectedParticipant}
          isOpen={isStudentDetailsOpen}
          onClose={() => {
            setIsStudentDetailsOpen(false);
            setSelectedParticipant(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailsModal;
