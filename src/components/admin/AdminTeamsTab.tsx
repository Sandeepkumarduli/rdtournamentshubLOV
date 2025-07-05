import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Ban, UserX } from 'lucide-react';
import { useOrgTeams } from '@/hooks/useOrgTeams';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import PopulateRegistrationsButton from '@/components/PopulateRegistrationsButton';

interface AdminTeamsTabProps {
  onRefresh: () => void;
}

const AdminTeamsTab = ({ onRefresh }: AdminTeamsTabProps) => {
  const { teams, loading, refetch, banTeam, unbanTeam } = useOrgTeams();
  const { toast } = useToast();

  const handleRefresh = async () => {
    onRefresh();
    await refetch();
    toast({
      title: "Teams Updated",
      description: "Teams loaded successfully for this organization",
    });
  };

  const handleBanTeam = async (teamId: string, currentStatus: string) => {
    const result = currentStatus === 'active' 
      ? await banTeam(teamId)
      : await unbanTeam(teamId);
    
    if (result.success) {
      toast({
        title: currentStatus === 'active' ? 'Team Banned' : 'Team Unbanned',
        description: `Team has been ${currentStatus === 'active' ? 'banned from' : 'unbanned from'} organization tournaments`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update team status',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tournament Teams</h2>
        <div className="flex gap-2">
          <PopulateRegistrationsButton />
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh Teams
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {teams.map(team => (
          <Card key={team.id} className="gaming-card py-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{team.name}</h3>
                    <Badge variant={team.status === "active" ? "default" : "destructive"}>
                      {team.status === "active" ? "Active" : "Banned"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Leader: {team.leader_name}</div>
                    <div>Tournaments: {team.tournaments_played || 0}</div>
                    <div>Wins: {team.wins || 0}</div>
                    <div>Earnings: ₹{team.total_earnings || 0}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={team.status === "active" ? "destructive" : "default"} 
                    size="sm"
                    onClick={() => handleBanTeam(team.id, team.status)}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {team.status === "active" ? "Ban Team" : "Unban Team"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserX className="h-4 w-4 mr-2" />
                    Remove from ORG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>;
};
export default AdminTeamsTab;