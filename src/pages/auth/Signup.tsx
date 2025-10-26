import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Wallet, ArrowLeft, User, GraduationCap, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/services/auth';
import { motion } from 'framer-motion';
import { getSuccessMessage } from '@/utils/errorHandler';
import { showAuthSuccessToast, showAuthErrorToast } from '@/components/ui/enhanced-toast';

const Signup = () => {
  const [activeTab, setActiveTab] = useState('donor');
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const navigate = useNavigate();
  const { login, getDashboardRoute } = useAuth();

  // Donor form state
  const [donorForm, setDonorForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });

  // Student form state
  const [studentForm, setStudentForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    schoolEmail: '',
    schoolName: '',
    admissionNumber: '',
    idNumber: ''
  });

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (donorForm.password !== donorForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...signupData } = donorForm;
      const user = await authAPI.signup(signupData);
      // For signup, we need to login to get the token
      const loginResponse = await authAPI.login({ username: donorForm.username, password: donorForm.password });
      authAPI.setToken(loginResponse.access_token);
      login(user, loginResponse.access_token);
      showAuthSuccessToast(getSuccessMessage('signup'), user.role);
      setIsLoading(false);
      const dashboardRoute = getDashboardRoute();
      navigate(dashboardRoute);
    } catch (error) {
      console.error('Donor signup error:', error);
      showAuthErrorToast(error);
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (studentForm.password !== studentForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...signupData } = studentForm;
      const user = await authAPI.signupStudent(signupData);
      // For signup, we need to login to get the token
      const loginResponse = await authAPI.login({ username: studentForm.username, password: studentForm.password });
      authAPI.setToken(loginResponse.access_token);
      login(user, loginResponse.access_token);
      showAuthSuccessToast(getSuccessMessage('studentSignup'), user.role);
      setIsLoading(false);
      const dashboardRoute = getDashboardRoute();
      navigate(dashboardRoute);
    } catch (error) {
      console.error('Student signup error:', error);
      showAuthErrorToast(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <Card className="border-border shadow-elegant">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                  <Wallet className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-heading">Join FundHub</CardTitle>
              <CardDescription>Create your account to start funding innovation</CardDescription>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="donor" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Donor
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
              </TabsList>

              <TabsContent value="donor">
                <form onSubmit={handleDonorSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="donor-username">Username *</Label>
                        <Input
                          id="donor-username"
                          placeholder="Enter your username"
                          value={donorForm.username}
                          onChange={(e) => setDonorForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor-email">Email *</Label>
                        <Input
                          id="donor-email"
                          type="email"
                          placeholder="Enter your email"
                          value={donorForm.email}
                          onChange={(e) => setDonorForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donor-full-name">Full Name</Label>
                      <Input
                        id="donor-full-name"
                        placeholder="Enter your full name"
                        value={donorForm.full_name}
                        onChange={(e) => setDonorForm(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donor-phone">Phone Number</Label>
                      <Input
                        id="donor-phone"
                        placeholder="Enter your phone number"
                        value={donorForm.phone}
                        onChange={(e) => setDonorForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="donor-password">Password *</Label>
                        <Input
                          id="donor-password"
                          type="password"
                          placeholder="Create a password"
                          value={donorForm.password}
                          onChange={(e) => setDonorForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor-confirm-password">Confirm Password *</Label>
                        <Input
                          id="donor-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={donorForm.confirmPassword}
                          onChange={(e) => setDonorForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="donor-terms"
                        checked={agreeToTerms}
                        onCheckedChange={setAgreeToTerms}
                      />
                      <Label htmlFor="donor-terms" className="text-sm">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Donor Account'}
                    </Button>

                    <div className="text-sm text-center text-muted-foreground">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary hover:underline font-medium">
                        Login
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="student">
                <form onSubmit={handleStudentSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-username">Username *</Label>
                        <Input
                          id="student-username"
                          placeholder="Enter your username"
                          value={studentForm.username}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-email">Email *</Label>
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="Enter your email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="student-full-name">Full Name *</Label>
                        <Input
                          id="student-full-name"
                          placeholder="Enter your full name"
                          value={studentForm.fullName}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                        />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-phone">Phone Number *</Label>
                      <Input
                        id="student-phone"
                        placeholder="Enter your phone number"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Student Information
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="student-school-email">School Email *</Label>
                        <Input
                          id="student-school-email"
                          type="email"
                          placeholder="student@university.edu"
                          value={studentForm.schoolEmail}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, schoolEmail: e.target.value }))}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Use your official school email for verification
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student-school-name">School/University *</Label>
                        <Input
                          id="student-school-name"
                          placeholder="Enter your school name"
                          value={studentForm.schoolName}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, schoolName: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-admission">Admission Number *</Label>
                          <Input
                            id="student-admission"
                            placeholder="Enter admission number"
                            value={studentForm.admissionNumber}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, admissionNumber: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-id">ID Number</Label>
                          <Input
                            id="student-id"
                            placeholder="Enter ID number (optional)"
                            value={studentForm.idNumber}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, idNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-password">Password *</Label>
                        <Input
                          id="student-password"
                          type="password"
                          placeholder="Create a password"
                          value={studentForm.password}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-confirm-password">Confirm Password *</Label>
                        <Input
                          id="student-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={studentForm.confirmPassword}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="student-terms"
                        checked={agreeToTerms}
                        onCheckedChange={setAgreeToTerms}
                      />
                      <Label htmlFor="student-terms" className="text-sm">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Student Account'}
                    </Button>

                    <div className="text-sm text-center text-muted-foreground">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary hover:underline font-medium">
                        Login
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;