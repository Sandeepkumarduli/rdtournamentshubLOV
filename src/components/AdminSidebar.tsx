import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Trophy, 
  Wallet, 
  Settings,
  BarChart3,
  MessageSquare,
  UserCheck,
  Flag,
  LogOut,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/org-dashboard",
    icon: BarChart3,
  },
  {
    title: "Users",
    url: "/org-dashboard?tab=users",
    icon: Users,
  },
  {
    title: "Tournaments",
    url: "/org-dashboard?tab=tournaments", 
    icon: Trophy,
  },
  {
    title: "Teams",
    url: "/org-dashboard?tab=teams",
    icon: UserCheck,
  },
  {
    title: "Wallets",
    url: "/org-dashboard?tab=wallets",
    icon: Wallet,
  },
  {
    title: "Admin Group",
    url: "/org-dashboard?tab=admin-group",
    icon: Settings,
  },
  {
    title: "Chat",
    url: "/org-dashboard?tab=chat",
    icon: MessageSquare,
  },
  {
    title: "ORG Chat",
    url: "/org-dashboard?tab=org-chat",
    icon: MessageSquare,
  },
  {
    title: "Report",
    url: "/org-dashboard?tab=report",
    icon: Flag,
  },
  {
    title: "View Reports",
    url: "/org-dashboard?tab=view-reports",
    icon: Flag,
  }
];

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const { profile } = useProfile();
  const { toast } = useToast();
  const { isFrozen } = useAuth();
  
  const handleLockedClick = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    toast({
      title: "Account Frozen",
      description: "Your account has been frozen by the system administrator. Please contact support.",
      variant: "destructive"
    });
  };
  
  const isPageAllowed = (url: string) => {
    return url.includes('report') || url.includes('wallets');
  };

  const isActive = (path: string) => {
    if (path === "/org-dashboard" && location.pathname === "/org-dashboard" && !location.search) {
      return true;
    }
    return currentPath === path;
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-gaming-gold" />
          <div>
            <h1 className="text-xl font-bold">ORG Panel</h1>
            <p className="text-muted-foreground">Tournament Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            const isLocked = isFrozen && !isPageAllowed(item.url);
            
            return (
              <li key={item.title}>
                {isLocked ? (
                  <div
                    onClick={(e) => handleLockedClick(e, item.title)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer opacity-60",
                      "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    <Lock className="h-4 w-4 ml-auto text-destructive" />
                  </div>
                ) : (
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      active 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => {
            localStorage.removeItem("userAuth");
            window.location.href = "/";
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-accent w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;