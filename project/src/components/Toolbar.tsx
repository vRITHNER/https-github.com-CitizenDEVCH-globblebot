import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Settings as SettingsIcon } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import '../styles/layout.css';

interface ToolbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ isAuthenticated, onLogout }) => {
  const { profile } = useProfile();
  const navigate = useNavigate();

  return (
    <div className="toolbar">
      <div className="toolbar-brand cursor-pointer" onClick={() => navigate('/')}>
        <Bot className="w-8 h-8 text-indigo-600" />
        <span className="toolbar-brand-text">GlobbleBot.ai</span>
      </div>

      <nav className="toolbar-nav">
        <Link to="/" className="toolbar-link">
          Home
        </Link>
        {isAuthenticated && (
          <Link to="/dashboard" className="toolbar-link">
            Dashboard
          </Link>
        )}
        <Link to="/contact" className="toolbar-link">
          Support
        </Link>
      </nav>

      <div className="toolbar-auth">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link to="/settings" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              <SettingsIcon className="w-4 h-4" />
              {profile?.display_name}
            </Link>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              type="button"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
export default Toolbar;