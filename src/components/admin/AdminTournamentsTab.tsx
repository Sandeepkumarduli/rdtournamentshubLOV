import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Edit, Trash2, X } from 'lucide-react';
import CreateTournamentDialog from '@/components/CreateTournamentDialog';
import { useAdminTournaments } from '@/hooks/useAdminTournaments';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AdminTournamentsTabProps {
  onRefresh: () => void;
}

const AdminTournamentsTab = ({ onRefresh }: AdminTournamentsTabProps) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const { tournaments, loading, refetch } = useAdminTournaments();

  const filteredTournaments = tournaments.filter(tournament => {
    if (statusFilter !== 'All' && tournament.status !== statusFilter) return false;
    if (dateFilter && tournament.startDate !== dateFilter) return false;
    return true;
  });

  const handleRefresh = () => {
    refetch();
    onRefresh();
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
                  <span className="font-medium text-primary">{tournament.org}</span>
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

export default AdminTournamentsTab;