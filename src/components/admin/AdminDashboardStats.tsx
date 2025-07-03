import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, TrendingUp, Users, Trophy, Wallet, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStats } from '@/hooks/useAdminStats';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AdminDashboardStatsProps {
  onRefresh: () => void;
}

const AdminDashboardStats = ({ onRefresh }: AdminDashboardStatsProps) => {
  const navigate = useNavigate();
  const { stats, loading, refetch } = useAdminStats();

  const handleSendMoney = () => {
    navigate('/org-dashboard?tab=wallets');
  };

  const handleRefresh = () => {
    refetch();
    onRefresh();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">ORG Dashboard</h1>
          <p className="text-lg text-muted-foreground">Live Organization Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={handleSendMoney}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Send Prize Money
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ORG Members</p>
                <p className="text-2xl font-bold text-slate-50">{stats.orgMembers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ORG Tournaments</p>
                <p className="text-2xl font-bold text-slate-50">{stats.orgTournaments}</p>
              </div>
              <Trophy className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Prize Pool</p>
                <p className="text-2xl font-bold text-gaming-gold">₹{stats.totalPrizePool.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-gaming-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-warning">{stats.pendingReviews}</p>
              </div>
              <Settings className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardStats;