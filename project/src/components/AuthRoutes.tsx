import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';

interface AuthRoutesProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (displayName: string, email: string, password: string) => Promise<void>;
}

const AuthRoutes: React.FC<AuthRoutesProps> = ({ onLogin, onRegister }) => {
  return (
    <AuthLayout>
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/register" element={<Register onRegister={onRegister} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthLayout>
  );
};

export default AuthRoutes;
