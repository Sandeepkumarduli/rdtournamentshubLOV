import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, RefreshCw, Plus, Users, Copy, UserPlus, X, Trash2, Settings, UserMinus, Bell, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeams } from '@/hooks/useTeams';
import { useTeamRequests } from '@/hooks/useTeamRequests';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserSearch } from '@/hooks/useUserSearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import FrozenAccountBanner from '@/components/FrozenAccountBanner';

const Teams = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeamForAddMember, setSelectedTeamForAddMember] = useState<string | null>(null);
  const [joinTeamId, setJoinTeamId] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [isRequestsDialogOpen, setIsRequestsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { userTeams, teamMembersMap, loading, createTeam, joinTeam, deleteTeam, removeMemberFromTeam, leaveTeam, refetch } = useTeams();
  const { incomingRequests, sendRequest, acceptRequest, declineRequest, refetch: refetchRequests } = useTeamRequests();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { loading: searchLoading, results: searchResults, searchUsers, clearResults } = useUserSearch();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Data Refreshed",
        description: "Latest team information loaded successfully"
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    const { error } = await leaveTeam(teamId);
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Left Team",
      description: "You have successfully left the team"
    });
  };

  const addMemberEmailField = () => {
    // Removed - no longer needed for request-based system
  };

  const removeMemberEmailField = (index: number) => {
    // Removed - no longer needed for request-based system
  };

  const updateMemberEmail = (index: number, value: string) => {
    // Removed - no longer needed for request-based system
  };

  const handleCreateTeam = async () => {
    if (profile?.role === 'frozen') {
      toast({
        title: "Account Frozen",
        description: "Your account is frozen. You cannot create teams. Contact support to resolve.",
        variant: "destructive"
      });
      return;
    }
    
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

    const { error } = await createTeam(teamName);
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
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

  const handleSendTeamRequest = async (selectedUserId: string, teamId: string) => {
    if (profile?.role === 'frozen') {
      toast({
        title: "Account Frozen",
        description: "Your account is frozen. You cannot manage teams. Contact support to resolve.",
        variant: "destructive"
      });
      return;
    }
    
    const { error } = await sendRequest(teamId, selectedUserId);
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Request Sent",
      description: "Team join request sent successfully!"
    });
    setNewMemberEmail('');
    setSelectedTeamForAddMember(null);
    clearResults();
  };

  const handleAcceptRequest = async (requestId: string) => {
    const { error } = await acceptRequest(requestId);
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Request Accepted",
      description: "You have joined the team!"
    });
    refetchRequests();
  };

  const handleDeclineRequest = async (requestId: string) => {
    const { error } = await declineRequest(requestId);
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Request Declined",
      description: "Team join request declined"
    });
    refetchRequests();
  };

  const copyTeamId = (teamId: string) => {
    navigator.clipboard.writeText(teamId);
    toast({
      title: "Copied",
      description: "Team ID copied to clipboard"
    });
  };

  const handleJoinTeam = async () => {
    if (profile?.role === 'frozen') {
      toast({
        title: "Account Frozen",
        description: "Your account is frozen. You cannot join teams. Contact support to resolve.",
        variant: "destructive"
      });
      return;
    }
    
    if (!joinTeamId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid team ID",
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

    const { error } = await joinTeam(joinTeamId);
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    setJoinTeamId('');
    setIsJoinDialogOpen(false);
    toast({
      title: "Team Joined",
      description: "Successfully joined the team!"
    });
  };

  const handleDeleteTeam = async (teamId: string) => {
    const result = await deleteTeam(teamId);
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Team Deleted",
      description: "Team has been successfully deleted"
    });
    setTeamToDelete(null);
  };

  const handleRemoveMember = async (teamId: string, memberUserId: string) => {
    const { error } = await removeMemberFromTeam(teamId, memberUserId);
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Member Removed",
      description: "Team member has been removed successfully"
    });
  };

  const canCreateTeam = userTeams.length < 2;
  const isFrozen = profile?.role === 'frozen';

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Frozen Account Banner */}
      <FrozenAccountBanner />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">My Teams</h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground">Create and manage your gaming teams (Max 2 teams)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Requests Button */}
          <Dialog open={isRequestsDialogOpen} onOpenChange={setIsRequestsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative text-xs md:text-sm">
                <Bell className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden sm:inline">Requests</span>
                {incomingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                    {incomingRequests.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">Team Join Requests</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {incomingRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-3 space-y-2">
                        <div>
                          <p className="font-medium text-xs md:text-sm">
                            Team: {request.teams?.name || 'Unknown Team'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From: {request.requester_profile?.display_name || 'Unknown User'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex-1 text-xs"
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            className="flex-1 text-xs"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" className="text-xs md:text-sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-1">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Create Team Section */}
      <div className="flex flex-wrap gap-2 md:gap-4">
        {canCreateTeam && !isFrozen && (
          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4" />
                Join Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Existing Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="joinTeamId">Team ID</Label>
                  <Input 
                    id="joinTeamId" 
                    value={joinTeamId} 
                    onChange={e => setJoinTeamId(e.target.value)} 
                    placeholder="Enter team ID to join" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ask the team leader for the team ID
                  </p>
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
        )}
        
        {canCreateTeam && !isFrozen ? (
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
                  <p className="text-xs text-muted-foreground mt-1">
                    You will be the team leader. Add members after creating the team.
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
        ) : !canCreateTeam ? (
          <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Maximum 2 teams allowed per user</span>
          </div>
        ) : isFrozen ? (
          <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Account frozen - Team management disabled</span>
          </div>
        ) : null}
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
              {canCreateTeam && !isFrozen && (
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
                      {isLeader && !isFrozen && (
                        <>
                          <Dialog 
                            open={selectedTeamForEdit === team.id} 
                            onOpenChange={(open) => setSelectedTeamForEdit(open ? team.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                                Manage Team
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Manage Team: {team.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Team Members ({teamMembers.length}/5)</h4>
                                  <div className="space-y-2">
                                    {teamMembers.map((member) => (
                                      <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                                        <div>
                                          <p className="font-medium">
                                            {member.profiles?.display_name || 'Unknown'}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {member.role === 'leader' ? 'Team Leader' : 'Member'}
                                            {member.profiles?.bgmi_id && ` • BGMI: ${member.profiles.bgmi_id}`}
                                          </p>
                                        </div>
                                        {member.role !== 'leader' && (
                                          <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => handleRemoveMember(team.id, member.user_id)}
                                          >
                                            <UserMinus className="h-4 w-4" />
                                            Remove
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {teamMembers.length < 5 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Add New Member</h4>
                                    <div>
                                      <Label htmlFor="memberSearch">Search by Username or Email</Label>
                                      <Input 
                                        id="memberSearch" 
                                        value={newMemberEmail} 
                                        onChange={(e) => {
                                          setNewMemberEmail(e.target.value);
                                          searchUsers(e.target.value);
                                        }}
                                        placeholder="Enter username or email to search" 
                                      />
                                    </div>
                                    
                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                      <div className="border rounded-lg p-2 max-h-40 overflow-y-auto mt-2">
                                        <p className="text-sm font-medium mb-2">Search Results:</p>
                                        <div className="space-y-1">
                                          {searchResults.map((user) => {
                                            const isEmailMatch = user.email.toLowerCase().includes(newMemberEmail.toLowerCase());
                                            return (
                                              <div 
                                                key={user.user_id} 
                                                className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                                                onClick={() => handleSendTeamRequest(user.user_id, team.id)}
                                              >
                                                <div className="flex-1">
                                                  <p className="font-medium text-sm">{user.display_name || 'No Name'}</p>
                                                  {user.bgmi_id && (
                                                    <p className="text-xs text-muted-foreground">BGMI: {user.bgmi_id}</p>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  {isEmailMatch && (
                                                    <Check className="h-4 w-4 text-success" />
                                                  )}
                                                  <Button size="sm" variant="outline">
                                                    Add
                                                  </Button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                  <Button variant="outline" onClick={() => {
                                    setSelectedTeamForEdit(null);
                                    setNewMemberEmail('');
                                    clearResults();
                                  }}>
                                    Close
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Delete Team - Only for Leaders */}
                          <Dialog open={teamToDelete === team.id} onOpenChange={(open) => setTeamToDelete(open ? team.id : null)}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                                Delete Team
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Team</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Are you sure you want to delete "{team.name}"? This action cannot be undone and will remove all team members.</p>
                                <div className="flex gap-2">
                                  <Button variant="destructive" onClick={() => handleDeleteTeam(team.id)} className="flex-1">
                                    Delete Team
                                  </Button>
                                  <Button variant="outline" onClick={() => setTeamToDelete(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                       {/* Leave Team - Only for Non-Leaders */}
                       {!isLeader && !isFrozen && (
                         <Button variant="destructive" size="sm" onClick={() => handleLeaveTeam(team.id)}>
                           <UserMinus className="h-4 w-4" />
                           Leave Team
                         </Button>
                       )}

                       {isLeader && teamMembers.length < 5 && !isFrozen && (
                         <Dialog 
                           open={selectedTeamForAddMember === team.id} 
                           onOpenChange={(open) => setSelectedTeamForAddMember(open ? team.id : null)}
                         >
                           <DialogTrigger asChild>
                             <Button variant="outline" size="sm">
                               <UserPlus className="h-4 w-4" />
                               Quick Add
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>Add Team Member to {team.name}</DialogTitle>
                             </DialogHeader>
                             <div className="space-y-4">
                               <div>
                                 <Label htmlFor="memberSearch">Search by Username or Email</Label>
                                 <Input 
                                   id="memberSearch" 
                                   value={newMemberEmail} 
                                   onChange={(e) => {
                                     setNewMemberEmail(e.target.value);
                                     searchUsers(e.target.value);
                                   }}
                                   placeholder="Enter username or email to search" 
                                 />
                                 <p className="text-xs text-muted-foreground mt-1">
                                   Search for existing users to add to your team
                                 </p>
                               </div>
                               
                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                  <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                                    <p className="text-sm font-medium mb-2">Search Results:</p>
                                    <div className="space-y-1">
                                      {searchResults.map((user) => {
                                        const isEmailMatch = user.email.toLowerCase().includes(newMemberEmail.toLowerCase());
                                        return (
                                          <div 
                                            key={user.user_id} 
                                            className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                                            onClick={() => handleSendTeamRequest(user.user_id, team.id)}
                                          >
                                            <div className="flex-1">
                                              <p className="font-medium text-sm">{user.display_name || 'No Name'}</p>
                                              {user.bgmi_id && (
                                                <p className="text-xs text-muted-foreground">BGMI: {user.bgmi_id}</p>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {isEmailMatch && (
                                                <Check className="h-4 w-4 text-success" />
                                              )}
                                              <Button size="sm" variant="outline">
                                                Add
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                               
                               {searchLoading && (
                                 <p className="text-sm text-muted-foreground">Searching...</p>
                               )}
                               
                               <div className="flex gap-2">
                                 <Button variant="outline" onClick={() => {
                                   setSelectedTeamForAddMember(null);
                                   setNewMemberEmail('');
                                   clearResults();
                                 }}>
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
                        <p className="font-semibold">{team.total_earnings || 0} rdCoins</p>
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