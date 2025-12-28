import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import DriverDashboard from "./pages/driver/DriverDashboard";
import ApplicationForm from "./pages/driver/ApplicationForm";
import ViewApplication from "./pages/driver/ViewApplication";
import MyApplications from "./pages/driver/MyApplications";
import Employment from "./pages/driver/Employment";
import JobRequests from "./pages/driver/JobRequests";
import Experience from "./pages/driver/Experience";
import Openings from "./pages/driver/Openings";
import TestResults from "./pages/driver/TestResults";
import DrivingSchoolDashboard from "./pages/driving-school/DrivingSchoolDashboard";
import MedicalLabDashboard from "./pages/medical-lab/MedicalLabDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import VerificationAgentDashboard from "./pages/verification-agent/VerificationAgentDashboard";
import TrafficTestPortal from "./pages/TrafficTestPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            
            {/* Driver Routes */}
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/driver/apply" element={<ApplicationForm />} />
            <Route path="/driver/apply/new" element={<ApplicationForm />} />
            <Route path="/driver/application" element={<ViewApplication />} />
            <Route path="/driver/application/:id" element={<ViewApplication />} />
            <Route path="/driver/applications" element={<MyApplications />} />
            <Route path="/driver/documents" element={<DriverDashboard />} />
            <Route path="/driver/certificates" element={<DriverDashboard />} />
            <Route path="/driver/employment" element={<Employment />} />
            <Route path="/driver/job-requests" element={<JobRequests />} />
            <Route path="/driver/experience" element={<Experience />} />
            <Route path="/driver/openings" element={<Openings />} />
            <Route path="/driver/test-results" element={<TestResults />} />
            
            {/* Driving School Routes */}
            <Route path="/driving-school" element={<DrivingSchoolDashboard />} />
            <Route path="/driving-school/drivers" element={<DrivingSchoolDashboard />} />
            <Route path="/driving-school/evaluations" element={<DrivingSchoolDashboard />} />
            
            {/* Medical Lab Routes */}
            <Route path="/medical-lab" element={<MedicalLabDashboard />} />
            <Route path="/medical-lab/drivers" element={<MedicalLabDashboard />} />
            <Route path="/medical-lab/reports" element={<MedicalLabDashboard />} />
            
            {/* Verification Agent Routes */}
            <Route path="/verification-agent" element={<VerificationAgentDashboard />} />
            <Route path="/verification-agent/verifications" element={<VerificationAgentDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/applications" element={<AdminDashboard />} />
            <Route path="/admin/partners" element={<AdminDashboard />} />
            <Route path="/admin/certificates" element={<AdminDashboard />} />
            
            {/* Company Routes */}
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/company/verifications" element={<CompanyDashboard />} />
            <Route path="/company/reports" element={<CompanyDashboard />} />
            
            {/* Traffic Test Portal - Public Route */}
            <Route path="/traffic-test" element={<TrafficTestPortal />} />
            
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
