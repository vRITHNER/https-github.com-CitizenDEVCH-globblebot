import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Conversation from './pages/Conversation';
import TopicsAdmin from './pages/TopicsAdmin';
import Settings from './pages/Settings';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <ProfileProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Main Layout Routes */}
        <Route element={<MainLayout isAuthenticated={isAuthenticated} onLogout={logout} />}>
          {/* Public Routes within MainLayout */}
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected Routes */}
          <Route path="/settings/topics" element={
            <PrivateRoute>
              <TopicsAdmin />
            </PrivateRoute>
          } />
          <Route path="/settings/*" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
          <Route path="/conversation/:topicId" element={
            <PrivateRoute>
              <Conversation />
            </PrivateRoute>
          } />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-right" />
    </ProfileProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
