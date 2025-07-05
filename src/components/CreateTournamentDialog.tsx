import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTournamentCreation } from '@/hooks/useTournamentCreation';

const tournamentSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  prizePool: z.number().min(1, "Prize pool must be greater than 0"),
  date: z.date({
    required_error: "Tournament date is required",
  }),
  time: z.string().min(1, "Tournament time is required"),
  slots: z.number().min(1, "Slots must be greater than 0"),
  roomId: z.string().optional(),
  roomPass: z.string().optional(),
  gameMode: z.enum(["Solo", "Duo", "Squad"], {
    required_error: "Please select a game mode",
  }),
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface CreateTournamentDialogProps {
  onTournamentCreated?: (tournament: any) => void;
}

const CreateTournamentDialog = ({ onTournamentCreated }: CreateTournamentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { loading, createTournament } = useTournamentCreation();

  const form = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: "",
      prizePool: 0,
      time: "",
      slots: 0,
      roomId: "",
      roomPass: "",
    },
  });

  const onSubmit = async (data: TournamentFormData) => {
    const tournamentData = {
      name: data.name,
      description: `Prize Pool: ₹${data.prizePool} | Game Mode: ${data.gameMode}`,
      game_type: data.gameMode,
      entry_fee: 0,
      prize_pool: data.prizePool,
      max_teams: data.slots,
      start_date: data.date ? new Date(`${format(data.date, "yyyy-MM-dd")}T${data.time}:00`).toISOString() : undefined,
      rules: data.roomId ? `Room ID: ${data.roomId}, Password: ${data.roomPass}` : undefined,
    };

    const result = await createTournament(tournamentData);

    if (result.success) {
      toast({
        title: "Tournament Created!",
        description: `${data.name} has been created successfully.`,
      });

      onTournamentCreated?.(result.data);
      setOpen(false);
      form.reset();
      
      // No need to reload the page - let React handle the update
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create tournament",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Create Tournament
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tournament name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prizePool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize Pool (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tournament Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Slots</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gameMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select game mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Solo">Solo</SelectItem>
                        <SelectItem value="Duo">Duo</SelectItem>
                        <SelectItem value="Squad">Squad</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Room Details (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                You can add these details later when the match starts
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter room ID (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roomPass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter room password (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Create Tournament"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTournamentDialog;