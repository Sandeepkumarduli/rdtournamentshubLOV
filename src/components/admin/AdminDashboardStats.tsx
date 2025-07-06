import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, TrendingUp, Wallet, Clock, CheckCircle, Play, Calendar, Users, Shield, ShieldAlert, Flag, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStats } from '@/hooks/useAdminStats';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardStatsProps {
  onRefresh: () => void;
}

const AdminDashboardStats = ({ onRefresh }: AdminDashboardStatsProps) => {
  const navigate = useNavigate();
  const { stats, loading, refetch } = useAdminStats();
  const { toast } = useToast();

  const handleSendMoney = () => {
    navigate('/org-dashboard?tab=wallets');
  };

  const handleRefresh = async () => {
    await refetch();
    onRefresh();
    toast({
      title: "Dashboard data refreshed successfully",
      description: "All data has been updated from the database",
    });
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

      {/* New Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-slate-50">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teams</p>
                <p className="text-2xl font-bold text-slate-50">{stats.totalTeams}</p>
              </div>
              <Shield className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Banned Teams</p>
                <p className="text-2xl font-bold text-destructive">{stats.bannedTeams}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Banned Users</p>
                <p className="text-2xl font-bold text-destructive">{stats.bannedUsers}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports on This Org</p>
                <p className="text-2xl font-bold text-warning">{stats.reportsOnOrg}</p>
              </div>
              <Flag className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports I Submitted</p>
                <p className="text-2xl font-bold text-slate-50">{stats.reportsSubmittedByMe}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet & Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold text-gaming-gold">{stats.walletBalance.toLocaleString()} rdCoins</p>
              </div>
              <Wallet className="h-8 w-8 text-gaming-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Room Updates</p>
                <p className="text-2xl font-bold text-warning">{stats.tournamentsNeedingRoomUpdates}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Prize Spent</p>
                <p className="text-2xl font-bold text-slate-50">{stats.totalPrizeMoneySpent.toLocaleString()} rdCoins</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">{stats.completedTournaments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Now</p>
                <p className="text-2xl font-bold text-destructive">{stats.liveTournaments}</p>
              </div>
              <Play className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-accent">{stats.upcomingTournaments}</p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardStats;