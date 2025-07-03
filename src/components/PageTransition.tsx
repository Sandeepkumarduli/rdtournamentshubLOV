import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageTransitionProps {
  children: React.ReactNode;
  trigger?: string | number; // Changes when navigation occurs
}

const PageTransition = ({ children, trigger }: PageTransitionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (trigger) {
      setIsLoading(true);
      setShowContent(false);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShowContent(true);
      }, 500); // Reduced loading time for better UX

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
};

export default PageTransition;