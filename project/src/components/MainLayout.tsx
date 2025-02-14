import React from 'react';
import { Outlet } from 'react-router-dom';
import Toolbar from './Toolbar';

interface MainLayoutProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
