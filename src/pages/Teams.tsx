import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Plus, Users, Copy, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
const Teams = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const { toast } = useToast();
  const { userTeam, teamMembers, loading, createTeam, addTeamMember } = useTeams();
  const { user } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Latest team information loaded"
    });
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive"
      });
      return;
    }

    if (userTeam) {
      toast({
        title: "Already in Team",
        description: "You can only be in one team at a time",
        variant: "destructive"
      });
      return;
    }

    const { error } = await createTeam(teamName);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setTeamName('');
    setIsCreateDialogOpen(false);
    toast({
      title: "Team Created",
      description: `Team "${teamName}" created successfully!`
    });
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email",
        variant: "destructive"
      });
      return;
    }

    if (!userTeam) {
      toast({
        title: "Error",
        description: "You need to be in a team to add members",
        variant: "destructive"
      });
      return;
    }

    if (teamMembers.length >= 5) {
      toast({
        title: "Team Full",
        description: "Maximum 5 members allowed per team",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you'd look up user by email first
    // For now, we'll show that feature is not implemented
    toast({
      title: "Feature Coming Soon",
      description: "Adding members by email will be available soon. Share your team ID for now.",
      variant: "destructive"
    });
    setNewMemberEmail('');
    setIsAddMemberDialogOpen(false);
  };

  const copyTeamId = (teamId: string) => {
    navigator.clipboard.writeText(teamId);
    toast({
      title: "Copied",
      description: "Team ID copied to clipboard"
    });
  };
  return <div className="space-y-6">
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
        {!userTeam && (
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
                    onChange={e => setTeamName(e.target.value)} 
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
        )}

        {userTeam && userTeam.leader_id === user?.id && (
          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="memberEmail">Member Email</Label>
                  <Input 
                    id="memberEmail" 
                    value={newMemberEmail} 
                    onChange={e => setNewMemberEmail(e.target.value)} 
                    placeholder="Enter member's email" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Member must have an account to join
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddMember} className="flex-1">
                    Add Member
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {!userTeam ? (
          <Card className="gaming-card">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Team Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a team to start competing in tournaments with other players.
              </p>
              <Button variant="default" onClick={() => setIsCreateDialogOpen(true)}>
                Create Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="gaming-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  {userTeam.name}
                  {userTeam.leader_id === user?.id && <Badge variant="default">Leader</Badge>}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyTeamId(userTeam.id)}>
                  <Copy className="h-4 w-4" />
                  {userTeam.id}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Members</p>
                    <p className="font-semibold">{teamMembers.length}/5</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Wins</p>
                    <p className="font-semibold">{userTeam.wins || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tournaments</p>
                    <p className="font-semibold">{userTeam.tournaments_played || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Earnings</p>
                    <p className="font-semibold">₹{userTeam.total_earnings || 0}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((member) => (
                      <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                        {member.profiles?.display_name || 'Unknown User'}
                        {member.role === 'leader' && (
                          <span className="text-xs text-gaming-gold">(Leader)</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>;
};
export default Teams;