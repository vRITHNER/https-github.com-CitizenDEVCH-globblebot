import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { ConversationExchange } from '../lib/types';

interface ConversationFeedbackProps {
  exchanges: ConversationExchange[];
}

const ConversationFeedback: React.FC<ConversationFeedbackProps> = ({ exchanges }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center font-medium text-gray-700">Student</div>
        <div className="text-center font-medium text-gray-700">Accuracy</div>
        <div className="text-center font-medium text-gray-700">AI Teacher</div>
      </div>

      <div className="space-y-6">
        {exchanges.map((exchange) => (
          <div key={exchange.id} className="grid grid-cols-3 gap-4">
            {exchange.role === 'student' ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-800">{exchange.message}</p>
                  {exchange.feedback && ( // Always show feedback in history view
                    <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      <p className="text-sm text-gray-600">{exchange.feedback}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-600">
                    {exchange.accuracy}%
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg" />
              </>
            ) : (
              <>
                <div />
                <div />
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-gray-800">{exchange.message}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationFeedback;