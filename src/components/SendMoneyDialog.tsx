import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Send, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SendMoneyDialogProps {
  trigger: React.ReactNode;
}

const SendMoneyDialog = ({ trigger }: SendMoneyDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [sendType, setSendType] = useState('individual');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Mock users for search
  const mockUsers = [
    { id: 1, username: "PlayerOne", wallet: 450 },
    { id: 2, username: "GamerPro", wallet: 1200 },
    { id: 3, username: "SquadLeader", wallet: 800 },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMoney = () => {
    if (!selectedUser || !amount) {
      toast({
        title: "Missing Information",
        description: "Please select a user and enter an amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Money Sent Successfully",
      description: `₹${amount} sent to ${selectedUser}`,
    });
    
    setOpen(false);
    setSearchTerm('');
    setSelectedUser('');
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Prize Money</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Send Type</Label>
            <Select value={sendType} onValueChange={setSendType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Player</SelectItem>
                <SelectItem value="team">Entire Team (Split Equally)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Search User</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {searchTerm && (
            <div className="space-y-2">
              <Label>Select User</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedUser === user.username
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedUser(user.username)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-sm text-muted-foreground">₹{user.wallet}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              placeholder="Enter prize amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSendMoney} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Send Money
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMoneyDialog;