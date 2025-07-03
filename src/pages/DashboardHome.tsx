import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trophy, Users, Calendar, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DashboardHome = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const mockTournaments = [
    { 
      id: 1, 
      name: "BGMI Pro League", 
      status: "Live", 
      prize: "₹50,000", 
      participants: 156,
      type: "Squad",
      minTeamSize: 4,
      entryFee: 100
    },
    { 
      id: 2, 
      name: "Weekly Championship", 
      status: "Upcoming", 
      prize: "₹25,000", 
      participants: 89,
      type: "Duo",
      minTeamSize: 2,
      entryFee: 50
    },
    { 
      id: 3, 
      name: "Solo Masters", 
      status: "Upcoming", 
      prize: "₹15,000", 
      participants: 200,
      type: "Solo",
      minTeamSize: 0,
      entryFee: 25
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Latest tournament information loaded",
    });
  };

  const handleJoinTournament = (tournament: any) => {
    if (tournament.type === "Squad" && tournament.minTeamSize > 0) {
      toast({
        title: "Team Required",
        description: `You need a team with at least ${tournament.minTeamSize} members to join this ${tournament.type} tournament.`,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Tournament Joined",
      description: `Successfully registered for ${tournament.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Ready for some action?</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tournaments</p>
                <p className="text-2xl font-bold text-primary">3</p>
              </div>
              <Trophy className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Teams</p>
                <p className="text-2xl font-bold text-accent">0</p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registered</p>
                <p className="text-2xl font-bold text-success">0</p>
              </div>
              <Calendar className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-warning">0%</p>
              </div>
              <Target className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Tournaments */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Tournaments</h2>
        
        <div className="grid gap-4">
          {mockTournaments.map((tournament) => (
            <Card key={tournament.id} className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{tournament.name}</h3>
                      <Badge variant={tournament.status === "Live" ? "destructive" : "secondary"}>
                        {tournament.status}
                      </Badge>
                      <Badge variant="outline">{tournament.type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Prize: {tournament.prize}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tournament.participants} participants
                      </div>
                      <div>
                        Entry Fee: {tournament.entryFee} rdCoins
                      </div>
                      {tournament.minTeamSize > 0 && (
                        <div>
                          Min Team Size: {tournament.minTeamSize}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="gaming-outline"
                    onClick={() => handleJoinTournament(tournament)}
                  >
                    {tournament.status === "Live" ? "Join Now" : "Register"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;