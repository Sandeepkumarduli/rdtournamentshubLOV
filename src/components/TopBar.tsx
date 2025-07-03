import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TopBarProps {
  userType: 'user' | 'admin' | 'system';
}

const TopBar = ({ userType }: TopBarProps) => {
  const location = useLocation();

  const pageLinks = [
    { label: 'Tournament Guide', path: '/tournament-guide' },
    { label: 'Rules', path: '/rules' },
    { label: 'Contact', path: '/contact' },
    { label: 'Wallet System', path: '/wallet-system' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="hidden md:flex items-center justify-center gap-4">
      {pageLinks.map((link) => (
        <Button
          key={link.path}
          variant={isActive(link.path) ? "default" : "ghost"}
          size="sm"
          asChild
        >
          <Link 
            to={link.path}
            className={cn(
              "text-sm font-medium transition-colors",
              isActive(link.path) 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        </Button>
      ))}
    </div>
  );
};

export default TopBar;