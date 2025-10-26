import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/AdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ChatComingSoon from "@/components/ChatComingSoon";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminTournamentsTab from "@/components/admin/AdminTournamentsTab";
import AdminTeamsTab from "@/components/admin/AdminTeamsTab";
import AdminWalletsTab from "@/components/admin/AdminWalletsTab";
import AdminGroupTab from "@/components/admin/AdminGroupTab";
import AdminReportPage from "@/components/AdminReportPage";
import AdminReportsTab from "@/components/admin/AdminReportsTab";
import AdminViewReportsTab from "@/components/admin/AdminViewReportsTab";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { LogOut, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/admin-login");
          return;
        }
        
        // Check if user has admin role and get organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, organization, display_name')
          .eq('user_id', session.user.id)
          .single();
          
        if (profile?.role !== "admin") {
          navigate("/admin-login");
          return;
        }
        
        setAdminData(profile);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate("/admin-login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Add page loading effect when tab changes
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    toast({
      title: "Admin logged out",
      description: "Admin session ended",
    });
    window.location.href = "/admin-login";
  };

  const refreshData = () => {
    toast({
      title: "Data Refreshed",
      description: "Latest admin data loaded",
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const renderContent = () => {
    if (pageLoading) {
      return <LoadingSpinner />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardStats onRefresh={refreshData} />;
      case 'users':
        return <AdminUsersTab onRefresh={refreshData} />;
      case 'tournaments':
        return <AdminTournamentsTab onRefresh={refreshData} />;
      case 'teams':
        return <AdminTeamsTab onRefresh={refreshData} />;
      case 'wallets':
        return <AdminWalletsTab onRefresh={refreshData} />;
      case 'admin-group':
        return <AdminGroupTab />;
      case 'chat':
      case 'org-chat':
        return <ChatComingSoon />;
      case 'report':
        return <AdminReportsTab onRefresh={refreshData} />;
      case 'view-reports':
        return <AdminViewReportsTab onRefresh={refreshData} />;
      default:
        return <AdminDashboardStats onRefresh={refreshData} />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <AdminSidebar isOpen={true} />
      </div>
      
      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ease-in-out",
        "md:ml-0",
        sidebarOpen && "md:ml-64"
      )}>
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-3 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between md:justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 min-w-0 md:flex-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-muted hover:bg-muted/80 flex-shrink-0"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="h-4 w-4 md:h-5 md:w-5" /> : <Menu className="h-4 w-4 md:h-5 md:w-5" />}
                </Button>
                <div className="min-w-0 text-center md:text-left flex-1 md:flex-none">
                  <h1 className="text-sm md:text-xl font-bold truncate">Welcome, {adminData?.organization || 'ORG'} Admin!</h1>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Manage your ORG tournaments</p>
                </div>
              </div>
              
              {/* Page Links - Hidden on mobile */}
              <div className="hidden lg:block">
                <TopBar userType="admin" />
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="border-primary text-primary text-xs md:text-sm hidden sm:inline-flex">
                  ORG Admin
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLogout}
                  className="bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors h-8 w-8 md:h-10 md:w-10"
                  title="Logout"
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-2 md:p-6 overflow-x-hidden">
          <PageTransition trigger={activeTab}>
            {renderContent()}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
