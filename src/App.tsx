import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import AuthGuard from "./components/AuthGuard";
import AdminRouteGuard from "./components/AdminRouteGuard";
import AdminRedirect from "./components/AdminRedirect";
import Landing from "./pages/Landing";
import Projects from "./pages/Projects";
import Campaigns from "./pages/Campaigns";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import DonorDashboard from "./pages/donor/DonorDashboard";
import DonorProfile from "./pages/donor/DonorProfile";
import StudentDashboard from "./pages/student/StudentDashboard";
import CreateProject from "./pages/student/CreateProject";
import StudentProfile from "./pages/student/StudentProfile";
import EditProject from "./pages/student/EditProject";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import StudentVerifications from "./pages/admin/StudentVerifications";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";
import AdminSystemSettings from "./pages/admin/AdminSystemSettings";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import CampaignDetail from "./pages/CampaignDetail";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useAuth(); // Initialize authentication

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Admin routes - only accessible to admins */}
        <Route 
          path="/admin" 
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRouteGuard>
              <UserManagement />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/verifications" 
          element={
            <AdminRouteGuard>
              <StudentVerifications />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/projects" 
          element={
            <AdminRouteGuard>
              <AdminProjects />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/campaigns" 
          element={
            <AdminRouteGuard>
              <AdminCampaigns />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/donations" 
          element={
            <AdminRouteGuard>
              <AdminDonations />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <AdminRouteGuard>
              <AdminAnalytics />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <AdminRouteGuard>
              <AdminActivityLogs />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <AdminRouteGuard>
              <AdminSystemSettings />
            </AdminRouteGuard>
          } 
        />
        
        {/* Regular user routes - redirect admins away */}
        <Route path="/" element={<AdminRedirect><Landing /></AdminRedirect>} />
        <Route path="/projects" element={<AdminRedirect><Projects /></AdminRedirect>} />
        <Route path="/projects/:id" element={<AdminRedirect><ProjectDetail /></AdminRedirect>} />
        <Route path="/campaigns" element={<AdminRedirect><Campaigns /></AdminRedirect>} />
        <Route path="/campaigns/:id" element={<AdminRedirect><CampaignDetail /></AdminRedirect>} />
        <Route 
          path="/donor/dashboard" 
          element={
            <AdminRedirect>
              <AuthGuard requiredRole="BASE_USER">
                <DonorDashboard />
              </AuthGuard>
            </AdminRedirect>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <AdminRedirect>
              <AuthGuard>
                <DonorProfile />
              </AuthGuard>
            </AdminRedirect>
          } 
        />
        <Route 
          path="/student/dashboard" 
          element={
            <AdminRedirect>
              <AuthGuard requiredRole="STUDENT">
                <StudentDashboard />
              </AuthGuard>
            </AdminRedirect>
          } 
        />
        <Route 
          path="/student/profile" 
          element={
            <AdminRedirect>
              <AuthGuard requiredRole="STUDENT">
                <StudentProfile />
              </AuthGuard>
            </AdminRedirect>
          } 
        />
        <Route 
          path="/student/create-project" 
          element={
            <AdminRedirect>
              <AuthGuard requiredRole="STUDENT">
                <CreateProject />
              </AuthGuard>
            </AdminRedirect>
          } 
        />
        <Route 
          path="/student/projects/:id/edit" 
          element={
            <AdminRedirect>
              <AuthGuard requiredRole="STUDENT">
                <EditProject />
              </AuthGuard>
            </AdminRedirect>
          } 
        />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
