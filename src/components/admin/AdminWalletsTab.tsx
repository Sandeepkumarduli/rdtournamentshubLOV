import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, ArrowUpCircle, ArrowDownCircle, Search, Send, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminWalletsTabProps {
  onRefresh: () => void;
}

const AdminWalletsTab = ({ onRefresh }: AdminWalletsTabProps) => {
  const [rdBalance] = useState(50000);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [sendType, setSendType] = useState('individual');
  const { toast } = useToast();

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
    
    setSearchTerm('');
    setSelectedUser('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Wallet Management</h2>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh Wallets
        </Button>
      </div>

      {/* RD Balance Section */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>ORG rd Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gaming-gold/10 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-gaming-gold">₹{rdBalance.toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="rdcoin">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
              <Button variant="outline">
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Money Section */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Send Prize Money</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label>Search User/Team</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type username or team name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {searchTerm && (
            <div className="space-y-2">
              <Label>Select User/Team</Label>
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

          <Button onClick={handleSendMoney} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Prize Money
          </Button>
        </CardContent>
      </Card>

      {/* User Wallets List */}
      <div className="grid gap-4">
        {mockUsers.map((user) => (
          <Card key={user.id} className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <div className="rdcoin-badge">
                      {user.wallet} rdCoins
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>Balance: ₹{user.wallet}</div>
                    <div>Status: Active</div>
                    <div>Last Activity: Recent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminWalletsTab;