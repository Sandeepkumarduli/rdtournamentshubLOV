import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  Shield, 
  Users, 
  Trophy, 
  Wallet, 
  LogOut,
  RefreshCw,
  Plus,
  Settings,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserCheck,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const mockUsers = [
    { id: 1, username: "PlayerOne", email: "player1@example.com", status: "Active", joinDate: "2024-01-15", wallet: 450 },
    { id: 2, username: "GamerPro", email: "gamer@example.com", status: "Active", joinDate: "2024-01-20", wallet: 1200 },
    { id: 3, username: "SquadLeader", email: "squad@example.com", status: "Suspended", joinDate: "2024-01-10", wallet: 800 },
  ];

  const mockTournaments = [
    { id: 1, name: "BGMI Pro League", status: "Active", prize: 50000, participants: 156, startDate: "2024-02-01" },
    { id: 2, name: "Weekly Championship", status: "Upcoming", prize: 25000, participants: 89, startDate: "2024-02-10" },
    { id: 3, name: "Squad Showdown", status: "Completed", prize: 30000, participants: 200, startDate: "2024-01-25" },
  ];

  const mockTeams = [
    { id: 1, name: "FireStorm", leader: "PlayerOne", members: 4, status: "Approved", wins: 12 },
    { id: 2, name: "ThunderBolts", leader: "GamerPro", members: 3, status: "Pending", wins: 8 },
    { id: 3, name: "NightRiders", leader: "SquadLeader", members: 4, status: "Rejected", wins: 5 },
  ];

  const renderDashboardStats = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Tournament Management System</p>
        </div>
        <Button variant="outline" onClick={refreshData}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-slate-50">1,247</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tournaments</p>
                <p className="text-2xl font-bold text-slate-50">8</p>
              </div>
              <Trophy className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Prize Pool</p>
                <p className="text-2xl font-bold text-gaming-gold">₹2,45,000</p>
              </div>
              <Wallet className="h-8 w-8 text-gaming-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-warning">12</p>
              </div>
              <Settings className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardStats();
      case 'users':
        return renderUsersContent();
      case 'tournaments':
        return renderTournamentsContent();
      case 'teams':
        return renderTeamsContent();
      case 'wallets':
        return renderWalletsContent();
      case 'create':
        return renderCreateContent();
      default:
        return renderDashboardStats();
    }
  };

  const renderUsersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button variant="outline" onClick={refreshData}>
          <RefreshCw className="h-4 w-4" />
          Refresh Users
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockUsers.map((user) => (
          <Card key={user.id} className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <Badge variant={user.status === "Active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Email: {user.email}</div>
                    <div>Joined: {user.joinDate}</div>
                    <div>Wallet: {user.wallet} rdCoins</div>
                    <div>Status: {user.status}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant={user.status === "Active" ? "destructive" : "default"} size="sm">
                    {user.status === "Active" ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTournamentsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tournament Management</h2>
        <Button variant="outline" onClick={refreshData}>
          <RefreshCw className="h-4 w-4" />
          Refresh Tournaments
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockTournaments.map((tournament) => (
          <Card key={tournament.id} className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{tournament.name}</h3>
                    <Badge variant={tournament.status === "Active" ? "default" : tournament.status === "Upcoming" ? "secondary" : "outline"}>
                      {tournament.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Prize: ₹{tournament.prize.toLocaleString()}</div>
                    <div>Participants: {tournament.participants}</div>
                    <div>Start Date: {tournament.startDate}</div>
                    <div>Status: {tournament.status}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTeamsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Button variant="outline" onClick={refreshData}>
          <RefreshCw className="h-4 w-4" />
          Refresh Teams
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockTeams.map((team) => (
          <Card key={team.id} className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{team.name}</h3>
                    <Badge 
                      variant={
                        team.status === "Approved" ? "default" : 
                        team.status === "Pending" ? "secondary" : "destructive"
                      }
                    >
                      {team.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Leader: {team.leader}</div>
                    <div>Members: {team.members}/4</div>
                    <div>Wins: {team.wins}</div>
                    <div>Status: {team.status}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {team.status === "Pending" && (
                    <>
                      <Button variant="default" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4" />
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
    </div>
  );

  const renderWalletsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Wallet Management</h2>
        <Button variant="outline" onClick={refreshData}>
          <RefreshCw className="h-4 w-4" />
          Refresh Wallets
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockUsers.map((user) => (
          <Card key={user.id} className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <div className="rdcoin-badge">
                      {user.wallet} rdCoins
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>Balance: ₹{user.wallet}</div>
                    <div>Status: {user.status}</div>
                    <div>Last Activity: Recent</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-gaming-gold text-rdcoin-foreground">
                    Add Funds
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCreateContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create New Tournament</h2>
      </div>
      
      <Card className="gaming-card max-w-2xl">
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tournamentName">Tournament Name</Label>
              <Input
                id="tournamentName"
                placeholder="Enter tournament name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizePool">Prize Pool (₹)</Label>
              <Input
                id="prizePool"
                type="number"
                placeholder="50000"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee (rdCoins)</Label>
              <Input
                id="entryFee"
                type="number"
                placeholder="50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tournament description and rules..."
              rows={4}
            />
          </div>
          
          <Button variant="default" className="w-full">
            <Plus className="h-4 w-4" />
            Create Tournament
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background w-full">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-xl font-bold">Welcome back, Admin!</h1>
                    <p className="text-muted-foreground">Manage your tournament platform</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-primary text-primary">
                    Administrator
                  </Badge>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
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
    </SidebarProvider>

  );
};

export default AdminDashboard;