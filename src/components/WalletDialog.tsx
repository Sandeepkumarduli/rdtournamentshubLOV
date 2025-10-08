import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

interface WalletDialogProps {
  type: 'add' | 'withdraw';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  onConfirm: () => void;
  currentBalance?: number;
  children: React.ReactNode;
}

const WalletDialog = ({ 
  type, 
  isOpen, 
  onOpenChange, 
  amount, 
  onAmountChange, 
  onConfirm, 
  currentBalance,
  children 
}: WalletDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { createStripeCheckout } = useWallet();
  const { toast } = useToast();
  const isAdd = type === 'add';
  const minAmount = isAdd ? 10 : 50;

  const handleStripePayment = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount < minAmount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum amount is $${minAmount}`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await createStripeCheckout(numAmount);
      
      if (error) {
        throw new Error(error);
      }

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Stripe",
          description: "Complete your payment in the new tab",
        });
        
        onAmountChange('');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAdd ? 'Add Funds to Wallet' : 'Withdraw Funds'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor={`${type}Amount`} className="px-0 py-0 my-[10px]">
              Amount (USD)
            </Label>
            <Input
              id={`${type}Amount`}
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder={`Enter amount (min $${minAmount})`}
              min={minAmount}
              max={!isAdd ? currentBalance : undefined}
              className="my-px"
            />
            {!isAdd && currentBalance && (
              <p className="text-muted-foreground mt-1">
                Available: ${currentBalance}
              </p>
            )}
            {isAdd && (
              <p className="text-muted-foreground mt-1">
                1 USD = 1 rdCoin • Secure payment powered by Stripe
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={isAdd ? handleStripePayment : onConfirm} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isAdd ? 'Pay with Stripe' : 'Withdraw')}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletDialog;