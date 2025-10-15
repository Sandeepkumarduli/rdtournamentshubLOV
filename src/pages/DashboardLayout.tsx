import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserSidebar from "@/components/UserSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageTransition from "@/components/PageTransition";
import AccountBlockedPage from "@/components/AccountBlockedPage";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";

const DashboardLayout = () => {
  const location = useLocation();
  const { user, loading: authLoading, isFrozen } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { balance } = useWallet();

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