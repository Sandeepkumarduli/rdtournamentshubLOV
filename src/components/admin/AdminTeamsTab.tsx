import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Ban, UserX } from 'lucide-react';
interface AdminTeamsTabProps {
  onRefresh: () => void;
}
const AdminTeamsTab = ({
  onRefresh
}: AdminTeamsTabProps) => {
  const mockTeams = [{
    id: 1,
    name: "FireStorm",
    leader: "PlayerOne",
    members: 4,
    status: "Approved",
    wins: 12
  }, {
    id: 2,
    name: "ThunderBolts",
    leader: "GamerPro",
    members: 3,
    status: "Pending",
    wins: 8
  }, {
    id: 3,
    name: "NightRiders",
    leader: "SquadLeader",
    members: 4,
    status: "Rejected",
    wins: 5
  }];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh Teams
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockTeams.map(team => <Card key={team.id} className="gaming-card py-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{team.name}</h3>
                    <Badge variant={team.status === "Approved" ? "default" : team.status === "Pending" ? "secondary" : "destructive"}>
                      {team.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Leader: {team.leader}</div>
                    <div>Members: {team.members}/4</div>
                    <div>Wins: {team.wins}</div>
                    <div>Status: {team.status}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm">
                    <Ban className="h-4 w-4 mr-2" />
                    Ban Team
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserX className="h-4 w-4 mr-2" />
                    Remove from ORG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
};
export default AdminTeamsTab;