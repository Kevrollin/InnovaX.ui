import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Shield, 
  Flag, 
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  FileText,
  School,
  IdCard
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentVerification {
  id: number;
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  school_email: string;
  school_name: string;
  admission_number: string;
  id_number?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_message?: string;
  verified_by?: number;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  estimated_graduation_year?: number;
  documents?: string[];
}

interface StudentDetailsModalProps {
  student: StudentVerification | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (studentId: number, action: string, message?: string) => void;
  isLoading: number | null;
}

const StudentDetailsModal = ({ 
  student, 
  isOpen, 
  onClose, 
  onAction, 
  isLoading 
}: StudentDetailsModalProps) => {
  const [actionMessage, setActionMessage] = useState('');
  const [showActionDialog, setShowActionDialog] = useState<string | null>(null);

  if (!student) return null;

  const handleAction = (action: string) => {
    onAction(student.id, action, actionMessage);
    setActionMessage('');
    setShowActionDialog(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-success';
      case 'rejected': return 'text-destructive';
      case 'pending': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Student Details</span>
            </DialogTitle>
            <DialogDescription>
              Review student information and perform verification actions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Student Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-foreground">
                          {student.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-heading font-bold text-foreground">
                          {student.full_name}
                        </h2>
                        <p className="text-muted-foreground">@{student.username}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Student
                          </Badge>
                          <Badge 
                            variant={student.verification_status === 'approved' ? 'default' : 
                                   student.verification_status === 'rejected' ? 'destructive' : 'secondary'}
                            className={`text-xs ${getStatusColor(student.verification_status)}`}
                          >
                            {getStatusIcon(student.verification_status)}
                            <span className="ml-1 capitalize">{student.verification_status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Member since</p>
                      <p className="text-foreground font-medium">
                        {new Date(student.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-foreground font-medium">{student.email}</p>
                      </div>
                    </div>
                    {student.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="text-foreground font-medium">{student.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="text-foreground font-medium">
                          {new Date(student.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {student.estimated_graduation_year && (
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Graduation</p>
                          <p className="text-foreground font-medium">{student.estimated_graduation_year}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* School Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <School className="h-5 w-5" />
                    <span>School Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">School Name</p>
                      <p className="text-foreground font-medium">{student.school_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">School Email</p>
                      <p className="text-foreground font-medium">{student.school_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Number</p>
                      <p className="text-foreground font-medium font-mono">{student.admission_number}</p>
                    </div>
                    {student.id_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">ID Number</p>
                        <p className="text-foreground font-medium font-mono">{student.id_number}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Documents */}
            {student.documents && student.documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Submitted Documents</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {student.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground font-medium">{doc}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Verification History */}
            {(student.verification_message || student.verified_at) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Verification History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {student.verification_message && (
                      <div>
                        <p className="text-sm text-muted-foreground">Message</p>
                        <p className="text-foreground">{student.verification_message}</p>
                      </div>
                    )}
                    {student.verified_at && (
                      <div>
                        <p className="text-sm text-muted-foreground">Verified At</p>
                        <p className="text-foreground">
                          {new Date(student.verified_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Action Buttons */}
            {student.verification_status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Verification Actions</CardTitle>
                    <CardDescription>Approve or reject this student's verification request</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="action-message">Action Message (Optional)</Label>
                      <Textarea
                        id="action-message"
                        placeholder="Add a message for the student..."
                        value={actionMessage}
                        onChange={(e) => setActionMessage(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <AlertDialog open={showActionDialog === 'approve'} onOpenChange={(open) => setShowActionDialog(open ? 'approve' : null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            className="bg-success hover:bg-success/90"
                            disabled={isLoading === student.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Student Verification</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to approve this student's verification? 
                              This will grant them full student access to the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction('approved')}>
                              Approve
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog open={showActionDialog === 'reject'} onOpenChange={(open) => setShowActionDialog(open ? 'reject' : null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            disabled={isLoading === student.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject Student Verification</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject this student's verification? 
                              They will need to resubmit their documents.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction('rejected')}>
                              Reject
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Additional Actions for Approved/Rejected Students */}
            {(student.verification_status === 'approved' || student.verification_status === 'rejected') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Account Actions</CardTitle>
                    <CardDescription>Manage this student's account status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" disabled={isLoading === student.id}>
                            <Flag className="h-4 w-4 mr-2" />
                            Flag Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Flag Student Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Flag this account for review. This will mark the account for additional scrutiny.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction('flagged')}>
                              Flag Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={isLoading === student.id}>
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspend Student Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Suspend this student's account. They will not be able to access the platform until unsuspended.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction('suspended')}>
                              Suspend Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentDetailsModal;
