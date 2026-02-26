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
import CMSSiteSettings from "./pages/admin/CMSSiteSettings";
import CMSHeroSlides from "./pages/admin/CMSHeroSlides";
import CMSTestimonials from "./pages/admin/CMSTestimonials";
import CMSPages from "./pages/admin/CMSPages";
import MenuManagement from "./pages/admin/MenuManagement";
import DoctorHospitalAssignment from "./pages/admin/DoctorHospitalAssignment";
import AmbulanceManagement from "./pages/admin/AmbulanceManagement";
import HomeServiceManagement from "./pages/admin/HomeServiceManagement";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CMSPage from "./pages/CMSPage";
import Departments from "./pages/Departments";
import DepartmentDoctors from "./pages/DepartmentDoctors";
import AmbulanceService from "./pages/AmbulanceService";
import Hospitals from "./pages/Hospitals";
import HospitalDetail from "./pages/HospitalDetail";
import HospitalRegister from "./pages/HospitalRegister";

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
          <Route path="/admin/doctor-assignments" element={<DoctorHospitalAssignment />} />
          <Route path="/admin/ambulance" element={<AmbulanceManagement />} />
          <Route path="/admin/home-services" element={<HomeServiceManagement />} />
          <Route path="/admin/hospital-settings" element={<HospitalSettings />} />
          <Route path="/admin/profile" element={<DoctorProfileSettings />} />
          
          {/* CMS Routes */}
          <Route path="/admin/cms/site-settings" element={<CMSSiteSettings />} />
          <Route path="/admin/cms/hero-slides" element={<CMSHeroSlides />} />
          <Route path="/admin/cms/testimonials" element={<CMSTestimonials />} />
          <Route path="/admin/cms/pages" element={<CMSPages />} />
          <Route path="/admin/cms/menu" element={<MenuManagement />} />
          
          {/* Public Pages */}
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:slug" element={<DepartmentDoctors />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/page/:slug" element={<CMSPage />} />
          <Route path="/ambulance" element={<AmbulanceService />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospitals/:slug" element={<HospitalDetail />} />
          <Route path="/hospital-register" element={<HospitalRegister />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
