import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TopBar from "@/components/TopBar";
import { 
  Crown, 
  Users, 
  Database, 
  Activity, 
  LogOut,
  RefreshCw,
  Shield,
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSystemStats } from '@/hooks/useSystemStats';
import { supabase } from "@/integrations/supabase/client";

const SystemAdminDashboard = () => {
  const [systemAdminData, setSystemAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Call hooks first, before any conditional logic
  const { stats: systemMetrics, loading: statsLoading, refetch } = useSystemStats();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/system-admin-login");
        return;
      }
      
      // Check if user has admin role (accepting both admin and systemadmin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      if (!profile?.role || !['admin', 'systemadmin'].includes(profile.role)) {
        navigate("/system-admin-login");
        return;
      }
      
      // Set loading to false once auth check is complete
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const refreshData = () => {
    toast({
      title: "System Data Refreshed",
      description: "Latest system metrics loaded",
    });
  };

  const handleRefresh = () => {
    refetch();
    refreshData();
  };

  if (loading || statsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold">System Administration</h1>
                  <p className="text-muted-foreground">Master Control Panel</p>
                </div>
              </div>
              
              {/* Page Links in Center */}
              <TopBar userType="system" />
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-primary text-primary">
                  <Crown className="h-3 w-3 mr-1" />
                  System Admin
                </Badge>
                <Button variant="ghost" size="icon" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-primary">{systemMetrics.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">System Revenue</p>
                    <p className="text-2xl font-bold text-gaming-gold">{(systemMetrics.totalRevenue / 100000).toFixed(1)}L rdCoins</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-gaming-gold" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Active Users</p>
                    <p className="text-2xl font-bold text-accent">{systemMetrics.dailyActiveUsers}</p>
                  </div>
                  <Activity className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Admins</p>
                    <p className="text-xl font-bold">{systemMetrics.totalAdmins}</p>
                  </div>
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Teams</p>
                    <p className="text-xl font-bold">{systemMetrics.totalTeams}</p>
                  </div>
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Tournaments</p>
                    <p className="text-xl font-bold">{systemMetrics.activeTournaments}</p>
                  </div>
                  <BarChart3 className="h-6 w-6 text-gaming-gold" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Reports</p>
                    <p className="text-xl font-bold text-warning">{systemMetrics.openReports}</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Platform Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <span className="font-semibold">{systemMetrics.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Admins</span>
                  <span className="font-semibold">{systemMetrics.totalAdmins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Running Tournaments</span>
                  <span className="font-semibold">{systemMetrics.activeTournaments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Teams</span>
                  <span className="font-semibold">{systemMetrics.totalTeams}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Revenue</span>
                  <span className="font-semibold text-gaming-gold">{(systemMetrics.totalRevenue / 100000).toFixed(1)}L rdCoins</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Current Online Users</span>
                  <span className="font-semibold text-success">{systemMetrics.dailyActiveUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Matches</span>
                  <span className="font-semibold text-accent">{systemMetrics.activeTournaments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Admin Requests</span>
                  <span className="font-semibold text-warning">{systemMetrics.pendingRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Open Reports</span>
                  <span className="font-semibold text-destructive">{systemMetrics.openReports}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate("/system-users")}
              >
                <Users className="h-6 w-6" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate("/system-admin-requests")}
              >
                <Shield className="h-6 w-6" />
                Review Requests
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate("/system-reports")}
              >
                <AlertTriangle className="h-6 w-6" />
                Handle Reports
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate("/system-transactions")}
              >
                <DollarSign className="h-6 w-6" />
                View Transactions
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate("/system-teams")}
              >
                <Target className="h-6 w-6" />
                Monitor Teams
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-6 w-6" />
                Refresh Data
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;