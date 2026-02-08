import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import DoctorManagement from "./pages/admin/DoctorManagement";
import HospitalManagement from "./pages/admin/HospitalManagement";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import SMSSettings from "./pages/admin/SMSSettings";
import ScheduleManagement from "./pages/admin/ScheduleManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import HospitalSettings from "./pages/admin/HospitalSettings";
import DoctorProfileSettings from "./pages/admin/DoctorProfileSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/doctors" element={<DoctorManagement />} />
          <Route path="/admin/hospitals" element={<HospitalManagement />} />
          <Route path="/admin/appointments" element={<AppointmentManagement />} />
          <Route path="/admin/schedule" element={<ScheduleManagement />} />
          <Route path="/admin/sms-settings" element={<SMSSettings />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/admin/hospital-settings" element={<HospitalSettings />} />
          <Route path="/admin/profile" element={<DoctorProfileSettings />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
