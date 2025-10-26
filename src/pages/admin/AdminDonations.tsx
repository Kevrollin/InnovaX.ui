import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Download,
  RefreshCw,
  Flag,
  Ban,
  Edit,
  Trash2,
  Heart,
  Share2,
  AlertTriangle,
  Shield,
  Zap,
  Target,
  Award,
  Globe,
  Code,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { donationsAPI } from '@/services/donations';
import DonationDetailsModal from '@/components/admin/DonationDetailsModal';

interface Donation {
  id: number;
  donor_id: number;
  project_id: number;
  amount: number;
  currency: string;
  status: string;
  transaction_hash?: string;
  stellar_transaction_id?: string;
  payment_method: string;
  is_anonymous: boolean;
  message?: string;
  created_at: string;
  updated_at?: string;
  donor?: {
    id: number;
    username: string;
    full_name?: string;
    email?: string;
  };
  project?: {
    id: number;
    title: string;
    owner_id: number;
    owner?: {
      id: number;
      username: string;
      full_name?: string;
    };
  };
}

const AdminDonations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Mock data - replace with actual API calls
  const mockDonations: Donation[] = [
    {
      id: 1,
      donor_id: 1,
      project_id: 1,
      amount: 100,
      currency: 'XLM',
      status: 'completed',
      transaction_hash: '0x1234567890abcdef',
      stellar_transaction_id: 'stellar_tx_123456',
      payment_method: 'stellar',
      is_anonymous: false,
      message: 'Great project! Keep up the good work.',
      created_at: '2024-01-20T10:30:00Z',
      updated_at: '2024-01-20T10:30:00Z',
      donor: {
        id: 1,
        username: 'alice_donor',
        full_name: 'Alice Johnson',
        email: 'alice@example.com'
      },
      project: {
        id: 1,
        title: 'AI-Powered Study Assistant',
        owner_id: 1,
        owner: {
          id: 1,
          username: 'john_student',
          full_name: 'John Doe'
        }
      }
    },
    {
      id: 2,
      donor_id: 2,
      project_id: 2,
      amount: 250,
      currency: 'XLM',
      status: 'pending',
      payment_method: 'stellar',
      is_anonymous: true,
      created_at: '2024-01-21T14:22:00Z',
      donor: {
        id: 2,
        username: 'bob_supporter',
        full_name: 'Bob Smith',
        email: 'bob@example.com'
      },
      project: {
        id: 2,
        title: 'Sustainable Energy Monitor',
        owner_id: 2,
        owner: {
          id: 2,
          username: 'jane_smith',
          full_name: 'Jane Smith'
        }
      }
    },
    {
      id: 3,
      donor_id: 3,
      project_id: 3,
      amount: 50,
      currency: 'XLM',
      status: 'failed',
      payment_method: 'stellar',
      is_anonymous: false,
      message: 'Small contribution to help out',
      created_at: '2024-01-22T09:15:00Z',
      updated_at: '2024-01-22T09:16:00Z',
      donor: {
        id: 3,
        username: 'charlie_helper',
        full_name: 'Charlie Brown',
        email: 'charlie@example.com'
      },
      project: {
        id: 3,
        title: 'Community Garden App',
        owner_id: 3,
        owner: {
          id: 3,
          username: 'mike_wilson',
          full_name: 'Mike Wilson'
        }
      }
    }
  ];

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        // Mock API call - replace with actual implementation
        setDonations(mockDonations);
      } catch (error) {
        console.error('Failed to fetch donations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donor?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    const matchesCurrency = filterCurrency === 'all' || donation.currency === filterCurrency;
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success text-white"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDonationAction = async (donationId: number, action: string) => {
    setActionLoading(donationId);
    try {
      // Mock API call - replace with actual implementation
      console.log(`Performing ${action} on donation ${donationId}`);
      
      // Update local state
      setDonations(prev => prev.map(donation => 
        donation.id === donationId 
          ? { 
              ...donation, 
              status: action,
              updated_at: new Date().toISOString()
            }
          : donation
      ));
      
      setIsDetailsOpen(false);
    } catch (error) {
      console.error(`Failed to ${action} donation:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCounts = () => {
    return {
      all: donations.length,
      completed: donations.filter(d => d.status === 'completed').length,
      pending: donations.filter(d => d.status === 'pending').length,
      failed: donations.filter(d => d.status === 'failed').length,
      refunded: donations.filter(d => d.status === 'refunded').length,
    };
  };

  const getTotalAmount = () => {
    return donations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const getAverageDonation = () => {
    const completedDonations = donations.filter(d => d.status === 'completed');
    return completedDonations.length > 0 
      ? Math.round(completedDonations.reduce((sum, d) => sum + d.amount, 0) / completedDonations.length)
      : 0;
  };

  const statusCounts = getStatusCounts();
  const totalAmount = getTotalAmount();
  const averageDonation = getAverageDonation();

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
            <h1 className="text-3xl font-heading font-bold text-foreground">Donation Management</h1>
            <p className="text-muted-foreground mt-2">Monitor and manage all platform donations</p>
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

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold text-foreground">{statusCounts.all}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground">{totalAmount.toLocaleString()} XLM</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{statusCounts.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average</p>
                  <p className="text-2xl font-bold text-foreground">{averageDonation} XLM</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Search & Filters</CardTitle>
            <CardDescription>Find specific donations by donor, project, or amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search donations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-primary text-primary-foreground' : ''}
                >
                  All ({statusCounts.all})
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                  className={filterStatus === 'completed' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Completed ({statusCounts.completed})
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                  className={filterStatus === 'pending' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Pending ({statusCounts.pending})
                </Button>
                <Button
                  variant={filterStatus === 'failed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('failed')}
                  className={filterStatus === 'failed' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Failed ({statusCounts.failed})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Donations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Donations ({filteredDonations.length})</CardTitle>
            <CardDescription>
              Monitor all platform donations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Donor</TableHead>
                    <TableHead className="text-foreground">Project</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation.id} className="border-border hover:bg-secondary/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-foreground">
                              {donation.is_anonymous ? '?' : (donation.donor?.full_name?.charAt(0) || donation.donor?.username?.charAt(0))}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground">
                              {donation.is_anonymous ? 'Anonymous Donor' : (donation.donor?.full_name || donation.donor?.username)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {donation.is_anonymous ? 'Anonymous' : `@${donation.donor?.username}`}
                            </div>
                            {donation.message && (
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                "{donation.message}"
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{donation.project?.title}</div>
                          <div className="text-sm text-muted-foreground">
                            by {donation.project?.owner?.full_name || donation.project?.owner?.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-foreground font-medium">
                          {donation.amount.toLocaleString()} {donation.currency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {donation.payment_method}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(donation.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(donation.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDonation(donation);
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
      </motion.div>

      {/* Donation Details Modal */}
      <DonationDetailsModal
        donation={selectedDonation}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAction={handleDonationAction}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminDonations;
