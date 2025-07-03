import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Trophy, Calendar, Users, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Tournaments = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const { toast } = useToast();

  // Mock registered tournaments - would come from API
  const registeredTournaments = [
    {
      id: 1,
      name: "BGMI Pro League",
      status: "Active",
      registrationDate: "2024-01-15",
      matchDate: "2024-01-20",
      matchTime: "18:00",
      prize: "₹50,000",
      type: "Squad",
      participants: 156,
      maxSlots: 200,
      entryFee: 100,
      minTeamSize: 4,
      roomId: "",
      password: ""
    },
    {
      id: 2,
      name: "Weekly Championship",
      status: "Upcoming",
      registrationDate: "2024-01-16",
      matchDate: "2024-01-25",
      matchTime: "20:00",
      prize: "₹25,000",
      type: "Duo",
      participants: 89,
      maxSlots: 150,
      entryFee: 50,
      minTeamSize: 2,
      roomId: "",
      password: ""
    }
  ];

  const filteredTournaments = registeredTournaments.filter(tournament => {
    if (statusFilter !== 'All' && tournament.status !== statusFilter) return false;
    if (dateFilter && tournament.matchDate !== dateFilter) return false;
    if (timeFilter && tournament.matchTime !== timeFilter) return false;
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
      description: "Latest tournament information loaded",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tournaments</h1>
          <p className="text-muted-foreground">View and manage your tournament registrations</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Registered Tournaments */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Registered Tournaments</h2>
          
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
                    <Badge variant={tournament.status === "Active" ? "default" : "secondary"}>
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
                      <span className="font-medium">{tournament.matchDate} at {tournament.matchTime}</span>
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
                  
                  {/* Room Details */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor={`roomId-${tournament.id}`} className="text-sm font-medium">Room ID</Label>
                      <Input
                        id={`roomId-${tournament.id}`}
                        value={tournament.roomId}
                        placeholder="Will be provided by admin"
                        disabled
                        className="text-center font-mono"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`password-${tournament.id}`} className="text-sm font-medium">Password</Label>
                      <Input
                        id={`password-${tournament.id}`}
                        value={tournament.password}
                        placeholder="Will be provided by admin"
                        disabled
                        className="text-center font-mono"
                      />
                    </div>
                  </div>
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