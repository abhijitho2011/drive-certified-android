import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DrivingSchoolDashboard from "./pages/driving-school/DrivingSchoolDashboard";
import MedicalLabDashboard from "./pages/medical-lab/MedicalLabDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/driver/application" element={<DriverDashboard />} />
          <Route path="/driver/documents" element={<DriverDashboard />} />
          <Route path="/driver/certificates" element={<DriverDashboard />} />
          
          {/* Driving School Routes */}
          <Route path="/driving-school" element={<DrivingSchoolDashboard />} />
          <Route path="/driving-school/drivers" element={<DrivingSchoolDashboard />} />
          <Route path="/driving-school/evaluations" element={<DrivingSchoolDashboard />} />
          
          {/* Medical Lab Routes */}
          <Route path="/medical-lab" element={<MedicalLabDashboard />} />
          <Route path="/medical-lab/drivers" element={<MedicalLabDashboard />} />
          <Route path="/medical-lab/reports" element={<MedicalLabDashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<AdminDashboard />} />
          <Route path="/admin/partners" element={<AdminDashboard />} />
          <Route path="/admin/certificates" element={<AdminDashboard />} />
          
          {/* Company Routes */}
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/company/verifications" element={<CompanyDashboard />} />
          <Route path="/company/reports" element={<CompanyDashboard />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
