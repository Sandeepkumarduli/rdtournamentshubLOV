import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WalletBalance from '@/components/WalletBalance';
import WalletDialog from '@/components/WalletDialog';
import WalletTransaction from '@/components/WalletTransaction';
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
    type: 'credit' as const,
    amount: 100,
    description: 'Welcome Bonus',
    date: '2024-01-15'
  }, {
    id: 2,
    type: 'debit' as const,
    amount: 50,
    description: 'Tournament Entry - BGMI Pro League',
    date: '2024-01-16'
  }, {
    id: 3,
    type: 'credit' as const,
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
          <h1 className="text-4xl font-bold">Wallet</h1>
          <p className="text-lg text-muted-foreground">Manage your rdCoins and transactions</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Wallet Balance Card */}
      <WalletBalance balance={currentBalance}>
        <WalletDialog
          type="add"
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          amount={addAmount}
          onAmountChange={setAddAmount}
          onConfirm={handleAddFunds}
        >
          <Button variant="rdcoin" className="flex-1">
            <ArrowUpCircle className="h-4 w-4" />
            Add Funds
          </Button>
        </WalletDialog>

        <WalletDialog
          type="withdraw"
          isOpen={isWithdrawDialogOpen}
          onOpenChange={setIsWithdrawDialogOpen}
          amount={withdrawAmount}
          onAmountChange={setWithdrawAmount}
          onConfirm={handleWithdraw}
          currentBalance={currentBalance}
        >
          <Button variant="outline" className="flex-1">
            <ArrowDownCircle className="h-4 w-4" />
            Withdraw
          </Button>
        </WalletDialog>
      </WalletBalance>

      {/* Transaction History */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map(transaction => (
              <WalletTransaction key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default WalletPage;