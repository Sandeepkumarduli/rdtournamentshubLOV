import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const isAdd = type === 'add';
  const minAmount = isAdd ? 10 : 50;
  
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
              Amount (rdCoins)
            </Label>
            <Input
              id={`${type}Amount`}
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder={`Enter amount (min ${minAmount} rdCoins)`}
              min={minAmount}
              max={!isAdd ? currentBalance : undefined}
              className="my-px"
            />
            {!isAdd && currentBalance && (
              <p className="text-muted-foreground mt-1">
                Available: {currentBalance} rdCoins
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onConfirm} className="flex-1">
              {isAdd ? 'Add Funds' : 'Withdraw'}
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