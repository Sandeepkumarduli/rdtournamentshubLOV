import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Trophy, Calendar, Users, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
import { useTournamentRegistrations } from '@/hooks/useTournamentRegistrations';
import LoadingSpinner from '@/components/LoadingSpinner';

const Tournaments = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const { toast } = useToast();
  const { tournaments, loading: tournamentsLoading } = useTournaments();
  const { registrations, loading: registrationsLoading } = useTournamentRegistrations();

  const loading = tournamentsLoading || registrationsLoading;

  // Filter to show only registered tournaments
  const registeredTournaments = registrations.map(reg => reg.tournaments).filter(Boolean);

  const filteredTournaments = registeredTournaments.filter(tournament => {
    if (statusFilter !== 'All' && tournament.status !== statusFilter) return false;
    if (dateFilter && tournament.start_date) {
      const tournamentDate = new Date(tournament.start_date).toISOString().split('T')[0];
      if (tournamentDate !== dateFilter) return false;
    }
    if (timeFilter && tournament.start_date) {
      const tournamentTime = new Date(tournament.start_date).toTimeString().split(':').slice(0, 2).join(':');
      if (tournamentTime !== timeFilter) return false;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const clearFilters = () => {
    setStatusFilter('All');
    setDateFilter('');
    setTimeFilter('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger data refresh without page reload
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">My Tournaments</h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground">View and manage your tournament registrations</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs md:text-sm w-full sm:w-auto" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="ml-1">Refresh</span>
        </Button>
      </div>

      {/* Registered Tournaments */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg md:text-xl font-semibold">My Registered Tournaments</h2>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-24 md:w-32 text-xs md:text-sm h-8 md:h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-32 md:w-40 text-xs md:text-sm h-8 md:h-10"
              placeholder="Date Filter"
            />
            
            <Input
              type="time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-28 md:w-32 text-xs md:text-sm h-8 md:h-10"
              placeholder="Time Filter"
            />
            
            <Button variant="outline" onClick={clearFilters} size="sm" className="text-xs md:text-sm">
              <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        {filteredTournaments.length === 0 ? (
          <Card className="gaming-card">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tournaments Found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'All' || dateFilter || timeFilter 
                  ? "No tournaments match your current filters."
                  : "You haven't registered for any tournaments yet. Go to Dashboard to join available tournaments."
                }
              </p>
              <Button variant="default">Browse Tournaments</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <Card key={tournament.id} className="gaming-card h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{tournament.name}</CardTitle>
                    <Badge variant={tournament.status === "active" ? "default" : "secondary"}>
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Organization:</span>
                       <span className="font-medium text-primary">{tournament.organization || 'N/A'}</span>
                     </div>
                     
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool:</span>
                        <span className="font-semibold text-gaming-gold">{tournament.prize_pool} rdCoins</span>
                      </div>
                     
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Start Date & Time:</span>
                        <span className="font-medium">
                          {tournament.start_date 
                            ? `${new Date(tournament.start_date).toLocaleDateString()} at ${new Date(tournament.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'TBA'
                          }
                        </span>
                      </div>
                     
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="font-medium">{tournament.entry_fee} rdCoins</span>
                      </div>
                     
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Game:</span>
                       <Badge variant="outline">{tournament.game_type}</Badge>
                     </div>
                   </div>
                  
                  {/* Room Details */}
                  <div className="pt-2 border-t border-border">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Room ID:</span>
                        <span className="font-medium text-gaming-gold">
                          {tournament.room_id || 'TBA'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Room Password:</span>
                        <span className="font-medium text-gaming-gold">
                          {tournament.room_password || 'TBA'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {tournament.description && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">{tournament.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;