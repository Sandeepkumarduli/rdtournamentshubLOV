import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CreateTournamentDialog from '@/components/CreateTournamentDialog';
import UpdateRoomDialog from '@/components/admin/UpdateRoomDialog';
import { useAdminTournaments } from '@/hooks/useAdminTournaments';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface AdminTournamentsTabProps {
  onRefresh: () => void;
}

const AdminTournamentsTab = ({ onRefresh }: AdminTournamentsTabProps) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const { tournaments, loading, refetch } = useAdminTournaments();
  const { toast } = useToast();

  const handleDeleteTournament = async (tournamentId: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) throw error;

      toast({
        title: "Tournament Deleted",
        description: "Tournament has been successfully deleted",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast({
        title: "Error",
        description: "Failed to delete tournament",
        variant: "destructive"
      });
    }
  };

  const handleEditTournament = (tournamentId: string) => {
    // For now, just show a message that edit functionality is coming soon
    toast({
      title: "Edit Tournament",
      description: "Edit functionality coming soon. Use Update Room dialog for now.",
    });
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (statusFilter !== 'All' && tournament.status !== statusFilter) return false;
    if (dateFilter && tournament.startDate !== dateFilter) return false;
    return true;
  });

  const handleRefresh = async () => {
    await refetch();
    onRefresh();
    toast({
      title: "Data Fetched Successfully",
      description: "Tournaments data has been refreshed",
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const clearFilters = () => {
    setStatusFilter('All');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ORG Tournaments</h2>
        <div className="flex gap-2">
          <CreateTournamentDialog />
          <Button variant="outline" onClick={handleRefresh}>
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
                <Badge variant={tournament.status === "Live" ? "destructive" : tournament.status === "Completed" ? "secondary" : "default"}>
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
                  <span className="text-muted-foreground">Entry Fee:</span>
                  <span className="font-medium">₹{tournament.entryFee.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">{tournament.startDate}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Time:</span>
                  <span className="font-medium">{tournament.startTime}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Game Mode:</span>
                  <span className="font-medium">{tournament.gameType}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Teams:</span>
                  <span className="font-medium">{tournament.maxTeams || 'Unlimited'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Registered:</span>
                  <span className="font-medium">{tournament.participants}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Room Status:</span>
                  <span className={`font-medium ${tournament.roomId ? 'text-success' : 'text-warning'}`}>
                    {tournament.roomId ? 'Ready' : 'Needs Update'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ORG:</span>
                  <span className="font-medium text-primary">{tournament.org}</span>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <UpdateRoomDialog 
                  tournamentId={tournament.id}
                  currentRoomId={tournament.roomId}
                  currentRoomPassword={tournament.roomPassword}
                  onUpdate={refetch}
                />
                <Button variant="outline" size="sm" onClick={() => handleEditTournament(tournament.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteTournament(tournament.id)}>
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

export default AdminTournamentsTab;