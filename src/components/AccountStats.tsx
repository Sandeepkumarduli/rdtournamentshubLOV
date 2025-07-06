import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ProfileStats } from '@/hooks/useProfileStats';

interface AccountStatsProps {
  balance: number;
  memberSince: string;
  stats: ProfileStats;
  children?: React.ReactNode;
}

const AccountStats = ({ balance, memberSince, stats, children }: AccountStatsProps) => {
  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle>Account Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="font-medium">Account Type</Label>
          <div className="mt-1">
            <Badge variant="default">Player</Badge>
          </div>
        </div>
        
        <div>
          <Label className="font-medium">Member Since</Label>
          <p className="text-lg mt-1">{memberSince}</p>
        </div>
        
        <div>
          <Label className="font-medium">Current Balance</Label>
          <p className="text-lg font-semibold text-gaming-gold mt-1">
            {balance} rdCoins
          </p>
        </div>
        
        <div className="space-y-3">
          <Label className="font-medium">Gaming Statistics</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Tournaments</p>
              <p className="text-xl font-bold">{stats.tournamentCount}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Win Rate</p>
              <p className="text-xl font-bold">{stats.winRate}%</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Teams</p>
              <p className="text-xl font-bold">{stats.teamCount}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Earnings</p>
              <p className="text-xl font-bold">{stats.earnings} rdCoins</p>
            </div>
          </div>
        </div>

        {children}
      </CardContent>
    </Card>
  );
};

export default AccountStats;