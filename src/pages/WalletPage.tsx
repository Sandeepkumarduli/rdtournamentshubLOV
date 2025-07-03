import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Wallet, CreditCard, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const WalletPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const userData = JSON.parse(localStorage.getItem('userAuth') || '{}');
  const currentBalance = userData.wallet?.balance || 100;
  const transactions = [{
    id: 1,
    type: 'credit',
    amount: 100,
    description: 'Welcome Bonus',
    date: '2024-01-15'
  }, {
    id: 2,
    type: 'debit',
    amount: 50,
    description: 'Tournament Entry - BGMI Pro League',
    date: '2024-01-16'
  }, {
    id: 3,
    type: 'credit',
    amount: 200,
    description: 'Prize Money - Squad Showdown',
    date: '2024-01-17'
  }];
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Latest wallet information loaded"
    });
  };
  const handleAddFunds = () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    if (amount < 10) {
      toast({
        title: "Minimum Amount",
        description: "Minimum deposit amount is ₹10",
        variant: "destructive"
      });
      return;
    }

    // Update user wallet in localStorage
    const updatedUserData = {
      ...userData,
      wallet: {
        balance: currentBalance + amount
      }
    };
    localStorage.setItem('userAuth', JSON.stringify(updatedUserData));
    setAddAmount('');
    setIsAddDialogOpen(false);
    toast({
      title: "Funds Added",
      description: `₹${amount} added to your wallet successfully`
    });

    // Refresh the page to update balance
    window.location.reload();
  };
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    if (amount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive"
      });
      return;
    }
    if (amount < 50) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is ₹50",
        variant: "destructive"
      });
      return;
    }

    // Update user wallet in localStorage
    const updatedUserData = {
      ...userData,
      wallet: {
        balance: currentBalance - amount
      }
    };
    localStorage.setItem('userAuth', JSON.stringify(updatedUserData));
    setWithdrawAmount('');
    setIsWithdrawDialogOpen(false);
    toast({
      title: "Withdrawal Successful",
      description: `₹${amount} will be transferred to your bank account within 2-3 business days`
    });

    // Refresh the page to update balance
    window.location.reload();
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Manage your rdCoins and transactions</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Wallet Balance Card */}
      <Card className="gaming-card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-gaming-gold" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gaming-gold mb-2">
            {currentBalance} rdCoins
          </div>
          <p className="text-muted-foreground mb-6">
            = ₹{currentBalance} (1 rdCoin = ₹1)
          </p>
          <div className="flex gap-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="rdcoin" className="flex-1">
                  <ArrowUpCircle className="h-4 w-4" />
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds to Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="addAmount" className="px-0 py-0 my-[10px]">Amount (₹)</Label>
                    <Input id="addAmount" type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="Enter amount (min ₹10)" min="10" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddFunds} className="flex-1">
                      Add Funds
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <ArrowDownCircle className="h-4 w-4" />
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdrawAmount">Amount (₹)</Label>
                    <Input id="withdrawAmount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Enter amount (min ₹50)" min="50" max={currentBalance} />
                    <p className="text-sm text-muted-foreground mt-1">
                      Available: ₹{currentBalance}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleWithdraw} className="flex-1">
                      Withdraw
                    </Button>
                    <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map(transaction => <div key={transaction.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  {transaction.type === 'credit' ? <ArrowUpCircle className="h-5 w-5 text-success" /> : <ArrowDownCircle className="h-5 w-5 text-destructive" />}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className={`font-semibold ${transaction.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default WalletPage;