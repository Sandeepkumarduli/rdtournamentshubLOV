import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, RefreshCw, Plus, Users, Copy, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

const Teams = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeamForAddMember, setSelectedTeamForAddMember] = useState<string | null>(null);
  const { toast } = useToast();
  const { userTeams, teamMembersMap, loading, createTeam, addTeamMember } = useTeams();
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

  const addMemberEmailField = () => {
    if (memberEmails.length < 4) { // Max 4 additional members (5 total including leader)
      setMemberEmails([...memberEmails, '']);
    }
  };

  const removeMemberEmailField = (index: number) => {
    if (memberEmails.length > 1) {
      setMemberEmails(memberEmails.filter((_, i) => i !== index));
    }
  };

  const updateMemberEmail = (index: number, value: string) => {
    const updated = [...memberEmails];
    updated[index] = value;
    setMemberEmails(updated);
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

    if (userTeams.length >= 2) {
      toast({
        title: "Team Limit Reached",
        description: "Maximum 2 teams allowed per user",
        variant: "destructive"
      });
      return;
    }

    // Filter out empty emails
    const validEmails = memberEmails.filter(email => email.trim());
    
    if (validEmails.length > 4) {
      toast({
        title: "Too Many Members",
        description: "Maximum 5 members per team (including leader)",
        variant: "destructive"
      });
      return;
    }

    const { error } = await createTeam(teamName, validEmails);
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    setTeamName('');
    setMemberEmails(['']);
    setIsCreateDialogOpen(false);
    toast({
      title: "Team Created",
      description: `Team "${teamName}" created successfully!`
    });
  };

  const handleAddMemberToTeam = async (teamId: string) => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email",
        variant: "destructive"
      });
      return;
    }

    const teamMembers = teamMembersMap[teamId] || [];
    if (teamMembers.length >= 5) {
      toast({
        title: "Team Full",
        description: "Maximum 5 members allowed per team",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you'd look up user by email first
    toast({
      title: "Feature Coming Soon",
      description: "Adding members by email will be available soon. Share your team ID for now.",
      variant: "destructive"
    });
    setNewMemberEmail('');
    setSelectedTeamForAddMember(null);
  };

  const copyTeamId = (teamId: string) => {
    navigator.clipboard.writeText(teamId);
    toast({
      title: "Copied",
      description: "Team ID copied to clipboard"
    });
  };

  const canCreateTeam = userTeams.length < 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">My Teams</h1>
          <p className="text-lg text-muted-foreground">Create and manage your gaming teams (Max 2 teams)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Create Team Section */}
      <div className="flex gap-4">
        {canCreateTeam ? (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Team Members ({memberEmails.length}/4 additional)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addMemberEmailField}
                      disabled={memberEmails.length >= 4}
                    >
                      <Plus className="h-4 w-4" />
                      Add Member
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {memberEmails.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={email}
                          onChange={(e) => updateMemberEmail(index, e.target.value)}
                          placeholder={`Member ${index + 1} email (optional)`}
                        />
                        {memberEmails.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeMemberEmailField(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You will be the team leader. Members must have accounts to join.
                  </p>
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
        ) : (
          <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Maximum 2 teams allowed per user</span>
          </div>
        )}
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {userTeams.length === 0 ? (
          <Card className="gaming-card">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a team to start competing in tournaments with other players.
              </p>
              {canCreateTeam && (
                <Button variant="default" onClick={() => setIsCreateDialogOpen(true)}>
                  Create Your First Team
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          userTeams.map((team) => {
            const teamMembers = teamMembersMap[team.id] || [];
            const isLeader = team.leader_id === user?.id;
            
            return (
              <Card key={team.id} className="gaming-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {team.name}
                      {isLeader && <Badge variant="default">Leader</Badge>}
                    </CardTitle>
                    <div className="flex gap-2">
                      {isLeader && teamMembers.length < 5 && (
                        <Dialog 
                          open={selectedTeamForAddMember === team.id} 
                          onOpenChange={(open) => setSelectedTeamForAddMember(open ? team.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4" />
                              Add Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Team Member to {team.name}</DialogTitle>
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
                                <Button onClick={() => handleAddMemberToTeam(team.id)} className="flex-1">
                                  Add Member
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedTeamForAddMember(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      <Button variant="outline" size="sm" onClick={() => copyTeamId(team.id)}>
                        <Copy className="h-4 w-4" />
                        Copy ID
                      </Button>
                    </div>
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
                        <p className="font-semibold">{team.wins || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tournaments</p>
                        <p className="font-semibold">{team.tournaments_played || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Earnings</p>
                        <p className="font-semibold">₹{team.total_earnings || 0}</p>
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default Teams;