import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { RefreshCw, Trophy, Users, Calendar, Target, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useTournamentRegistrations } from '@/hooks/useTournamentRegistrations';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import TournamentJoinDialog from '@/components/TournamentJoinDialog';
import FrozenAccountBanner from '@/components/FrozenAccountBanner';
import { Link } from 'react-router-dom';
import { BookOpen, FileText } from 'lucide-react';
const DashboardHome = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateTimeFilter, setDateTimeFilter] = useState<Date | undefined>(undefined);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const { toast } = useToast();
  const { tournaments, loading: tournamentsLoading, refetch: refetchTournaments } = useTournaments();
  console.log('🏠 DashboardHome - tournaments loaded:', tournaments.length, 'loading:', tournamentsLoading);
  const { teams, userTeams, teamMembersMap, loading: teamsLoading } = useTeams();
  const { user, isFrozen, isFullyVerified } = useAuth();
  console.log('🏠 DashboardHome - user from useAuth:', user?.id);
  const { profile } = useProfile();
  const { balance, loading: walletLoading } = useWallet();
  const { registrations, registerForTournament, refreshRegistrations } = useTournamentRegistrations();

  if (tournamentsLoading || teamsLoading || walletLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const filteredTournaments = tournaments.filter(tournament => {
    // Map filter values to database status values
    if (statusFilter !== 'All') {
      const statusMap: { [key: string]: string } = {
        'Live': 'active',
        'Upcoming': 'upcoming'
      };
      const dbStatus = statusMap[statusFilter];
      if (tournament.status !== dbStatus) return false;
    }
    if (dateTimeFilter && tournament.start_date) {
      const tournamentDate = new Date(tournament.start_date);
      const filterDate = new Date(dateTimeFilter);
      
      // Compare dates (same day)
      const tournamentDateOnly = new Date(tournamentDate.getFullYear(), tournamentDate.getMonth(), tournamentDate.getDate());
      const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
      
      if (tournamentDateOnly.getTime() !== filterDateOnly.getTime()) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setStatusFilter('All');
    setDateTimeFilter(undefined);
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Fetch all data from database
      await Promise.all([
        refetchTournaments(),
        refreshRegistrations()
      ]);
      
      toast({
        title: "Data Refreshed",
        description: "All tournament data has been successfully updated",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleJoinTournament = (tournament: any) => {
    if (isFrozen) {
      toast({
        title: "Account Frozen",
        description: "Your account is frozen. You cannot join tournaments. Contact support to resolve.",
        variant: "destructive"
      });
      return;
    }

    if (!isFullyVerified) {
      toast({
        title: "Verification Required",
        description: "You must verify both your email and phone number before joining tournaments. Please complete verification in your profile.",
        variant: "destructive"
      });
      return;
    }
    
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
  
  return <div className="space-y-4 md:space-y-6">
      {/* Frozen Account Banner */}
      <FrozenAccountBanner />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground">Welcome back! Ready for some action?</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs md:text-sm" asChild>
            <Link to="/tournament-guide">
              <BookOpen className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Tournament Guide</span>
              <span className="sm:hidden">Guide</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs md:text-sm" asChild>
            <Link to="/rules">
              <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Rules
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs md:text-sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-1 md:ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="gaming-card">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Active</p>
                <p className="text-lg md:text-2xl font-bold text-slate-50">{tournaments.filter(t => t.status === 'active').length}</p>
              </div>
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">My Teams</p>
                <p className="text-lg md:text-2xl font-bold text-slate-50">{userTeams.length}</p>
              </div>
              <Users className="h-6 w-6 md:h-8 md:w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Registered</p>
                <p className="text-lg md:text-2xl font-bold text-success">{registeredCount}</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Win Rate</p>
                <p className="text-lg md:text-2xl font-bold text-warning">{userTeams.length > 0 ? (userTeams[0].wins || 0) : 0}%</p>
              </div>
              <Target className="h-6 w-6 md:h-8 md:w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Tournaments */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold">Available Tournaments</h2>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-24 md:w-32 text-xs md:text-sm h-8 md:h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Live">Live</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm justify-start text-left font-normal w-auto max-w-[200px]"
                >
                  <Calendar className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">{dateTimeFilter ? format(dateTimeFilter, "PPP") : "Date"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateTimeFilter}
                  onSelect={setDateTimeFilter}
                  initialFocus
                  className="p-3 pointer-events-auto bg-card"
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" onClick={clearFilters} size="sm" className="text-xs md:text-sm">
              <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Clear</span>
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
                      <span className="font-semibold text-gaming-gold">{tournament.prize_pool} rdCoins</span>
                    </div>
                    
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Date & Time:</span>
                       <span className="font-medium">
                         {tournament.start_date 
                           ? `${new Date(tournament.start_date).toLocaleDateString()} at ${new Date(tournament.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                           : 'TBA'
                         }
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
                      disabled={isFrozen || !isFullyVerified}
                    >
                      {isFrozen ? 'Account Frozen' : !isFullyVerified ? 'Verify Account' : 'Join Now'}
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
        teamMembersMap={teamMembersMap}
        walletBalance={balance?.balance || 0}
        onJoin={handleConfirmJoin}
      />
    </div>;
};
export default DashboardHome;