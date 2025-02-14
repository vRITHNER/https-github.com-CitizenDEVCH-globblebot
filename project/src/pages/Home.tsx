import React, { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ConversationTopic } from '../lib/types';
import ConversationCard from '../components/ConversationCard';
import SignInDialog from '../components/SignInDialog';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import '../styles/layout.css';

interface HomeProps {
  isAuthenticated: boolean;
}

const Home: React.FC<HomeProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<ConversationTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTopics(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load topics';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const [showSignInDialog, setShowSignInDialog] = useState(false);

  const handleTopicSelect = (topic: ConversationTopic) => {
    if (!isAuthenticated) {
      setShowSignInDialog(true);
      return;
    }
    navigate(`/conversation/${topic.id}`);
  };

  const handleDialogClose = () => {
    setShowSignInDialog(false);
  };

  return (
    <div className="main-content">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Bot className="w-20 h-20 mx-auto mb-8" />
            <h1 className="text-5xl font-bold mb-6">
              Practice French Conversation
            </h1>
            <p className="text-xl mb-8">
              Choose a conversation topic and start practicing with our AI language partner
            </p>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Popular Conversation Topics</h2>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Try Again
              </button>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No conversation topics available at the moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {topics.map((topic) => (
                <ConversationCard
                  key={topic.id}
                  topic={topic}
                  onSelect={handleTopicSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <SignInDialog isOpen={showSignInDialog} onClose={handleDialogClose} />
    </div>
  );
};

export default Home;
