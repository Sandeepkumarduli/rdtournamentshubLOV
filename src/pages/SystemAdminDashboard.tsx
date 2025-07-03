import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SystemAdminDashboard = () => {
  const [systemAdminData, setSystemAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const auth = localStorage.getItem("userAuth");
    if (!auth) {
      navigate("/systemadminlogin");
      return;
    }
    
    const user = JSON.parse(auth);
    if (user.role !== "systemadmin") {
      navigate("/systemadminlogin");
      return;
    }
    
    setSystemAdminData(user);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userAuth");
    toast({
      title: "System Admin logged out",
      description: "System admin session ended",
    });
    navigate("/");
  };

  const refreshData = () => {
    toast({
      title: "System Data Refreshed",
      description: "Latest system metrics loaded",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const mockTransactions = [
    { id: 1, user: "PlayerOne", type: "Deposit", amount: 500, status: "Completed", date: "2024-02-01" },
    { id: 2, user: "GamerPro", type: "Tournament Entry", amount: -50, status: "Completed", date: "2024-02-01" },
    { id: 3, user: "SquadLeader", type: "Prize Winnings", amount: 1000, status: "Pending", date: "2024-02-01" },
    { id: 4, user: "NightOwl", type: "Withdrawal", amount: -200, status: "Processing", date: "2024-01-31" },
  ];

  const mockAdminRequests = [
    { id: 1, username: "ModeratorOne", email: "mod1@example.com", reason: "Experienced tournament organizer", status: "Pending", date: "2024-01-30" },
    { id: 2, username: "EventManager", email: "event@example.com", reason: "Community leader with 2+ years experience", status: "Pending", date: "2024-01-29" },
    { id: 3, username: "TourneyHost", email: "host@example.com", reason: "Professional esports organizer", status: "Approved", date: "2024-01-28" },
  ];

  const systemMetrics = {
    totalUsers: 1247,
    totalAdmins: 8,
    totalTransactions: 5689,
    totalRevenue: 2450000,
    activeTournaments: 12,
    systemHealth: 99.8,
    pendingRequests: 5,
    dailyActiveUsers: 892
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">System Administration</h1>
                <p className="text-sm text-muted-foreground">Master Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-primary text-primary">
                <Crown className="h-3 w-3 mr-1" />
                System Admin
              </Badge>
              <div className="flex items-center gap-1 text-sm">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                System Healthy
              </div>
              <Button variant="ghost" size="icon" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="gaming-card-glow">
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
          
          <Card className="gaming-card-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Revenue</p>
                  <p className="text-2xl font-bold text-gaming-gold">₹{(systemMetrics.totalRevenue / 100000).toFixed(1)}L</p>
                </div>
                <DollarSign className="h-8 w-8 text-gaming-gold" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card-glow">
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
          
          <Card className="gaming-card-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <p className="text-2xl font-bold text-success">{systemMetrics.systemHealth}%</p>
                </div>
                <Shield className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="gaming-card">
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
          
          <Card className="gaming-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-bold">{systemMetrics.totalTransactions.toLocaleString()}</p>
                </div>
                <Database className="h-6 w-6 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
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
          
          <Card className="gaming-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-xl font-bold text-warning">{systemMetrics.pendingRequests}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="admin-requests">Admin Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">System Overview</h2>
              <Button variant="gaming" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
                Refresh Overview
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gaming-card">
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
                    <span>Total Transactions</span>
                    <span className="font-semibold">{systemMetrics.totalTransactions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Revenue</span>
                    <span className="font-semibold text-gaming-gold">₹{(systemMetrics.totalRevenue / 100000).toFixed(1)}L</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Real-time Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Current Online Users</span>
                    <span className="font-semibold text-success">423</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Matches</span>
                    <span className="font-semibold text-accent">28</span>
                  </div>
                  <div className="flex justify-between">
                    <span>System Uptime</span>
                    <span className="font-semibold text-success">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Server Load</span>
                    <span className="font-semibold text-warning">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span className="font-semibold">2 hours ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Transaction Monitoring</h2>
              <Button variant="gaming" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
                Refresh Transactions
              </Button>
            </div>
            
            <div className="grid gap-4">
              {mockTransactions.map((transaction) => (
                <Card key={transaction.id} className="gaming-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{transaction.user}</h3>
                          <Badge variant={
                            transaction.status === "Completed" ? "default" : 
                            transaction.status === "Pending" ? "secondary" : "outline"
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>Type: {transaction.type}</div>
                          <div className={`font-semibold ${transaction.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                            {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                          </div>
                          <div>Date: {transaction.date}</div>
                          <div>Status: {transaction.status}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {transaction.status === "Pending" && (
                          <Button variant="default" size="sm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="admin-requests" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Admin Access Requests</h2>
              <Button variant="gaming" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
                Refresh Requests
              </Button>
            </div>
            
            <div className="grid gap-4">
              {mockAdminRequests.map((request) => (
                <Card key={request.id} className="gaming-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{request.username}</h3>
                          <Badge variant={
                            request.status === "Approved" ? "default" : 
                            request.status === "Pending" ? "secondary" : "destructive"
                          }>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div>Email: {request.email}</div>
                          <div>Reason: {request.reason}</div>
                          <div>Applied: {request.date}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {request.status === "Pending" && (
                          <>
                            <Button variant="default" size="sm">
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <Button variant="gaming" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
                Refresh Analytics
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <div className="text-4xl font-bold text-primary mb-2">+23%</div>
                  <p className="text-muted-foreground">Monthly Growth</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div>New Users: 287</div>
                    <div>Retention Rate: 84%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <div className="text-4xl font-bold text-gaming-gold mb-2">₹45K</div>
                  <p className="text-muted-foreground">Daily Revenue</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div>Tournament Fees: 60%</div>
                    <div>Platform Commission: 40%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <div className="text-4xl font-bold text-accent mb-2">4.2h</div>
                  <p className="text-muted-foreground">Avg. Session Time</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div>Daily Sessions: 2.3</div>
                    <div>Bounce Rate: 12%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <div className="text-4xl font-bold text-success mb-2">99.2%</div>
                  <p className="text-muted-foreground">System Uptime</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div>Response Time: 120ms</div>
                    <div>Error Rate: 0.1%</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">System Configuration</h2>
              <Button variant="gaming" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
                Refresh System
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle>Global Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rdcoinRate">rdCoin Exchange Rate (₹)</Label>
                    <Input
                      id="rdcoinRate"
                      type="number"
                      defaultValue="1"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformFee">Platform Fee (%)</Label>
                    <Input
                      id="platformFee"
                      type="number"
                      defaultValue="5"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minWithdrawal">Minimum Withdrawal (rdCoins)</Label>
                    <Input
                      id="minWithdrawal"
                      type="number"
                      defaultValue="100"
                    />
                  </div>
                  <Button variant="gaming" className="w-full">
                    <Settings className="h-4 w-4" />
                    Update Settings
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Database Status</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Gateway</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Game Servers</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Backup Status</span>
                    <Badge variant="default">Updated</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Security</span>
                    <Badge variant="default">Secured</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4" />
                    View Detailed Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;