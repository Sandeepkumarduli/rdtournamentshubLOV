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
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const location = useLocation();
  const { user, loading: authLoading, isFrozen } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { balance } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

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
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative z-50 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <UserSidebar isOpen={true} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-3 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between md:justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 min-w-0 md:flex-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-muted hover:bg-muted/80 flex-shrink-0"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="h-4 w-4 md:h-5 md:w-5" /> : <Menu className="h-4 w-4 md:h-5 md:w-5" />}
                </Button>
                <div className="min-w-0 text-center md:text-left flex-1 md:flex-none">
                  <h1 className="text-sm md:text-xl font-bold truncate">Welcome, {profile?.display_name || 'User'}!</h1>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Ready for some action?</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="rdcoin-badge text-xs md:text-sm px-2 md:px-3">
                  <Wallet className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">{balance?.balance || 0} rdCoins</span>
                  <span className="sm:hidden">{balance?.balance || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 md:p-6 overflow-x-hidden">
          <PageTransition trigger={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;