import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  User,
  Mail,
  GraduationCap,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ExternalLink
} from 'lucide-react';

interface StudentDetailsModalProps {
  participant: {
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const StudentDetailsModal = ({ participant, isOpen, onClose }: StudentDetailsModalProps) => {
  if (!participant) return null;

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
      case 'not_submitted':
        return <Badge variant="outline">Not Submitted</Badge>;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Details: {participant.user.fullName || participant.user.username}
          </DialogTitle>
          <DialogDescription>
            Complete information about the student's participation in the campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm font-medium">{participant.user.fullName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-sm font-medium">@{participant.user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {participant.user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="text-sm font-medium">{participant.user.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* University Information */}
          {participant.user.studentProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  University Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">University</label>
                    <p className="text-sm font-medium">{participant.user.studentProfile.university}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                    <p className="text-sm font-medium">{participant.user.studentProfile.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(participant.user.studentProfile.verificationStatus)}
                      <Badge variant="outline">{participant.user.studentProfile.verificationStatus}</Badge>
                    </div>
                  </div>
                  {participant.user.studentProfile.verifiedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verified At</label>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(participant.user.studentProfile.verifiedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participation Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Participation Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Participation Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(participant.status)}
                      {getStatusBadge(participant.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submission Status</label>
                    {getSubmissionStatusBadge(participant.submissionStatus)}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submitted At</label>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(participant.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {participant.reviewedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reviewed At</label>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(participant.reviewedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {participant.reviewNotes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Review Notes</label>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{participant.reviewNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Motivation</CardTitle>
              <CardDescription>Why the student wants to participate in this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{participant.motivation}</p>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Experience</CardTitle>
              <CardDescription>Student's relevant experience and background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{participant.experience}</p>
            </CardContent>
          </Card>

          {/* Portfolio */}
          {participant.portfolio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfolio</CardTitle>
                <CardDescription>Student's portfolio and previous work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {participant.portfolio.split('\n').map((line, index) => {
                    // Check if line contains a URL
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const urls = line.match(urlRegex);
                    
                    if (urls && urls.length > 0) {
                      return (
                        <div key={index} className="text-sm">
                          {line.split(urlRegex).map((part, partIndex) => {
                            if (urls.includes(part)) {
                              return (
                                <a
                                  key={partIndex}
                                  href={part}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                                >
                                  {part}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              );
                            } else {
                              return part;
                            }
                          })}
                        </div>
                      );
                    } else {
                      return <p key={index} className="text-sm">{line}</p>;
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {participant.additionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
                <CardDescription>Any additional information provided by the student</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{participant.additionalInfo}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;