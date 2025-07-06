import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Wallet, 
  User,
  GamepadIcon,
  LogOut,
  MessageSquare,
  Flag,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const sidebarItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/tournaments', label: 'Tournaments', icon: Trophy },
  { path: '/dashboard/teams', label: 'Teams', icon: Users },
  { path: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { path: '/dashboard/groups', label: 'Groups', icon: GamepadIcon, comingSoon: true },
  { path: '/dashboard/profile', label: 'Profile', icon: User },
  { path: '/dashboard/chat', label: 'Chat', icon: MessageSquare, comingSoon: true },
  { path: '/dashboard/report', label: 'Report', icon: Flag },
];

const UserSidebar = () => {
  const location = useLocation();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { isFrozen } = useAuth();
  
  const handleLockedClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    toast({
      title: "Account Frozen",
      description: "Your account has been frozen by the system administrator. Please contact support.",
      variant: "destructive"
    });
  };
  
  const isPageAllowed = (path: string) => {
    return path === '/dashboard' || path.includes('/report') || path.includes('/wallet');
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <GamepadIcon className="h-8 w-8 text-gaming-gold" />
          <div>
            <h1 className="text-xl font-bold">RDTH</h1>
            <p className="text-muted-foreground">Tournament Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && location.pathname === '/dashboard');
            
            const isLocked = isFrozen && !isPageAllowed(item.path);
            
            // Hide locked items completely for frozen users
            if (isLocked) {
              return null;
            }
            
            return (
              <li key={item.path}>
                {item.comingSoon ? (
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 cursor-not-allowed opacity-60",
                    "text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded ml-auto">Soon</span>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
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

export default UserSidebar;