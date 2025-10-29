import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StudentProfileCard } from '@/components/ui/StudentProfileCard';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  Bell,
  Lock,
  Globe,
  Heart,
  Gift,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Clock,
  Plus,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/services/auth';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

const StudentProfile = () => {
  const { user, setUser } = useAuthStore();
  const { isVerifiedStudent, isPendingVerification, isVerificationRejected, refreshUserProfile } = useAuth();
  const isStudentRole = user?.role === 'STUDENT';
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    school_email: user?.studentProfile?.schoolEmail || '',
    school_name: user?.studentProfile?.schoolName || '',
    admission_number: user?.studentProfile?.admissionNumber || '',
    id_number: user?.studentProfile?.idNumber || '',
    twitter_url: user?.studentProfile?.twitterUrl || '',
    linkedin_url: user?.studentProfile?.linkedinUrl || '',
    github_url: user?.studentProfile?.githubUrl || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        school_email: user.studentProfile?.schoolEmail || '',
        school_name: user.studentProfile?.schoolName || '',
        admission_number: user.studentProfile?.admissionNumber || '',
        id_number: user.studentProfile?.idNumber || '',
        twitter_url: user.studentProfile?.twitterUrl || '',
        linkedin_url: user.studentProfile?.linkedinUrl || '',
        github_url: user.studentProfile?.githubUrl || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update student profile (socials + academic)
      const payload: any = {
        schoolEmail: formData.school_email,
        schoolName: formData.school_name,
        admissionNumber: formData.admission_number,
        idNumber: formData.id_number,
        twitterUrl: formData.twitter_url || undefined,
        linkedinUrl: formData.linkedin_url || undefined,
        githubUrl: formData.github_url || undefined,
      };
      await apiService.updateStudentProfile(payload);
      await refreshUserProfile();
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        full_name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        school_email: user.studentProfile?.schoolEmail || '',
        school_name: user.studentProfile?.schoolName || '',
        admission_number: user.studentProfile?.admissionNumber || '',
        id_number: user.studentProfile?.idNumber || '',
        twitter_url: user.studentProfile?.twitterUrl || '',
        linkedin_url: user.studentProfile?.linkedinUrl || '',
        github_url: user.studentProfile?.githubUrl || '',
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
                  Student <span className="text-primary">Profile</span>
                </h1>
                <p className="text-muted-foreground">Manage your student account and academic information</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <StudentProfileCard 
                user={user}
                projectsCreated={0}
                totalRaised={0}
                activeProjects={0}
              />
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="flex w-full gap-2 overflow-x-auto whitespace-nowrap">
                  <TabsTrigger className="shrink-0" value="profile">Profile</TabsTrigger>
                  {isStudentRole && (
                    <TabsTrigger className="shrink-0" value="academic">Academic</TabsTrigger>
                  )}
                  {/*isStudentRole && (
                    <TabsTrigger className="shrink-0" value="projects">Projects</TabsTrigger>
                  )*/}
                  <TabsTrigger className="shrink-0" value="settings">Settings</TabsTrigger>
                  {isStudentRole && (
                    <TabsTrigger className="shrink-0" value="socials">Socials</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {isStudentRole && (
                <TabsContent value="academic" className="space-y-6">
                  {/* Verification Status Card */}
                  <Card className={`border-border ${
                    isVerifiedStudent() ? 'border-green-500/20 bg-green-500/5' :
                    isPendingVerification() ? 'border-yellow-500/20 bg-yellow-500/5' :
                    isVerificationRejected() ? 'border-red-500/20 bg-red-500/5' :
                    'border-gray-500/20 bg-gray-500/5'
                  }`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Verification Status
                      </CardTitle>
                      <CardDescription>
                        Your student verification status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isVerifiedStudent() ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : isPendingVerification() ? (
                            <Clock className="h-6 w-6 text-yellow-500" />
                          ) : isVerificationRejected() ? (
                            <XCircle className="h-6 w-6 text-red-500" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-gray-500" />
                          )}
                          <div>
                            <p className="font-semibold">
                              {isVerifiedStudent() ? 'Verified Student' :
                               isPendingVerification() ? 'Pending Verification' :
                               isVerificationRejected() ? 'Verification Rejected' :
                               'Not Verified'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isVerifiedStudent() ? 'You can create projects and access all student features' :
                               isPendingVerification() ? 'Your profile is under review by admin team' :
                               isVerificationRejected() ? 'Please update your profile and reapply' :
                               'Complete your student profile to get verified'}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          isVerifiedStudent() ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          isPendingVerification() ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          isVerificationRejected() ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }>
                          {user?.studentProfile?.verificationStatus || 'PENDING'}
                        </Badge>
                      </div>
                      {user?.studentProfile?.verifiedAt && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            Verified on: {new Date(user.studentProfile.verifiedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Academic Information
                      </CardTitle>
                      <CardDescription>
                        Your school and academic details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="school_name">School Name</Label>
                          <Input
                            id="school_name"
                            name="school_name"
                            value={formData.school_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="school_email">School Email</Label>
                          <Input
                            id="school_email"
                            name="school_email"
                            type="email"
                            value={formData.school_email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admission_number">Admission Number</Label>
                          <Input
                            id="admission_number"
                            name="admission_number"
                            value={formData.admission_number}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="id_number">ID Number</Label>
                          <Input
                            id="id_number"
                            name="id_number"
                            value={formData.id_number}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                )}

                {isStudentRole && (
                <TabsContent value="projects" className="space-y-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        My Projects
                      </CardTitle>
                      <CardDescription>
                        Manage your created projects
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start creating your first project to showcase your ideas!
                        </p>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                )}

                <TabsContent value="settings" className="space-y-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Account Settings
                      </CardTitle>
                      <CardDescription>
                        Manage your account preferences and security
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Notifications</Label>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="email-notifications" defaultChecked />
                          <Label htmlFor="email-notifications">Email notifications</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="project-updates" defaultChecked />
                          <Label htmlFor="project-updates">Project updates</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {isStudentRole && (
                <TabsContent value="socials" className="space-y-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Social Links
                      </CardTitle>
                      <CardDescription>
                        Add your public social profiles. These will appear on your project pages.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="twitter_url">Twitter / X</Label>
                          <Input
                            id="twitter_url"
                            name="twitter_url"
                            type="url"
                            placeholder="https://twitter.com/yourhandle"
                            value={formData.twitter_url}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin_url">LinkedIn</Label>
                          <Input
                            id="linkedin_url"
                            name="linkedin_url"
                            type="url"
                            placeholder="https://www.linkedin.com/in/yourprofile"
                            value={formData.linkedin_url}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github_url">GitHub</Label>
                          <Input
                            id="github_url"
                            name="github_url"
                            type="url"
                            placeholder="https://github.com/yourusername"
                            value={formData.github_url}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
