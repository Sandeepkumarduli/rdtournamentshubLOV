import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WalletBalance from '@/components/WalletBalance';
import WalletDialog from '@/components/WalletDialog';
import WalletTransaction from '@/components/WalletTransaction';
import { useWallet } from '@/hooks/useWallet';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import FrozenAccountBanner from '@/components/FrozenAccountBanner';
const WalletPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();
  const { balance, transactions, loading, addTransaction } = useWallet();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Latest wallet information loaded"
    });
  };
  
  const isFrozen = profile?.role === 'frozen';
  
  const handleAddFunds = async () => {
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
        description: "Minimum deposit amount is 10 rdCoins",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addTransaction('deposit', amount, 'Funds added');
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    setAddAmount('');
    setIsAddDialogOpen(false);
    toast({
      title: "Funds Added",
      description: `${amount} rdCoins added to your wallet successfully`
    });
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    if (amount > (balance?.balance || 0)) {
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
        description: "Minimum withdrawal amount is 50 rdCoins",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addTransaction('withdrawal', -amount, 'Funds withdrawn');
    
    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    setWithdrawAmount('');
    setIsWithdrawDialogOpen(false);
    toast({
      title: "Withdrawal Successful",
      description: `${amount} rdCoins will be transferred to your bank account within 2-3 business days`
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Frozen Account Banner */}
      <FrozenAccountBanner />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Wallet</h1>
          <p className="text-lg text-muted-foreground">Manage your funds and transactions</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Wallet Balance Card */}
      <WalletBalance balance={balance?.balance || 0}>
        <WalletDialog
          type="add"
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          amount={addAmount}
          onAmountChange={setAddAmount}
          onConfirm={handleAddFunds}
        >
          <Button variant="rdcoin" className="flex-1" disabled={isFrozen}>
            <ArrowUpCircle className="h-4 w-4" />
            {isFrozen ? 'Account Frozen' : 'Add Funds'}
          </Button>
        </WalletDialog>

        <WalletDialog
          type="withdraw"
          isOpen={isWithdrawDialogOpen}
          onOpenChange={setIsWithdrawDialogOpen}
          amount={withdrawAmount}
          onAmountChange={setWithdrawAmount}
          onConfirm={handleWithdraw}
          currentBalance={balance?.balance || 0}
        >
          <Button variant="outline" className="flex-1" disabled={isFrozen}>
            <ArrowDownCircle className="h-4 w-4" />
            {isFrozen ? 'Account Frozen' : 'Withdraw'}
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
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No transactions yet</p>
            ) : (
              transactions.map(transaction => (
                <WalletTransaction 
                  key={transaction.id} 
                  transaction={{
                    id: parseInt(transaction.id),
                    type: transaction.type === 'deposit' ? 'credit' : 'debit',
                    amount: transaction.amount,
                    description: transaction.description || 'Transaction',
                    date: new Date(transaction.created_at).toLocaleDateString()
                  }}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default WalletPage;