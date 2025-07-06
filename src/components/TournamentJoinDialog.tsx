import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Team, TeamMember } from '@/hooks/useTeams';

interface Tournament {
  id: string;
  name: string;
  game_type: string;
  entry_fee: number;
  prize_pool: number;
}

interface TournamentJoinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  userTeams: Team[];
  teamMembersMap: Record<string, TeamMember[]>;
  walletBalance: number;
  onJoin: (tournamentId: string, teamId: string) => Promise<void>;
}

const TournamentJoinDialog = ({ 
  isOpen, 
  onClose, 
  tournament, 
  userTeams, 
  teamMembersMap,
  walletBalance,
  onJoin 
}: TournamentJoinDialogProps) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!tournament) return null;

  const getMinMembersRequired = (gameType: string) => {
    switch (gameType.toLowerCase()) {
      case 'squad': return 4;
      case 'duo': return 2;
      case 'solo': return 1;
      default: return 1;
    }
  };

  const minMembers = getMinMembersRequired(tournament.game_type);
  const isSolo = tournament.game_type.toLowerCase() === 'solo';
  const hasInsufficientBalance = tournament.entry_fee > walletBalance;

  const eligibleTeams = userTeams.filter(team => {
    // For solo tournaments, any team is fine (we just need user to be registered)
    if (isSolo) return true;
    
    // For team tournaments, check minimum member count
    const teamMembers = teamMembersMap[team.id] || [];
    return teamMembers.length >= minMembers;
  });

  // Check if selected team meets requirements
  const selectedTeam = selectedTeamId ? userTeams.find(t => t.id === selectedTeamId) : null;
  const selectedTeamMembers = selectedTeamId ? teamMembersMap[selectedTeamId] || [] : [];
  const hasInsufficientMembers = !isSolo && selectedTeam && selectedTeamMembers.length < minMembers;

  const handleJoin = async () => {
    if (!isSolo && !selectedTeamId) {
      toast({
        title: "Team Required",
        description: "Please select a team to join this tournament.",
        variant: "destructive"
      });
      return;
    }

    if (hasInsufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Please add money to your wallet first.",
        variant: "destructive"
      });
      return;
    }

    if (hasInsufficientMembers) {
      toast({
        title: "Insufficient Team Members",
        description: `Your team needs at least ${minMembers} members for ${tournament.game_type} tournaments.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onJoin(tournament.id, selectedTeamId || userTeams[0]?.id || '');
      onClose();
      setSelectedTeamId('');
    } catch (error) {
      console.error('Error joining tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join Tournament</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tournament Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold">{tournament.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Game Type:</span>
                  <Badge variant="outline">{tournament.game_type}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Entry Fee:</span>
                  <span className="font-medium">₹{tournament.entry_fee}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prize Pool:</span>
                  <span className="font-semibold text-gaming-gold">₹{tournament.prize_pool}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance Warning */}
          {hasInsufficientBalance && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Insufficient Balance</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your wallet balance ({walletBalance} rdCoins) is less than the entry fee ({tournament.entry_fee} rdCoins).
                </p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  <Wallet className="h-4 w-4 mr-2" />
                  Add Money to Wallet
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Team Selection */}
          {!isSolo && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Team</label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your team" />
                </SelectTrigger>
                <SelectContent>
                  {userTeams.map((team) => {
                    const teamMembers = teamMembersMap[team.id] || [];
                    const isEligible = isSolo || teamMembers.length >= minMembers;
                    
                    return (
                      <SelectItem key={team.id} value={team.id} disabled={!isEligible}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {team.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isEligible ? "default" : "destructive"} className="text-xs">
                              {teamMembers.length}/{minMembers}
                            </Badge>
                            {!isEligible && <span className="text-xs text-destructive">Insufficient</span>}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {minMembers > 1 && (
                <p className="text-xs text-muted-foreground">
                  * Minimum {minMembers} members required for {tournament.game_type} tournaments
                </p>
              )}
              
              {/* Team Members Validation Warning */}
              {hasInsufficientMembers && (
                <Card className="border-destructive">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Insufficient Team Members</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected team has {selectedTeamMembers.length} members, but {minMembers} are required for {tournament.game_type}.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Solo Tournament Info */}
          {isSolo && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Solo tournament - no team required</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleJoin} 
              disabled={loading || hasInsufficientBalance || hasInsufficientMembers || (!isSolo && !selectedTeamId)}
              className="flex-1"
            >
              {loading ? 'Joining...' : 'Join Tournament'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentJoinDialog;