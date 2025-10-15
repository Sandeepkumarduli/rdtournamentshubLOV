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

interface UserSidebarProps {
  isOpen: boolean;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ isOpen }) => {
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
    return path.startsWith('/dashboard/report') || 
           path.startsWith('/dashboard/wallet');
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <GamepadIcon className="h-8 w-8 text-gaming-gold" />
          <div>
            <h1 className="text-xl font-bold">RDTH</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/dashboard');
          
          const isLocked = isFrozen && !isPageAllowed(item.path);
          
          return (
            <div key={item.path}>
              {item.comingSoon || isLocked ? (
                <div 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 cursor-not-allowed opacity-60",
                    "text-muted-foreground"
                  )}
                  {...(isLocked && { onClick: (e) => handleLockedClick(e, item.label) })}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isLocked ? (
                    <Lock className="h-4 w-4 ml-auto text-destructive" />
                  ) : (
                    <span className="text-xs bg-muted px-2 py-1 rounded ml-auto">Soon</span>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          );
        })}
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
    </aside>
  );
};

export default UserSidebar;