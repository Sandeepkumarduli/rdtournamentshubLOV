import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface WalletBalanceProps {
  balance: number;
  children: React.ReactNode;
}

const WalletBalance = ({ balance, children }: WalletBalanceProps) => {
  return (
    <Card className="gaming-card-gold">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-gaming-gold" />
          Current Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-gaming-gold mb-2">
          {balance} rdCoins
        </div>
        <p className="text-muted-foreground mb-6">
          = ₹{balance} (1 rdCoin = ₹1)
        </p>
        <div className="flex gap-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;