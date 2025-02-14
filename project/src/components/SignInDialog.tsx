import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInDialog: React.FC<SignInDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
        <p className="text-gray-600 mb-6">
          Please sign in or create an account to start practicing conversations.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInDialog;
