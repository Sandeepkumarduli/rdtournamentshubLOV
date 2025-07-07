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
  const { createRazorpayOrder, verifyRazorpayPayment } = useWallet();
  const { toast } = useToast();
  const isAdd = type === 'add';
  const minAmount = isAdd ? 10 : 50;

  const handleRazorpayPayment = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount < minAmount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum amount is ₹${minAmount}`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create Razorpay order
      const { data: orderData, error: orderError } = await createRazorpayOrder(numAmount);
      
      if (orderError) {
        throw new Error(orderError);
      }

      // Initialize Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RD Gaming",
        description: "Add funds to wallet",
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyError) {
              throw new Error(verifyError);
            }

            toast({
              title: "Payment Successful",
              description: `₹${numAmount} added to your wallet`,
            });
            
            onAmountChange('');
            onOpenChange(false);
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was debited",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        },
        prefill: {
          email: "user@example.com",
        },
        theme: {
          color: "#8B5CF6"
        }
      };

      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
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
              Amount (₹)
            </Label>
            <Input
              id={`${type}Amount`}
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder={`Enter amount (min ₹${minAmount})`}
              min={minAmount}
              max={!isAdd ? currentBalance : undefined}
              className="my-px"
            />
            {!isAdd && currentBalance && (
              <p className="text-muted-foreground mt-1">
                Available: ₹{currentBalance}
              </p>
            )}
            {isAdd && (
              <p className="text-muted-foreground mt-1">
                Secure payment powered by Razorpay
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={isAdd ? handleRazorpayPayment : onConfirm} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isAdd ? 'Pay with Razorpay' : 'Withdraw')}
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