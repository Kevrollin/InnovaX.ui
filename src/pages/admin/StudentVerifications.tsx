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
  MapPin,
  GraduationCap,
  Shield,
  Flag,
  Ban,
  MoreHorizontal,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/services/admin';
import StudentDetailsModal from '@/components/admin/StudentDetailsModal';

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

const StudentVerifications = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentVerification | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentVerification[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Mock data - replace with actual API calls
  const mockStudents: StudentVerification[] = [
    {
      id: 1,
      user_id: 1,
      username: 'john_student',
      email: 'john@example.com',
      full_name: 'John Doe',
      phone: '+1234567890',
      school_email: 'john.doe@university.edu',
      school_name: 'University of Technology',
      admission_number: '2023/001',
      id_number: '12345678',
      verification_status: 'pending',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      estimated_graduation_year: 2027,
      documents: ['id_copy.pdf', 'admission_letter.pdf']
    },
    {
      id: 2,
      user_id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      full_name: 'Jane Smith',
      phone: '+1234567891',
      school_email: 'jane.smith@college.edu',
      school_name: 'State College',
      admission_number: '2023/002',
      id_number: '87654321',
      verification_status: 'approved',
      verification_message: 'All documents verified successfully',
      verified_by: 1,
      verified_at: '2024-01-16T14:22:00Z',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-16T14:22:00Z',
      estimated_graduation_year: 2026
    },
    {
      id: 3,
      user_id: 3,
      username: 'mike_wilson',
      email: 'mike@example.com',
      full_name: 'Mike Wilson',
      phone: '+1234567892',
      school_email: 'mike.wilson@institute.edu',
      school_name: 'Technical Institute',
      admission_number: '2023/003',
      id_number: '11223344',
      verification_status: 'rejected',
      verification_message: 'Invalid admission number provided',
      verified_by: 1,
      verified_at: '2024-01-17T16:45:00Z',
      created_at: '2024-01-12T11:20:00Z',
      updated_at: '2024-01-17T16:45:00Z',
      estimated_graduation_year: 2025
    }
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Mock API call - replace with actual implementation
        setStudents(mockStudents);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesTab = student.verification_status === activeTab;
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-success text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const handleStudentAction = async (studentId: number, action: string, message?: string) => {
    setActionLoading(studentId);
    try {
      // Mock API call - replace with actual implementation
      console.log(`Performing ${action} on student ${studentId}`, message);
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { 
              ...student, 
              verification_status: action as any,
              verification_message: message,
              verified_at: new Date().toISOString()
            }
          : student
      ));
      
      setIsDetailsOpen(false);
    } catch (error) {
      console.error(`Failed to ${action} student:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getTabCounts = () => {
    return {
      pending: students.filter(s => s.verification_status === 'pending').length,
      approved: students.filter(s => s.verification_status === 'approved').length,
      rejected: students.filter(s => s.verification_status === 'rejected').length,
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
            <Button variant="outline" size="sm">
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
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending</span>
              <Badge variant="secondary" className="ml-2">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Approved</span>
              <Badge variant="default" className="ml-2 bg-success">{counts.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected</span>
              <Badge variant="destructive" className="ml-2">{counts.rejected}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Pending Verifications ({counts.pending})</CardTitle>
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
                                  {student.full_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{student.full_name}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{student.school_name}</div>
                              <div className="text-sm text-muted-foreground">{student.school_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm text-foreground">{student.admission_number}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {new Date(student.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.verification_status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
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

          <TabsContent value="approved" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Approved Students ({counts.approved})</CardTitle>
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
                                  {student.full_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{student.full_name}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{student.school_name}</div>
                              <div className="text-sm text-muted-foreground">{student.school_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">Admin</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {student.verified_at ? new Date(student.verified_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.verification_status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
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

          <TabsContent value="rejected" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Rejected Students ({counts.rejected})</CardTitle>
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
                                  {student.full_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{student.full_name}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{student.school_name}</div>
                              <div className="text-sm text-muted-foreground">{student.school_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground max-w-xs truncate">
                              {student.verification_message || 'No reason provided'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {student.verified_at ? new Date(student.verified_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.verification_status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
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
