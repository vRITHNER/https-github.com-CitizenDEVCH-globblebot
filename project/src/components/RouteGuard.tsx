import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
  isAuthRoute?: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, isAuthRoute = false }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
