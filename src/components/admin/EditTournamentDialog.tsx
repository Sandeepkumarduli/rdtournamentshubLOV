import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminTournament } from '@/hooks/useAdminTournaments';

interface EditTournamentDialogProps {
  tournament: AdminTournament;
  onUpdate: () => void;
}

const EditTournamentDialog = ({ tournament, onUpdate }: EditTournamentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: '',
    prize_pool: tournament.prize.toString(),
    entry_fee: tournament.entryFee.toString(),
    max_teams: tournament.maxTeams?.toString() || '',
    start_date: '',
    end_date: '',
    game_type: tournament.gameType,
    status: tournament.status.toLowerCase()
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        description: formData.description || null,
        prize_pool: parseInt(formData.prize_pool) || 0,
        entry_fee: parseInt(formData.entry_fee) || 0,
        max_teams: formData.max_teams ? parseInt(formData.max_teams) : null,
        game_type: formData.game_type,
        status: formData.status,
      };

      if (formData.start_date) {
        updateData.start_date = new Date(formData.start_date).toISOString();
      }
      if (formData.end_date) {
        updateData.end_date = new Date(formData.end_date).toISOString();
      }

      const { error } = await supabase
        .from('tournaments')
        .update(updateData)
        .eq('id', tournament.id);

      if (error) throw error;

      toast({
        title: "Tournament Updated",
        description: "Tournament details have been successfully updated",
      });

      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast({
        title: "Error",
        description: "Failed to update tournament",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tournament: {tournament.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="game_type">Game Type</Label>
              <Select value={formData.game_type} onValueChange={(value) => setFormData(prev => ({ ...prev, game_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BGMI">BGMI</SelectItem>
                  <SelectItem value="PUBG Mobile">PUBG Mobile</SelectItem>
                  <SelectItem value="Free Fire">Free Fire</SelectItem>
                  <SelectItem value="Call of Duty Mobile">Call of Duty Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tournament description (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prize_pool">Prize Pool (rdCoins)</Label>
              <Input
                id="prize_pool"
                type="number"
                min="0"
                value={formData.prize_pool}
                onChange={(e) => setFormData(prev => ({ ...prev, prize_pool: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="entry_fee">Entry Fee (rdCoins)</Label>
              <Input
                id="entry_fee"
                type="number"
                min="0"
                value={formData.entry_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, entry_fee: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="max_teams">Max Teams</Label>
              <Input
                id="max_teams"
                type="number"
                min="1"
                value={formData.max_teams}
                onChange={(e) => setFormData(prev => ({ ...prev, max_teams: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date & Time</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">End Date & Time</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Live</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Updating..." : "Update Tournament"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTournamentDialog;