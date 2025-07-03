import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Plus, Users, Copy, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  members: string[];
  creator: string;
  createdDate: string;
}

const Teams = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { toast } = useToast();

  const currentUser = JSON.parse(localStorage.getItem('userAuth') || '{}');

  useEffect(() => {
    // Load teams from localStorage
    const savedTeams = localStorage.getItem('userTeams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  const saveTeams = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
    localStorage.setItem('userTeams', JSON.stringify(updatedTeams));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Latest team information loaded",
    });
  };

  const generateTeamId = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive"
      });
      return;
    }

    // Check if user already has 2 teams
    const userTeams = teams.filter(team => team.creator === currentUser.username);
    if (userTeams.length >= 2) {
      toast({
        title: "Limit Reached",
        description: "You can only create a maximum of 2 teams",
        variant: "destructive"
      });
      return;
    }

    const newTeam: Team = {
      id: generateTeamId(),
      name: teamName,
      members: [currentUser.username],
      creator: currentUser.username,
      createdDate: new Date().toISOString().split('T')[0]
    };

    const updatedTeams = [...teams, newTeam];
    saveTeams(updatedTeams);
    setTeamName('');
    setIsCreateDialogOpen(false);

    toast({
      title: "Team Created",
      description: `Team "${teamName}" created successfully! Team ID: ${newTeam.id}`,
    });
  };

  const handleJoinTeam = () => {
    if (!joinTeamId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team ID",
        variant: "destructive"
      });
      return;
    }

    const team = teams.find(t => t.id === joinTeamId.toUpperCase());
    if (!team) {
      toast({
        title: "Team Not Found",
        description: "No team found with this ID",
        variant: "destructive"
      });
      return;
    }

    if (team.members.includes(currentUser.username)) {
      toast({
        title: "Already a Member",
        description: "You are already a member of this team",
        variant: "destructive"
      });
      return;
    }

    if (team.members.length >= 5) {
      toast({
        title: "Team Full",
        description: "This team already has the maximum of 5 members",
        variant: "destructive"
      });
      return;
    }

    const updatedTeams = teams.map(t => 
      t.id === team.id 
        ? { ...t, members: [...t.members, currentUser.username] }
        : t
    );

    saveTeams(updatedTeams);
    setJoinTeamId('');
    setIsJoinDialogOpen(false);

    toast({
      title: "Joined Team",
      description: `Successfully joined team "${team.name}"`,
    });
  };

  const copyTeamId = (teamId: string) => {
    navigator.clipboard.writeText(teamId);
    toast({
      title: "Copied",
      description: "Team ID copied to clipboard",
    });
  };

  const userTeams = teams.filter(team => team.members.includes(currentUser.username));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">My Teams</h1>
          <p className="text-lg text-muted-foreground">Create and manage your gaming teams</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateTeam} className="flex-1">
                  Create Team
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <UserPlus className="h-4 w-4" />
              Join Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamId">Team ID</Label>
                <Input
                  id="teamId"
                  value={joinTeamId}
                  onChange={(e) => setJoinTeamId(e.target.value)}
                  placeholder="Enter team ID"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleJoinTeam} className="flex-1">
                  Join Team
                </Button>
                <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {userTeams.length === 0 ? (
          <Card className="gaming-card">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a team or join an existing one to start competing in tournaments.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="default" onClick={() => setIsCreateDialogOpen(true)}>
                  Create Team
                </Button>
                <Button variant="outline" onClick={() => setIsJoinDialogOpen(true)}>
                  Join Team
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          userTeams.map((team) => (
            <Card key={team.id} className="gaming-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {team.name}
                    {team.creator === currentUser.username && (
                      <Badge variant="default">Creator</Badge>
                    )}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyTeamId(team.id)}
                  >
                    <Copy className="h-4 w-4" />
                    {team.id}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-semibold">{team.members.length}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-semibold">{team.createdDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Creator</p>
                      <p className="font-semibold">{team.creator}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Team Members</p>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((member, index) => (
                        <Badge key={index} variant="secondary">
                          {member}
                        </Badge>
                      ))}
                    </div>
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

export default Teams;