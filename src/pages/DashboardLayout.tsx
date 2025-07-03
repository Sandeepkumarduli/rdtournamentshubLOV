import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserSidebar from "@/components/UserSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

const DashboardLayout = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const auth = localStorage.getItem("userAuth");
    if (!auth) {
      navigate("/login");
      return;
    }
    
    const user = JSON.parse(auth);
    if (user.role !== "user") {
      navigate("/login");
      return;
    }
    
    setUserData(user);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userAuth");
    localStorage.removeItem("userTeams");
    toast({
      title: "Logged out successfully",
      description: "See you in the battlefield!",
    });
    navigate("/");
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <UserSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold">Welcome back, {userData?.username}!</h1>
                  <p className="text-sm text-muted-foreground">Ready for some action?</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rdcoin-badge">
                  <Wallet className="h-4 w-4" />
                  {userData?.wallet?.balance || 100} rdCoins
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;