import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from "@/components/AdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import SendMoneyDialog from "@/components/SendMoneyDialog";
import OrgChat from "@/components/OrgChat";
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
  TrendingUp,
  X
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
          <h1 className="text-4xl font-bold">ORG Dashboard</h1>
          <p className="text-lg text-muted-foreground">FireStorm ORG Management</p>
        </div>
        <div className="flex gap-2">
          <SendMoneyDialog 
            trigger={
              <Button variant="default">
                <TrendingUp className="h-4 w-4 mr-2" />
                Send Prize Money
              </Button>
            } 
          />
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ORG Members</p>
                <p className="text-2xl font-bold text-slate-50">156</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ORG Tournaments</p>
                <p className="text-2xl font-bold text-slate-50">3</p>
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
      case 'admin-group':
        return renderAdminGroupContent();
      case 'org-chat':
        return <OrgChat />;
      default:
        return renderDashboardStats();
    }
  };

  const renderUsersContent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = mockUsers.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">ORG Members</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="gaming-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <Badge variant={user.status === "Active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </div>
                  <Button 
                    variant={user.status === "Active" ? "destructive" : "default"} 
                    size="sm"
                  >
                    {user.status === "Active" ? (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Unban User
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTournamentsContent = () => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('');

    const orgTournaments = mockTournaments.filter(tournament => tournament.status !== "Completed");
    const filteredTournaments = orgTournaments.filter(tournament => {
      if (statusFilter !== 'All' && tournament.status !== statusFilter) return false;
      if (dateFilter && tournament.startDate !== dateFilter) return false;
      return true;
    });

    const clearFilters = () => {
      setStatusFilter('All');
      setDateFilter('');
      setTimeFilter('');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">ORG Tournaments</h2>
          <div className="flex gap-2">
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40"
            placeholder="Date Filter"
          />
          
          <Button variant="outline" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="gaming-card h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{tournament.name}</CardTitle>
                  <Badge variant={tournament.status === "Active" ? "destructive" : "secondary"}>
                    {tournament.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prize Pool:</span>
                    <span className="font-semibold text-gaming-gold">₹{tournament.prize.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{tournament.startDate}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Participants:</span>
                    <span className="font-medium">{tournament.participants}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ORG:</span>
                    <span className="font-medium text-primary">FireStorm</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

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

  const renderAdminGroupContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Group Management</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle>ORG Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value="FireStorm ORG" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Admin Username</Label>
              <Input value="AdminStorm" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Total Members</Label>
              <Input value="156" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Active Tournaments</Label>
              <Input value="3" readOnly />
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader>
            <CardTitle>ORG Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Prize Pool Distributed:</span>
              <span className="font-semibold text-gaming-gold">₹2,45,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tournaments Completed:</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Success Rate:</span>
              <span className="font-semibold text-success">95%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Satisfaction:</span>
              <span className="font-semibold text-primary">4.8/5</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

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
  );
};

export default AdminDashboard;