import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/AdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import OrgChat from "@/components/OrgChat";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminTournamentsTab from "@/components/admin/AdminTournamentsTab";
import AdminTeamsTab from "@/components/admin/AdminTeamsTab";
import AdminWalletsTab from "@/components/admin/AdminWalletsTab";
import AdminGroupTab from "@/components/admin/AdminGroupTab";
import AdminChat from "@/components/AdminChat";
import AdminReportPage from "@/components/AdminReportPage";
import TopBar from "@/components/TopBar";
import PageTransition from "@/components/PageTransition";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin-login");
        return;
      }
      
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      if (profile?.role !== "admin") {
        navigate("/admin-login");
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
    await supabase.auth.signOut();
    toast({
      title: "Admin logged out",
      description: "Admin session ended",
    });
    navigate("/");
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
        return <AdminChat />;
      case 'org-chat':
        return <OrgChat />;
      case 'report':
        return <AdminReportPage />;
      default:
        return <AdminDashboardStats onRefresh={refreshData} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Welcome back, Admin!</h1>
                <p className="text-muted-foreground">Manage your ORG tournaments</p>
              </div>
              
              {/* Page Links in Center */}
              <TopBar userType="admin" />
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-primary text-primary">
                  ORG Administrator
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <PageTransition trigger={activeTab}>
            {renderContent()}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;