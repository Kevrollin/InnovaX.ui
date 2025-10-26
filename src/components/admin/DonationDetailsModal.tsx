import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  ExternalLink, 
  Github, 
  Calendar, 
  DollarSign, 
  Users, 
  Eye, 
  Heart, 
  Share2,
  Star,
  Flag,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Download,
  Play,
  FileText,
  Image,
  Video,
  TrendingUp,
  Target,
  Award,
  Globe,
  Code,
  Zap,
  Shield,
  AlertTriangle,
  Copy,
  Hash,
  CreditCard,
  Wallet,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

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

interface DonationDetailsModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (donationId: number, action: string) => void;
  isLoading: number | null;
}

const DonationDetailsModal = ({ 
  donation, 
  isOpen, 
  onClose, 
  onAction, 
  isLoading 
}: DonationDetailsModalProps) => {
  const [showActionDialog, setShowActionDialog] = useState<string | null>(null);

  if (!donation) return null;

  const handleAction = (action: string) => {
    onAction(donation.id, action);
    setShowActionDialog(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-orange-500';
      case 'failed': return 'text-destructive';
      case 'refunded': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Donation Details</span>
            </DialogTitle>
            <DialogDescription>
              Comprehensive donation information and transaction details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Donation Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center">
                          <DollarSign className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-heading font-bold text-foreground">
                            {donation.amount.toLocaleString()} {donation.currency}
                          </h2>
                          <p className="text-muted-foreground">
                            {donation.is_anonymous ? 'Anonymous donation' : `Donation from ${donation.donor?.full_name || donation.donor?.username}`}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge 
                              variant={donation.status === 'completed' ? 'default' : 
                                     donation.status === 'pending' ? 'secondary' : 
                                     donation.status === 'failed' ? 'destructive' : 'outline'}
                              className={`text-xs ${getStatusColor(donation.status)}`}
                            >
                              {getStatusIcon(donation.status)}
                              <span className="ml-1 capitalize">{donation.status}</span>
                            </Badge>
                            {donation.is_anonymous && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Anonymous
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Donated</p>
                      <p className="text-foreground font-medium">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(donation.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Donation Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-lg font-bold text-foreground">
                          {donation.amount.toLocaleString()} {donation.currency}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="text-lg font-bold text-foreground capitalize">{donation.payment_method}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Privacy</p>
                        <p className="text-lg font-bold text-foreground">
                          {donation.is_anonymous ? 'Anonymous' : 'Public'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Transaction Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <Hash className="h-5 w-5" />
                    <span>Transaction Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Transaction ID</h4>
                      {donation.stellar_transaction_id ? (
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-secondary px-2 py-1 rounded font-mono text-foreground">
                            {donation.stellar_transaction_id}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(donation.stellar_transaction_id!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No transaction ID available</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Blockchain Hash</h4>
                      {donation.transaction_hash ? (
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-secondary px-2 py-1 rounded font-mono text-foreground">
                            {donation.transaction_hash.substring(0, 20)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(donation.transaction_hash!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No hash available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Created</h4>
                      <p className="text-muted-foreground">
                        {new Date(donation.created_at).toLocaleString()}
                      </p>
                    </div>
                    {donation.updated_at && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Last Updated</h4>
                        <p className="text-muted-foreground">
                          {new Date(donation.updated_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Donor Information */}
            {!donation.is_anonymous && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Donor Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-foreground">
                          {donation.donor?.full_name?.charAt(0) || donation.donor?.username?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{donation.donor?.full_name || donation.donor?.username}</h4>
                        <p className="text-sm text-muted-foreground">@{donation.donor?.username}</p>
                        {donation.donor?.email && (
                          <p className="text-sm text-muted-foreground">{donation.donor.email}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Project Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>Project Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Project Title</h4>
                      <p className="text-muted-foreground">{donation.project?.title}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Project Owner</h4>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-sm font-medium text-foreground">
                            {donation.project?.owner?.full_name?.charAt(0) || donation.project?.owner?.username?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-foreground">{donation.project?.owner?.full_name || donation.project?.owner?.username}</p>
                          <p className="text-sm text-muted-foreground">@{donation.project?.owner?.username}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Donation Message */}
            {donation.message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Donor Message</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-foreground italic">"{donation.message}"</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Donation Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Donation Management</CardTitle>
                  <CardDescription>Manage donation status and processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {donation.status === 'pending' && (
                      <>
                        <AlertDialog open={showActionDialog === 'approve'} onOpenChange={(open) => setShowActionDialog(open ? 'approve' : null)}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              className="bg-success hover:bg-success/90"
                              disabled={isLoading === donation.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Donation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this donation? It will be processed and funds will be transferred.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAction('completed')}>
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={showActionDialog === 'reject'} onOpenChange={(open) => setShowActionDialog(open ? 'reject' : null)}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive"
                              disabled={isLoading === donation.id}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Donation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject this donation? It will be marked as failed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAction('failed')}>
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    {donation.status === 'completed' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={isLoading === donation.id}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refund
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Refund Donation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to refund this donation? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction('refunded')}>
                              Refund
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={isLoading === donation.id}>
                          <Flag className="h-4 w-4 mr-2" />
                          Flag
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Flag Donation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Flag this donation for review. This will mark it for additional scrutiny.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAction('flagged')}>
                            Flag Donation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button 
                      variant="outline" 
                      disabled={isLoading === donation.id}
                      onClick={() => window.open(`https://stellar.expert/explorer/public/tx/${donation.stellar_transaction_id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Stellar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DonationDetailsModal;
