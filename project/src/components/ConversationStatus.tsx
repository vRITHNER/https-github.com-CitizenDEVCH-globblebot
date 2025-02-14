import React from 'react';
import { Mic } from 'lucide-react';

interface ConversationStatusProps {
  isActive: boolean;
  duration: number;
}

const ConversationStatus: React.FC<ConversationStatusProps> = ({ isActive, duration }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="font-medium">{formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Mic className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {isActive ? 'Recording...' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationStatus