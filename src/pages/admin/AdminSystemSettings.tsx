import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Shield,
  Database,
  Mail,
  Globe,
  Lock,
  Users,
  DollarSign,
  Bell,
  FileText,
  Server,
  Monitor,
  Key,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorEnabled: boolean;
    ipWhitelist: string[];
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminNotifications: boolean;
    userNotifications: boolean;
  };
  payments: {
    stripeEnabled: boolean;
    stripePublicKey: string;
    stripeSecretKey: string;
    stellarEnabled: boolean;
    stellarNetwork: string;
    minimumDonation: number;
    maximumDonation: number;
  };
  features: {
    projectCreationEnabled: boolean;
    donationEnabled: boolean;
    studentVerificationEnabled: boolean;
    analyticsEnabled: boolean;
    socialLoginEnabled: boolean;
    apiAccessEnabled: boolean;
  };
}

const AdminSystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'FundHub',
      siteDescription: 'Decentralized crowdfunding platform for students',
      siteUrl: 'https://fundhub.example.com',
      adminEmail: 'admin@fundhub.example.com',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      twoFactorEnabled: false,
      ipWhitelist: [],
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminNotifications: true,
      userNotifications: true,
    },
    payments: {
      stripeEnabled: true,
      stripePublicKey: 'pk_test_...',
      stripeSecretKey: 'sk_test_...',
      stellarEnabled: true,
      stellarNetwork: 'testnet',
      minimumDonation: 1,
      maximumDonation: 10000,
    },
    features: {
      projectCreationEnabled: true,
      donationEnabled: true,
      studentVerificationEnabled: true,
      analyticsEnabled: true,
      socialLoginEnabled: false,
      apiAccessEnabled: true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      // Mock API call - replace with actual implementation
      // const response = await apiService.getSystemSettings();
      // setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      // Mock API call - replace with actual implementation
      // await apiService.updateSystemSettings(settings);
      toast({
        title: "Success",
        description: "System settings saved successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save system settings:', error);
      toast({
        title: "Error",
        description: "Failed to save system settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    // Reset to default settings
    fetchSettings();
    setHasChanges(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

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
            <h1 className="text-3xl font-heading font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground mt-2">Configure platform settings and preferences</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefaults}
              disabled={isSaving}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button 
              onClick={saveSettings}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">General Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={settings.general.siteUrl}
                      onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable maintenance mode to restrict access</p>
                    </div>
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Registration Enabled</Label>
                      <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                    </div>
                    <Switch
                      checked={settings.general.registrationEnabled}
                      onCheckedChange={(checked) => handleSettingChange('general', 'registrationEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verification Required</Label>
                      <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      checked={settings.general.emailVerificationRequired}
                      onCheckedChange={(checked) => handleSettingChange('general', 'emailVerificationRequired', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Security Settings</CardTitle>
                <CardDescription>Configure security policies and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Special Characters</Label>
                      <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                    </div>
                    <Switch
                      checked={settings.security.passwordRequireSpecialChars}
                      onCheckedChange={(checked) => handleSettingChange('security', 'passwordRequireSpecialChars', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorEnabled}
                      onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorEnabled', checked)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Notification Settings</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send push notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Admin Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to administrators</p>
                    </div>
                    <Switch
                      checked={settings.notifications.adminNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'adminNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to users</p>
                    </div>
                    <Switch
                      checked={settings.notifications.userNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'userNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Payment Settings</CardTitle>
                <CardDescription>Configure payment methods and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stripe Enabled</Label>
                      <p className="text-sm text-muted-foreground">Enable Stripe payment processing</p>
                    </div>
                    <Switch
                      checked={settings.payments.stripeEnabled}
                      onCheckedChange={(checked) => handleSettingChange('payments', 'stripeEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stellar Enabled</Label>
                      <p className="text-sm text-muted-foreground">Enable Stellar payment processing</p>
                    </div>
                    <Switch
                      checked={settings.payments.stellarEnabled}
                      onCheckedChange={(checked) => handleSettingChange('payments', 'stellarEnabled', checked)}
                    />
                  </div>
                </div>
                {settings.payments.stripeEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                      <div className="relative">
                        <Input
                          id="stripePublicKey"
                          type={showSecrets ? 'text' : 'password'}
                          value={settings.payments.stripePublicKey}
                          onChange={(e) => handleSettingChange('payments', 'stripePublicKey', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSecrets(!showSecrets)}
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                      <div className="relative">
                        <Input
                          id="stripeSecretKey"
                          type={showSecrets ? 'text' : 'password'}
                          value={settings.payments.stripeSecretKey}
                          onChange={(e) => handleSettingChange('payments', 'stripeSecretKey', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSecrets(!showSecrets)}
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {settings.payments.stellarEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="stellarNetwork">Stellar Network</Label>
                    <Input
                      id="stellarNetwork"
                      value={settings.payments.stellarNetwork}
                      onChange={(e) => handleSettingChange('payments', 'stellarNetwork', e.target.value)}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minimumDonation">Minimum Donation ($)</Label>
                    <Input
                      id="minimumDonation"
                      type="number"
                      value={settings.payments.minimumDonation}
                      onChange={(e) => handleSettingChange('payments', 'minimumDonation', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maximumDonation">Maximum Donation ($)</Label>
                    <Input
                      id="maximumDonation"
                      type="number"
                      value={settings.payments.maximumDonation}
                      onChange={(e) => handleSettingChange('payments', 'maximumDonation', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Feature Settings</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Creation</Label>
                      <p className="text-sm text-muted-foreground">Allow users to create new projects</p>
                    </div>
                    <Switch
                      checked={settings.features.projectCreationEnabled}
                      onCheckedChange={(checked) => handleSettingChange('features', 'projectCreationEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Donations</Label>
                      <p className="text-sm text-muted-foreground">Allow users to make donations</p>
                    </div>
                    <Switch
                      checked={settings.features.donationEnabled}
                      onCheckedChange={(checked) => handleSettingChange('features', 'donationEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Student Verification</Label>
                      <p className="text-sm text-muted-foreground">Enable student verification process</p>
                    </div>
                    <Switch
                      checked={settings.features.studentVerificationEnabled}
                      onCheckedChange={(checked) => handleSettingChange('features', 'studentVerificationEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">Enable analytics tracking</p>
                    </div>
                    <Switch
                      checked={settings.features.analyticsEnabled}
                      onCheckedChange={(checked) => handleSettingChange('features', 'analyticsEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Social Login</Label>
                      <p className="text-sm text-muted-foreground">Enable social media login</p>
                    </div>
                    <Switch
                      checked={settings.features.socialLoginEnabled}
                      onCheckedChange={(checked) => handleSettingChange('features', 'socialLoginEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Access</Label>
                      <p className="text-sm text-muted-foreground">Enable API access for developers</p>
                    </div>
                    <Switch
                      checked={settings.features.apiAccessEnabled}
                      onCheckedChange={(checked) => handleSettingChange('features', 'apiAccessEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Save Status */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  You have unsaved changes. Click "Save Changes" to apply your modifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdminSystemSettings;
