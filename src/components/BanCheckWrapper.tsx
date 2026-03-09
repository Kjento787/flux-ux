import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBanStatus } from '@/hooks/useBanStatus';

interface BanCheckWrapperProps {
  children: ReactNode;
}

const BanCheckWrapper = ({ children }: BanCheckWrapperProps) => {
  const { isBanned, isLoading } = useBanStatus();
  const location = useLocation();

  // Don't check ban status on the banned page itself or auth page
  if (location.pathname === '/banned' || location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to banned page if user is banned
  if (isBanned) {
    return <Navigate to="/banned" replace />;
  }

  return <>{children}</>;
};

export default BanCheckWrapper;
