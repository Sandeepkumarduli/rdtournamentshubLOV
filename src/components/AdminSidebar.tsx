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
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    title: "ORG Chat",
    url: "/org-dashboard?tab=org-chat",
    icon: MessageSquare,
  }
];

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;

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
            
            return (
              <li key={item.title}>
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
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;