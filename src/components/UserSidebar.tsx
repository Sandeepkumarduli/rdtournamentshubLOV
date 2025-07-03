import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Wallet, 
  User,
  GamepadIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/tournaments', label: 'Tournaments', icon: Trophy },
  { path: '/dashboard/teams', label: 'Teams', icon: Users },
  { path: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { path: '/dashboard/groups', label: 'Groups', icon: GamepadIcon },
  { path: '/dashboard/profile', label: 'Profile', icon: User },
];

const UserSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <GamepadIcon className="h-8 w-8 text-gaming-gold" />
          <div>
            <h1 className="text-xl font-bold">BGMI Hub</h1>
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
            
            return (
              <li key={item.path}>
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
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default UserSidebar;