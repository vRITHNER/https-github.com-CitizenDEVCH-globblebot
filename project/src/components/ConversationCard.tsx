import React from 'react';
import { Clock, MessageSquare } from 'lucide-react';
import type { ConversationTopic } from '../lib/types';

interface ConversationCardProps {
  topic: ConversationTopic;
  onSelect: (topic: ConversationTopic) => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({ topic, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
      onClick={() => onSelect(topic)}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{topic.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{topic.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>5-10 min</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          <span>{topic.difficulty}</span>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard