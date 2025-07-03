import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  GamepadIcon, 
  Trophy, 
  Users, 
  Wallet, 
  LogOut,
  RefreshCw,
  Plus,
  Calendar,
  Star,
  Target,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const auth = localStorage.getItem("userAuth");
    if (!auth) {
      navigate("/login");
      return;
    }
    
    const user = JSON.parse(auth);
    if (user.role !== "user") {
      navigate("/login");
      return;
    }
    
    setUserData(user);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userAuth");
    toast({
      title: "Logged out successfully",
      description: "See you in the battlefield!",
    });
    navigate("/");
  };

  const refreshData = () => {
    toast({
      title: "Data Refreshed",
      description: "Latest information loaded",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const mockTournaments = [
    { id: 1, name: "BGMI Pro League", status: "Active", prize: "₹50,000", participants: 156 },
    { id: 2, name: "Weekly Championship", status: "Upcoming", prize: "₹25,000", participants: 89 },
    { id: 3, name: "Squad Showdown", status: "Completed", prize: "₹30,000", participants: 200 },
  ];

  const mockTeams = [
    { id: 1, name: "FireStorm", members: 4, status: "Active", wins: 12 },
    { id: 2, name: "ThunderBolts", members: 3, status: "Recruiting", wins: 8 },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GamepadIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Welcome back, {userData?.username}!</h1>
                <p className="text-sm text-muted-foreground">Ready for some action?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rdcoin-badge">
                <Wallet className="h-4 w-4" />
                {userData?.wallet?.balance || 100} rdCoins
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl font-bold text-gaming-gold">₹{userData?.wallet?.balance || 100}</p>
                </div>
                <Wallet className="h-8 w-8 text-gaming-gold" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tournaments Joined</p>
                  <p className="text-2xl font-bold text-primary">12</p>
                </div>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Teams</p>
                  <p className="text-2xl font-bold text-accent">2</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold text-success">68%</p>
                </div>
                <Target className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tournaments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="teams">My Teams</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Tournaments</h2>
              <Button variant="gaming">
                <Plus className="h-4 w-4" />
                Join Tournament
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
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            Prize: {tournament.prize}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tournament.participants} participants
                          </div>
                        </div>
                      </div>
                      <Button variant="gaming-outline">
                        {tournament.status === "Active" ? "Join Now" : tournament.status === "Upcoming" ? "Register" : "View Results"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Teams</h2>
              <Button variant="gaming">
                <Plus className="h-4 w-4" />
                Create Team
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
                          <Badge variant={team.status === "Active" ? "default" : "secondary"}>
                            {team.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {team.members}/4 members
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {team.wins} wins
                          </div>
                        </div>
                      </div>
                      <Button variant="gaming-outline">
                        Manage Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Wallet Management</h2>
              <Button variant="rdcoin">
                <CreditCard className="h-4 w-4" />
                Add Funds
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gaming-card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-gaming-gold" />
                    Current Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gaming-gold mb-4">
                    {userData?.wallet?.balance || 100} rdCoins
                  </div>
                  <p className="text-muted-foreground">
                    = ₹{userData?.wallet?.balance || 100} (1 rdCoin = ₹1)
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="rdcoin" className="flex-1">Add Funds</Button>
                    <Button variant="outline" className="flex-1">Withdraw</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium">Welcome Bonus</p>
                        <p className="text-sm text-muted-foreground">Account creation</p>
                      </div>
                      <div className="text-success font-semibold">+100 rdCoins</div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium">Tournament Entry</p>
                        <p className="text-sm text-muted-foreground">BGMI Pro League</p>
                      </div>
                      <div className="text-destructive font-semibold">-50 rdCoins</div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium">Prize Money</p>
                        <p className="text-sm text-muted-foreground">Squad Showdown</p>
                      </div>
                      <div className="text-success font-semibold">+200 rdCoins</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Player Profile</h2>
              <Button variant="gaming-outline">Edit Profile</Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-lg">{userData?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-lg">{userData?.email || "player@bgmi.com"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Type</label>
                    <Badge variant="default">Player</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Member Since</label>
                    <p className="text-lg">January 2024</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle>Gaming Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Matches</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wins</span>
                    <span className="font-semibold text-success">31</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate</span>
                    <span className="font-semibold text-success">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earnings</span>
                    <span className="font-semibold text-gaming-gold">₹15,600</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rank</span>
                    <span className="font-semibold text-primary">Diamond III</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;