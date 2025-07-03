import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Trophy, 
  Wallet, 
  Settings,
  BarChart3,
  Plus,
  UserCheck
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: BarChart3,
  },
  {
    title: "Users",
    url: "/admin-dashboard?tab=users",
    icon: Users,
  },
  {
    title: "Tournaments",
    url: "/admin-dashboard?tab=tournaments", 
    icon: Trophy,
  },
  {
    title: "Teams",
    url: "/admin-dashboard?tab=teams",
    icon: UserCheck,
  },
  {
    title: "Wallets",
    url: "/admin-dashboard?tab=wallets",
    icon: Wallet,
  },
  {
    title: "Create",
    url: "/admin-dashboard?tab=create",
    icon: Plus,
  }
];

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  const isActive = (path: string) => {
    if (path === "/admin-dashboard" && location.pathname === "/admin-dashboard" && !location.search) {
      return true;
    }
    return currentPath === path;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div className="group-data-[collapsible=icon]:hidden">
              <h2 className="font-bold text-base">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Tournament Hub</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.url) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;