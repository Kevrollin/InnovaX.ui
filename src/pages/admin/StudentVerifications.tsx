import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Calendar,
  RotateCcw,
  Ban,
  MapPin,
  GraduationCap,
  Shield,
  Flag,
  MoreHorizontal,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminAPI, StudentVerification } from '@/services/admin';
import StudentDetailsModal from '@/components/admin/StudentDetailsModal';

const StudentVerifications = () => {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentVerification | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentVerification[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getAllStudentVerifications();
      setStudents(response);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesTab = student.verificationStatus === activeTab;
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const handleStudentAction = async (studentId: number, action: string, message?: string) => {
    setActionLoading(studentId);
    try {
      if (action === 'approved') {
        await adminAPI.approveVerification(studentId, message);
      } else if (action === 'rejected') {
        await adminAPI.rejectVerification(studentId, message);
      }
      
      // Refresh the students list
      await fetchStudents();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error(`Failed to ${action} student:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} student`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderActionButtons = (student: StudentVerification) => {
    const actions = [];
    
    // Always show view details button
    actions.push(
      <Button
        key="view"
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelectedStudent(student);
          setIsDetailsOpen(true);
        }}
        className="text-muted-foreground hover:text-foreground"
      >
        <Eye className="h-4 w-4" />
      </Button>
    );

    // Add status-specific actions
    if (student.verificationStatus === 'PENDING') {
      actions.push(
        <Button
          key="approve"
          variant="ghost"
          size="sm"
          onClick={() => handleStudentAction(student.userId, 'approved')}
          disabled={actionLoading === student.userId}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>,
        <Button
          key="reject"
          variant="ghost"
          size="sm"
          onClick={() => handleStudentAction(student.userId, 'rejected')}
          disabled={actionLoading === student.userId}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      );
    } else if (student.verificationStatus === 'APPROVED') {
      actions.push(
        <Button
          key="reject"
          variant="ghost"
          size="sm"
          onClick={() => handleStudentAction(student.userId, 'rejected')}
          disabled={actionLoading === student.userId}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Ban className="h-4 w-4" />
        </Button>
      );
    } else if (student.verificationStatus === 'REJECTED') {
      actions.push(
        <Button
          key="approve"
          variant="ghost"
          size="sm"
          onClick={() => handleStudentAction(student.userId, 'approved')}
          disabled={actionLoading === student.userId}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      );
    }

    return actions;
  };

  const getTabCounts = () => {
    return {
      PENDING: students.filter(s => s.verificationStatus === 'PENDING').length,
      APPROVED: students.filter(s => s.verificationStatus === 'APPROVED').length,
      REJECTED: students.filter(s => s.verificationStatus === 'REJECTED').length,
    };
  };

  const counts = getTabCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={fetchStudents}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Student Verifications</h1>
            <p className="text-muted-foreground mt-2">Review and manage student verification requests</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={fetchStudents}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Search & Filters</CardTitle>
            <CardDescription>Find specific students by name, email, or school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="PENDING" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending</span>
              <Badge variant="secondary" className="ml-2">{counts.PENDING}</Badge>
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Approved</span>
              <Badge variant="default" className="ml-2 bg-green-600">{counts.APPROVED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected</span>
              <Badge variant="destructive" className="ml-2">{counts.REJECTED}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="PENDING" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Pending Verifications ({counts.PENDING})</CardTitle>
                <CardDescription>Students awaiting verification review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-foreground">Student</TableHead>
                        <TableHead className="text-foreground">School</TableHead>
                        <TableHead className="text-foreground">Admission #</TableHead>
                        <TableHead className="text-foreground">Submitted</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-right text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="border-border hover:bg-secondary/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-foreground">
                                  {student.fullName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{student.fullName}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{student.schoolName}</div>
                              <div className="text-sm text-muted-foreground">{student.schoolEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm text-foreground">{student.admissionNumber}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {new Date(student.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.verificationStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {renderActionButtons(student)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="APPROVED" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Approved Students ({counts.APPROVED})</CardTitle>
                <CardDescription>Successfully verified students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-foreground">Student</TableHead>
                        <TableHead className="text-foreground">School</TableHead>
                        <TableHead className="text-foreground">Verified By</TableHead>
                        <TableHead className="text-foreground">Verified At</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-right text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="border-border hover:bg-secondary/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-foreground">
                                  {(student.fullName || student.username || 'Unknown').charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{student.fullName || student.username || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{student.schoolName}</div>
                              <div className="text-sm text-muted-foreground">{student.schoolEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">Admin</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {student.verifiedAt ? new Date(student.verifiedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.verificationStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {renderActionButtons(student)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="REJECTED" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Rejected Students ({counts.REJECTED})</CardTitle>
                <CardDescription>Students whose verification was rejected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-foreground">Student</TableHead>
                        <TableHead className="text-foreground">School</TableHead>
                        <TableHead className="text-foreground">Reason</TableHead>
                        <TableHead className="text-foreground">Rejected At</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-right text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="border-border hover:bg-secondary/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-foreground">
                                  {(student.fullName || student.username || 'Unknown').charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{student.fullName || student.username || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{student.schoolName}</div>
                              <div className="text-sm text-muted-foreground">{student.schoolEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground max-w-xs truncate">
                              {student.verificationReason || 'No reason provided'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {student.verifiedAt ? new Date(student.verifiedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.verificationStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {renderActionButtons(student)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAction={handleStudentAction}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default StudentVerifications;
