import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Wallet, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserSidebar from "@/components/UserSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageTransition from "@/components/PageTransition";
import AccountBlockedPage from "@/components/AccountBlockedPage";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

const DashboardLayout = () => {
  const location = useLocation();
  const { user, loading: authLoading, isFrozen } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { balance } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (authLoading || profileLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user || !profile) {
    return <LoadingSpinner fullScreen />;
  }

  // Check if user is frozen and not accessing allowed pages (only report and wallet)
  const isOnAllowedPage = location.pathname.startsWith('/dashboard/report') || 
                         location.pathname.startsWith('/dashboard/wallet');
  
  console.log('🛡️ DashboardLayout freeze check:', { 
    userId: user?.id, 
    userRole: profile?.role, 
    isFrozen, 
    currentPath: location.pathname,
    isOnAllowedPage
  });
  
  // If user is frozen and trying to access a non-allowed page, show blocked page
  if (isFrozen && !isOnAllowedPage) {
    console.log('🚫 BLOCKING frozen user from accessing:', location.pathname);
    return <AccountBlockedPage />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-muted hover:bg-muted/80"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Welcome back, {profile?.display_name || 'User'}!</h1>
                  <p className="text-muted-foreground">Ready for some action?</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="rdcoin-badge">
                  <Wallet className="h-4 w-4" />
                  {balance?.balance || 0} rdCoins
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <PageTransition trigger={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;