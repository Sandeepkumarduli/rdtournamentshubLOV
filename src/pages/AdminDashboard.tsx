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
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    const auth = localStorage.getItem("userAuth");
    if (!auth) {
      navigate("/adminlogin");
      return;
    }
    
    const user = JSON.parse(auth);
    if (user.role !== "admin") {
      navigate("/adminlogin");
      return;
    }
    
    setAdminData(user);
    setLoading(false);
  }, [navigate]);

  // Add page loading effect when tab changes
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("userAuth");
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
        return <div className="p-6"><h2 className="text-2xl font-bold">Chat with Users & System Admin</h2><p className="text-muted-foreground">Feature coming soon...</p></div>;
      case 'org-chat':
        return <OrgChat />;
      case 'report':
        return <div className="p-6"><h2 className="text-2xl font-bold">Report Issues</h2><p className="text-muted-foreground">Report bugs, members, or other issues. Feature coming soon...</p></div>;
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;