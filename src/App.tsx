import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import SystemAdminLogin from "./pages/SystemAdminLogin";
import DashboardLayout from "./pages/DashboardLayout";
import AdminDashboard from "./pages/AdminDashboard";
import SystemAdminDashboard from "./pages/SystemAdminDashboard";
import SystemUserManagement from "./pages/SystemUserManagement";
import SystemTransactions from "./pages/SystemTransactions";
import SystemAdminRequests from "./pages/SystemAdminRequests";
import SystemTeams from "./pages/SystemTeams";
import SystemReports from "./pages/SystemReports";
import NotFound from "./pages/NotFound";
import DashboardHome from "./pages/DashboardHome";
import Tournaments from "./pages/Tournaments";
import Teams from "./pages/Teams";
import WalletPage from "./pages/WalletPage";
import ChatComingSoon from "./components/ChatComingSoon";
import Profile from "./pages/Profile";
import TournamentGuide from "./pages/TournamentGuide";
import Rules from "./pages/Rules";
import Contact from "./pages/Contact";
import WalletSystem from "./pages/WalletSystem";
import Report from "./pages/Report";
import SystemChatPage from "./pages/SystemChatPage";

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
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/system-admin-login" element={<SystemAdminLogin />} />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="user">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="tournaments" element={<Tournaments />} />
            <Route path="teams" element={<Teams />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="groups" element={<ChatComingSoon />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<ChatComingSoon />} />
            <Route path="report" element={<Report />} />
          </Route>
          <Route path="/org-dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/system-admin-dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <SystemAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/system-users" element={
            <ProtectedRoute requiredRole="admin">
              <SystemUserManagement />
            </ProtectedRoute>
          } />
          <Route path="/system-transactions" element={
            <ProtectedRoute requiredRole="admin">
              <SystemTransactions />
            </ProtectedRoute>
          } />
          <Route path="/system-admin-requests" element={
            <ProtectedRoute requiredRole="admin">
              <SystemAdminRequests />
            </ProtectedRoute>
          } />
          <Route path="/system-teams" element={
            <ProtectedRoute requiredRole="admin">
              <SystemTeams />
            </ProtectedRoute>
          } />
          <Route path="/system-reports" element={
            <ProtectedRoute requiredRole="admin">
              <SystemReports />
            </ProtectedRoute>
          } />
          <Route path="/system-chat" element={
            <ProtectedRoute requiredRole="admin">
              <SystemChatPage />
            </ProtectedRoute>
          } />
          <Route path="/tournament-guide" element={<TournamentGuide />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wallet-system" element={<WalletSystem />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
