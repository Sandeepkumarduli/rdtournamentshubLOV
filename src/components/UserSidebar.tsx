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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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
  const { open } = useSidebar();
  
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
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <GamepadIcon className="h-8 w-8 text-gaming-gold" />
            {open && (
              <div>
                <h1 className="text-xl font-bold">RDTH</h1>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path === '/dashboard' && location.pathname === '/dashboard');
                
                const isLocked = isFrozen && !isPageAllowed(item.path);
                
                return (
                  <SidebarMenuItem key={item.path}>
                    {item.comingSoon || isLocked ? (
                      <div 
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 cursor-not-allowed opacity-60",
                          "text-muted-foreground w-full"
                        )}
                        {...(isLocked && { onClick: (e) => handleLockedClick(e, item.label) })}
                      >
                        <Icon className="h-5 w-5" />
                        {open && (
                          <>
                            <span>{item.label}</span>
                            {isLocked ? (
                              <Lock className="h-4 w-4 ml-auto text-destructive" />
                            ) : (
                              <span className="text-xs bg-muted px-2 py-1 rounded ml-auto">Soon</span>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive}>
                        <NavLink
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3",
                            isActive && "font-medium"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {open && <span>{item.label}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button at Bottom */}
        <div className="mt-auto p-4 border-t border-border">
          <button
            onClick={() => {
              localStorage.removeItem("userAuth");
              window.location.href = "/";
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-accent w-full"
          >
            <LogOut className="h-5 w-5" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default UserSidebar;