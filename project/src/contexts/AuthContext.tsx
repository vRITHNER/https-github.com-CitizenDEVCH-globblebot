import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface StudentRole {
  id: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          toast.error('Error fetching user profile');
          return;
        }
      }

      toast.success('Successfully logged in!');
      setIsAuthenticated(true);
      navigate('/');
    } catch {
      toast.error('Error logging in');
    }
  };

  const register = async (displayName: string, email: string, password: string) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName.trim()
          }
        }
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      if (!data?.user) {
        toast.error('Registration failed');
        return;
      }

      await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: displayName.trim(),
        email: email.trim()
      });

      const { data: roleData } = await supabase.rpc('get_student_role').single<StudentRole>();

      if (roleData?.id) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role_id: roleData.id,
        });
      }

      toast.success('Successfully registered! Please sign in.');
      navigate('/login');
    } catch {
      toast.error('Error during registration');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out!');
      setIsAuthenticated(false);
      navigate('/');
    } catch {
      toast.error('Error signing out');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
