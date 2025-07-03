import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trophy, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Tournaments = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Mock registered tournaments - would come from API
  const registeredTournaments = [
    {
      id: 1,
      name: "BGMI Pro League",
      status: "Active",
      registrationDate: "2024-01-15",
      matchDate: "2024-01-20",
      prize: "₹50,000",
      type: "Squad"
    }
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
      <div className="space-y-4">
        {registeredTournaments.length === 0 ? (
          <Card className="gaming-card">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tournaments Registered</h3>
              <p className="text-muted-foreground mb-4">
                You haven't registered for any tournaments yet. Go to Dashboard to join available tournaments.
              </p>
              <Button variant="gaming">Browse Tournaments</Button>
            </CardContent>
          </Card>
        ) : (
          registeredTournaments.map((tournament) => (
            <Card key={tournament.id} className="gaming-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {tournament.name}
                    <Badge variant={tournament.status === "Active" ? "default" : "secondary"}>
                      {tournament.status}
                    </Badge>
                    <Badge variant="outline">{tournament.type}</Badge>
                  </CardTitle>
                  <Button variant="gaming-outline">View Details</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Registered</p>
                    <p className="font-semibold">{tournament.registrationDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Match Date</p>
                    <p className="font-semibold">{tournament.matchDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prize Pool</p>
                    <p className="font-semibold text-gaming-gold">{tournament.prize}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-semibold text-success">Confirmed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Tournaments;