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
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import StudentVerifications from "./pages/admin/StudentVerifications";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminDonations from "./pages/admin/AdminDonations";
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
              <AdminDashboard />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          } 
        />
        
        {/* Regular user routes - redirect admins away */}
        <Route path="/" element={<AdminRedirect><Landing /></AdminRedirect>} />
        <Route path="/projects" element={<AdminRedirect><Projects /></AdminRedirect>} />
        <Route path="/campaigns" element={<AdminRedirect><Campaigns /></AdminRedirect>} />
        <Route 
          path="/donor/dashboard" 
          element={
            <AdminRedirect>
              <AuthGuard requiredRole="base_user">
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
              <AuthGuard requiredRole="student">
                <StudentDashboard />
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
