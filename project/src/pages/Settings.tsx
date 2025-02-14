import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, GraduationCap, BookOpen } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import '../styles/settings.css';

const Settings: React.FC = () => {
  const { profile, setProfile, refreshProfile } = useProfile();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const updateProfile = async (displayName: string) => {
    try {
      if (!profile?.id) return;

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, display_name: displayName } : null);
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  return (
    <div className="main-content">
      <div className="container py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 px-4 py-2 mb-4">
                <SettingsIcon className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-800">Settings</span>
              </div>
              
              <nav className="space-y-1">
                <Link
                  to="/settings"
                  className="settings-nav-item active"
                >
                  <User className="w-5 h-5" />
                  <span>Account</span>
                </Link>
                <Link
                  to="/settings/learning"
                  className="settings-nav-item"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Learning</span>
                </Link>
                {profile?.is_admin && (
                  <Link
                    to="/settings/topics"
                    className="settings-nav-item"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Topics</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 ml-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>
              
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const displayName = (form.elements.namedItem('displayName') as HTMLInputElement).value;
                  updateProfile(displayName);
                }}>
                  <div className="space-y-6">
                    <div className="form-group">
                      <label htmlFor="displayName" className="form-label">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        defaultValue={profile?.display_name}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profile?.email || ''}
                        className="form-input bg-gray-50"
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <button type="submit" className="auth-button max-w-xs">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;