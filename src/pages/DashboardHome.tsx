import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Trophy, Users, Calendar, Target, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const DashboardHome = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const { toast } = useToast();
  const mockTournaments = [{
    id: 1,
    name: "BGMI Pro League",
    status: "Live",
    prize: "₹50,000",
    participants: 156,
    maxSlots: 200,
    type: "Squad",
    minTeamSize: 4,
    entryFee: 100,
    date: "2024-01-20",
    time: "18:00"
  }, {
    id: 2,
    name: "Weekly Championship",
    status: "Upcoming",
    prize: "₹25,000",
    participants: 89,
    maxSlots: 150,
    type: "Duo",
    minTeamSize: 2,
    entryFee: 50,
    date: "2024-01-25",
    time: "20:00"
  }, {
    id: 3,
    name: "Solo Masters",
    status: "Upcoming",
    prize: "₹15,000",
    participants: 200,
    maxSlots: 300,
    type: "Solo",
    minTeamSize: 0,
    entryFee: 25,
    date: "2024-01-22",
    time: "16:00"
  }, {
    id: 4,
    name: "Squad Elimination",
    status: "Live",
    prize: "₹75,000",
    participants: 120,
    maxSlots: 160,
    type: "Squad",
    minTeamSize: 4,
    entryFee: 150,
    date: "2024-01-20",
    time: "19:00"
  }, {
    id: 5,
    name: "Duo Challenge",
    status: "Upcoming",
    prize: "₹30,000",
    participants: 64,
    maxSlots: 100,
    type: "Duo",
    minTeamSize: 2,
    entryFee: 75,
    date: "2024-01-23",
    time: "17:30"
  }, {
    id: 6,
    name: "Solo Championship",
    status: "Upcoming",
    prize: "₹20,000",
    participants: 180,
    maxSlots: 250,
    type: "Solo",
    minTeamSize: 0,
    entryFee: 40,
    date: "2024-01-24",
    time: "15:00"
  }];

  const filteredTournaments = mockTournaments.filter(tournament => {
    if (statusFilter !== 'All' && tournament.status !== statusFilter) return false;
    if (dateFilter && tournament.date !== dateFilter) return false;
    if (timeFilter && tournament.time !== timeFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setStatusFilter('All');
    setDateFilter('');
    setTimeFilter('');
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Latest tournament information loaded"
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
      description: `Successfully registered for ${tournament.name}`
    });
  };
  return <div className="space-y-6">
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
                <p className="text-2xl font-bold text-slate-50">3</p>
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
                <p className="text-2xl font-bold text-slate-50">0</p>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Tournaments</h2>
          
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Live">Live</SelectItem>
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
            
            <Input
              type="time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-32"
              placeholder="Time Filter"
            />
            
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
        
        {/* Tournament Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <Card key={tournament.id} className="gaming-card h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{tournament.name}</CardTitle>
                  <Badge variant={tournament.status === "Live" ? "destructive" : "secondary"}>
                    {tournament.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prize Pool:</span>
                    <span className="font-semibold text-gaming-gold">{tournament.prize}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-medium">{tournament.date} at {tournament.time}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slots:</span>
                    <span className="font-medium">{tournament.participants}/{tournament.maxSlots}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entry Fee:</span>
                    <span className="font-medium">{tournament.entryFee} rdCoins</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{tournament.type}</Badge>
                      {tournament.minTeamSize > 0 && (
                        <span className="text-xs text-muted-foreground">Min: {tournament.minTeamSize}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => handleJoinTournament(tournament)}
                >
                  {tournament.status === "Live" ? "Join Now" : "Register"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>;
};
export default DashboardHome;