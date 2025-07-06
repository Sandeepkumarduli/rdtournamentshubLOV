import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

interface WalletTransactionProps {
  transaction: Transaction;
}

const WalletTransaction = ({ transaction }: WalletTransactionProps) => {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
      <div className="flex items-center gap-3">
        {transaction.type === 'credit' ? (
          <ArrowUpCircle className="h-5 w-5 text-success" />
        ) : (
          <ArrowDownCircle className="h-5 w-5 text-destructive" />
        )}
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-muted-foreground">{transaction.date}</p>
        </div>
      </div>
      <div className={`font-semibold ${transaction.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} rdCoins
      </div>
    </div>
  );
};

export default WalletTransaction;