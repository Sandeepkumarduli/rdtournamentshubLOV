import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminStats } from '@/hooks/useAdminStats';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminGroupTab = () => {
  const [isEditingOrgName, setIsEditingOrgName] = useState(false);
  const { stats, loading } = useAdminStats();
  
  // Get organization name from localStorage
  const auth = localStorage.getItem("userAuth");
  const adminData = auth ? JSON.parse(auth) : null;
  const defaultOrgName = adminData?.organization || "FireStorm ORG";
  
  const [orgName, setOrgName] = useState(defaultOrgName);
  const [tempOrgName, setTempOrgName] = useState(defaultOrgName);
  const { toast } = useToast();

  const handleSaveOrgName = () => {
    setOrgName(tempOrgName);
    setIsEditingOrgName(false);
    toast({
      title: "ORG Name Updated",
      description: `Organization name changed to ${tempOrgName}`,
    });
  };

  const handleCancelEdit = () => {
    setTempOrgName(orgName);
    setIsEditingOrgName(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Group Management</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle>ORG Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <div className="flex items-center gap-2">
                {isEditingOrgName ? (
                  <>
                    <Input 
                      value={tempOrgName} 
                      onChange={(e) => setTempOrgName(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveOrgName}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Input value={orgName} readOnly className="flex-1" />
                    <Button size="sm" onClick={() => setIsEditingOrgName(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Admin Username</Label>
              <Input value={adminData?.username || "Unknown"} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Total Members</Label>
              <Input value={stats.orgMembers.toString()} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Active Tournaments</Label>
              <Input value={stats.orgTournaments.toString()} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader>
            <CardTitle>ORG Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Prize Pool:</span>
              <span className="font-semibold text-gaming-gold">₹{stats.totalPrizePool.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tournaments Completed:</span>
              <span className="font-semibold">{stats.orgTournaments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending Reviews:</span>
              <span className="font-semibold text-warning">{stats.pendingReviews}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organization Status:</span>
              <span className="font-semibold text-success">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminGroupTab;