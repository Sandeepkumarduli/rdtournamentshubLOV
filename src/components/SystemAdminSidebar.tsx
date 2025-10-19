import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Crown, 
  Users, 
  Database, 
  Activity, 
  Settings,
  BarChart3,
  Shield,
  UserCheck,
  DollarSign,
  LogOut,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/system-admin-dashboard",
    icon: BarChart3,
  },
  {
    title: "User Management",
    url: "/system-users",
    icon: Users,
  },
  {
    title: "Transactions",
    url: "/system-transactions", 
    icon: DollarSign,
  },
  {
    title: "Org Admin Requests",
    url: "/system-admin-requests",
    icon: UserCheck,
  },
  {
    title: "Teams",
    url: "/system-teams",
    icon: Shield,
  },
  {
    title: "Reports",
    url: "/system-reports",
    icon: Activity,
  },
  {
    title: "Chat Center",
    url: "/system-chat",
    icon: MessageSquare,
  }
];

interface SystemAdminSidebarProps {
  isOpen?: boolean;
}

const SystemAdminSidebar = ({ isOpen = true }: SystemAdminSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={cn(
      "w-64 bg-card border-r border-border h-screen flex flex-col transition-transform duration-300",
      !isOpen && "-translate-x-full absolute z-50"
    )}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-gaming-gold" />
          <div>
            <h1 className="text-xl font-bold">System Control</h1>
            <p className="text-muted-foreground">Master Administration</p>
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

export default SystemAdminSidebar;
