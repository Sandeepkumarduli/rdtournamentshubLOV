import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  Eye, 
  RefreshCw,
  Trophy,
  Target,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

const SystemTeams = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const teamsPerPage = 20;

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
    
    setLoading(false);
  }, [navigate]);

  const handleDeleteTeam = (teamId: number) => {
    toast({
      title: "Team Deleted",
      description: "Team has been permanently removed from the platform",
      variant: "destructive"
    });
  };

  const handleViewTeam = (team: any) => {
    setSelectedTeam(team);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Generate more mock teams for pagination
  const generateMockTeams = () => {
    const teams = [];
    for (let i = 1; i <= 50; i++) {
      teams.push({
        id: i,
        name: `Team ${i}`,
        leader: `Leader${i}`,
        members: [`Leader${i}`, `Player${i}A`, `Player${i}B`, `Player${i}C`].slice(0, Math.floor(Math.random() * 4) + 1),
        tournaments: Math.floor(Math.random() * 20) + 1,
        wins: Math.floor(Math.random() * 15),
        created: new Date(2024, 0, i % 30 + 1).toISOString().split('T')[0],
        status: i % 6 === 0 ? "Inactive" : "Active",
        totalEarnings: Math.floor(Math.random() * 50000) + 1000
      });
    }
    return teams;
  };

  const mockTeams = [
    { 
      id: 1, 
      name: "Thunder Squads", 
      leader: "PlayerOne", 
      members: ["PlayerOne", "PlayerTwo", "PlayerThree", "PlayerFour"], 
      tournaments: 12, 
      wins: 8, 
      created: "2024-01-15",
      status: "Active",
      totalEarnings: 15000
    },
    { 
      id: 2, 
      name: "Elite Legends", 
      leader: "GamerPro", 
      members: ["GamerPro", "SquadMate1", "SquadMate2"], 
      tournaments: 8, 
      wins: 5, 
      created: "2024-01-20",
      status: "Active",
      totalEarnings: 8500
    },
    { 
      id: 3, 
      name: "Night Hunters", 
      leader: "NightOwl", 
      members: ["NightOwl", "Hunter1"], 
      tournaments: 15, 
      wins: 12, 
      created: "2024-01-10",
      status: "Active",
      totalEarnings: 22000
    },
    { 
      id: 4, 
      name: "Victory Kings", 
      leader: "KingPlayer", 
      members: ["KingPlayer"], 
      tournaments: 5, 
      wins: 2, 
      created: "2024-01-25",
      status: "Inactive",
      totalEarnings: 3000
    },
    ...generateMockTeams()
  ];

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);
  const startIndex = (currentPage - 1) * teamsPerPage;
  const paginatedTeams = filteredTeams.slice(startIndex, startIndex + teamsPerPage);

  const totalTeams = mockTeams.length;
  const activeTeams = mockTeams.filter(team => team.status === "Active").length;
  const totalTournaments = mockTeams.reduce((sum, team) => sum + team.tournaments, 0);

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Teams Management</h1>
                <p className="text-muted-foreground">Monitor all platform teams</p>
              </div>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Teams</p>
                    <p className="text-2xl font-bold text-primary">{totalTeams}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Teams</p>
                    <p className="text-2xl font-bold text-success">{activeTeams}</p>
                  </div>
                  <Target className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tournaments</p>
                    <p className="text-2xl font-bold">{totalTournaments}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Team Size</p>
                    <p className="text-2xl font-bold">
                      {(mockTeams.reduce((sum, team) => sum + team.members.length, 0) / totalTeams).toFixed(1)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-gaming-gold" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams by name, leader, or members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Teams List */}
          <div className="space-y-4">
            {paginatedTeams.map((team) => (
              <Card key={team.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{team.name}</h3>
                        <Badge variant={team.status === "Active" ? "default" : "secondary"}>
                          {team.status}
                        </Badge>
                        <Badge variant="outline">{team.members.length} Members</Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Leader:</span>
                          <div className="font-medium">{team.leader}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <div className="font-medium">{team.created}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tournaments:</span>
                          <div className="font-medium">{team.tournaments}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Wins:</span>
                          <div className="font-medium text-success">{team.wins}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Win Rate:</span>
                          <div className="font-medium">
                            {team.tournaments > 0 ? Math.round((team.wins / team.tournaments) * 100) : 0}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Earnings:</span>
                          <div className="font-medium text-gaming-gold">₹{team.totalEarnings.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <span className="text-sm text-muted-foreground">Members:</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {team.members.map((member, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {member}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewTeam(team)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paginatedTeams.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No teams found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + teamsPerPage, filteredTeams.length)} of {filteredTeams.length} teams
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Team Details Dialog */}
        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Team Details - {selectedTeam?.name}</DialogTitle>
            </DialogHeader>
            {selectedTeam && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Team Leader:</span>
                    <div className="font-medium">{selectedTeam.leader}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="font-medium">{selectedTeam.status}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <div className="font-medium">{selectedTeam.created}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Total Earnings:</span>
                    <div className="font-medium text-gaming-gold">₹{selectedTeam.totalEarnings?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tournaments:</span>
                    <div className="font-medium">{selectedTeam.tournaments}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Wins:</span>
                    <div className="font-medium text-success">{selectedTeam.wins}</div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Team Members:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTeam.members?.map((member: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SystemTeams;