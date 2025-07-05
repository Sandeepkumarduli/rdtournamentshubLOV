import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Trophy, Users, Calendar, Target, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useTournamentRegistrations } from '@/hooks/useTournamentRegistrations';
import LoadingSpinner from '@/components/LoadingSpinner';
import TournamentJoinDialog from '@/components/TournamentJoinDialog';
const DashboardHome = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const { toast } = useToast();
  const { tournaments, loading: tournamentsLoading } = useTournaments();
  const { teams, userTeams, loading: teamsLoading } = useTeams();
  const { user } = useAuth();
  const { balance, loading: walletLoading } = useWallet();
  const { registrations, registerForTournament } = useTournamentRegistrations();

  if (tournamentsLoading || teamsLoading || walletLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const filteredTournaments = tournaments.filter(tournament => {
    if (statusFilter !== 'All' && tournament.status !== statusFilter) return false;
    if (dateFilter && tournament.start_date && new Date(tournament.start_date).toISOString().split('T')[0] !== dateFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setStatusFilter('All');
    setDateFilter('');
    setTimeFilter('');
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Refresh data without full page reload
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleJoinTournament = (tournament: any) => {
    if (!user || userTeams.length === 0) {
      toast({
        title: "Team Required",
        description: "You need to create or join a team first to participate in tournaments.",
        variant: "destructive"
      });
      return;
    }
    setSelectedTournament(tournament);
  };

  const handleConfirmJoin = async (tournamentId: string, teamId: string) => {
    const result = await registerForTournament(tournamentId, teamId);
    
    if (result.error) {
      toast({
        title: "Error",
        description: typeof result.error === 'string' ? result.error : 'Failed to join tournament',
        variant: "destructive"
      });
    } else {
      toast({
        title: "Tournament Joined",
        description: "Successfully registered for the tournament!"
      });
    }
  };

  // Check if user is registered for a tournament
  const isRegisteredForTournament = (tournamentId: string) => {
    return registrations.some(reg => reg.tournament_id === tournamentId);
  };

  const registeredCount = registrations.length;
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-lg text-muted-foreground">Welcome back! Ready for some action?</p>
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
                <p className="text-2xl font-bold text-slate-50">{tournaments.filter(t => t.status === 'active').length}</p>
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
                <p className="text-2xl font-bold text-slate-50">{userTeams.length}</p>
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
                <p className="text-2xl font-bold text-success">{registeredCount}</p>
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
                <p className="text-2xl font-bold text-warning">{userTeams.length > 0 ? (userTeams[0].wins || 0) : 0}%</p>
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
        {filteredTournaments.length === 0 ? (
          <Card className="gaming-card">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tournaments Available</h3>
              <p className="text-muted-foreground">
                No tournaments match your current filters or there are no active tournaments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => (
              <Card key={tournament.id} className="gaming-card h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{tournament.name}</CardTitle>
                    <Badge variant={tournament.status === "active" ? "destructive" : "secondary"}>
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prize Pool:</span>
                      <span className="font-semibold text-gaming-gold">₹{tournament.prize_pool}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span className="font-medium">
                        {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'TBA'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Teams:</span>
                      <span className="font-medium">{tournament.max_teams || 'Unlimited'}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Entry Fee:</span>
                      <span className="font-medium">{tournament.entry_fee} rdCoins</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Organization:</span>
                      <Badge variant="secondary" className="text-xs">
                        {tournament.organization || 'Unknown ORG'}
                      </Badge>
                    </div>
                  </div>
                  
                  {tournament.description && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">{tournament.description}</p>
                    </div>
                  )}
                  
                  {isRegisteredForTournament(tournament.id) ? (
                    <Badge variant="default" className="w-full justify-center py-2 text-center">
                      Joined
                    </Badge>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => handleJoinTournament(tournament)}
                    >
                      Join Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tournament Join Dialog */}
      <TournamentJoinDialog
        isOpen={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        tournament={selectedTournament}
        userTeams={userTeams}
        walletBalance={balance?.balance || 0}
        onJoin={handleConfirmJoin}
      />
    </div>;
};
export default DashboardHome;