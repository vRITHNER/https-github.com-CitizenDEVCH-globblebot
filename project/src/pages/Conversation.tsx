import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Square, Send, History, MessageCircle, Languages } from 'lucide-react';
import type { ConversationTopic, ConversationExchange } from '../lib/types';
import ConversationStatus from '../components/ConversationStatus';
import { useProfile } from '../contexts/ProfileContext';
import ConversationFeedback from '../components/ConversationFeedback';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Conversation: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [topic, setTopic] = useState<ConversationTopic | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [message, setMessage] = useState('');
  const [exchanges, setExchanges] = useState<ConversationExchange[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasExistingConversation, setHasExistingConversation] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) {
      toast.error('Please sign in to access conversations');
      navigate('/login');
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [exchanges]);

  useEffect(() => {
    const fetchTopicAndConversation = async () => {
      try {
        // Get topic
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('*')
          .eq('id', topicId)
          .single();

        if (topicError) throw topicError;
        if (!topicData) {
          navigate('/');
          return;
        }
        setTopic(topicData);

        // Get latest conversation
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: convData, error: convError } = await supabase
            .rpc('get_conversation_history', {
              p_user_id: userData.user.id,
              p_topic_id: topicId
            });

          if (convError) throw convError;

          if (convData && convData.length > 0) {
            const conversation = convData[0];
            setHasExistingConversation(true);
            setConversationHistory(convData);
            // Auto-select most recent conversation and show its details
            if (!isActive) {
              setSelectedConversationId(conversation.conversation_id);
              setExchanges(conversation.exchanges);
            }
            if (!conversation.ended_at) {
              // Resume unfinished conversation
              setConversationId(conversation.conversation_id);
              setExchanges(conversation.exchanges);
              setIsActive(true);
              setDuration(
                Math.floor((Date.now() - new Date(conversation.started_at).getTime()) / 1000)
              );
            }
          }
        }
      } catch (error) {
        toast.error('Error loading conversation');
        navigate('/');
      }
    };

    fetchTopicAndConversation();
  }, [topicId, navigate]);

  useEffect(() => {
    let timer: number;
    if (isActive) {
      timer = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const handleStart = async () => {
    try {
      setExchanges([]); // Clear any existing exchanges
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to start a conversation');
        return;
      }

      // Create new conversation
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          topic_id: topicId,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) throw convError;
      setConversationId(conv.id);

      // Add initial AI message
      const { error: msgError } = await supabase
        .from('conversation_exchanges')
        .insert({
          conversation_id: conv.id,
          role: 'ai',
          message: 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
          timestamp: new Date().toISOString()
        });

      if (msgError) throw msgError;

      setIsActive(true);
      setExchanges([{
        id: '1',
        role: 'ai',
        message: 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      toast.error('Error starting conversation');
    }
  };

  const handleStop = async () => {
    if (!conversationId) return;

    setIsActive(false);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get current exchanges to calculate accuracy
      const studentExchanges = exchanges.filter(e => e.role === 'student' && e.accuracy);
      const averageAccuracy = studentExchanges.length > 0
        ? studentExchanges.reduce((acc, e) => acc + (e.accuracy || 0), 0) / studentExchanges.length
        : null;

      // Update conversation end time and stats
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          ended_at: new Date().toISOString(),
          duration,
          accuracy: averageAccuracy
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;

      setShowFeedback(false);
      setConversationId(null);
      
      // Refresh conversation history
      const { data: historyData, error: historyError } = await supabase
        .rpc('get_conversation_history', {
          p_user_id: user.id,
          p_topic_id: topicId
        });

      if (historyError) throw historyError;
      
      setConversationHistory(historyData || []);
      setHasExistingConversation(true);
      // Auto-select the just-ended conversation
      setSelectedConversationId(conversationId);
      
      // Keep the current exchanges visible
      setExchanges(exchanges);
    } catch (error) {
      toast.error('Error saving conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    try {
      const timestamp = new Date().toISOString();
      const accuracy = Math.floor(Math.random() * 30) + 70; // Simulated accuracy
      const feedback = 'Consider using more formal language. Pay attention to verb conjugation.';

      // Add student message
      const { error: studentError } = await supabase
        .from('conversation_exchanges')
        .insert({
          conversation_id: conversationId,
          role: 'student',
          message: message.trim(),
          accuracy,
          feedback,
          timestamp
        });

      if (studentError) throw studentError;

      // Add AI response
      const { error: aiError } = await supabase
        .from('conversation_exchanges')
        .insert({
          conversation_id: conversationId,
          role: 'ai',
          message: 'Je comprends. Pouvez-vous me dire plus?',
          timestamp: new Date().toISOString()
        });

      if (aiError) throw aiError;

      const newExchanges: ConversationExchange[] = [
        ...exchanges,
        {
          id: Date.now().toString(),
          role: 'student',
          message: message.trim(),
          timestamp,
          accuracy,
          feedback
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          message: 'Je comprends. Pouvez-vous me dire plus?',
          timestamp: new Date().toISOString()
        }
      ];

      setExchanges(newExchanges);
      setMessage('');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const handleTranslate = async (exchangeId: string, message: string) => {
    // In a real app, this would call a translation API
    // For now, we'll just simulate a translation
    const translatedText = `[Translated] ${message}`;
    setTranslatedMessages(prev => ({
      ...prev,
      [exchangeId]: translatedText
    }));
  };

  if (!topic) return null;

  return (
    <div className="main-content pb-20 flex flex-col h-screen">
      <div className="flex-none pt-6 pb-8 bg-white border-b border-gray-200">
        <div className="px-4 container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{topic.title}</h1>
              <p className="text-gray-600">{topic.description}</p>
            </div>
            {hasExistingConversation && !isActive && (
              <button
                onClick={() => {
                  const latestConv = conversationHistory[0];
                  setSelectedConversationId(latestConv.conversation_id);
                  setExchanges(latestConv.exchanges);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <History className="w-5 h-5" />
                View History
              </button>
            )}
            {!isActive && (
              <button
                onClick={() => {
                  setExchanges([]); // Clear exchanges before starting new conversation
                  setSelectedConversationId(null);
                  handleStart();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md ml-4"
              >
                <Play className="w-5 h-5" />
                Start New Conversation
              </button>
            )}
            {isActive && (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md ml-4"
              >
                <Square className="w-5 h-5" />
                End Conversation
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {!isActive && hasExistingConversation && (
            <>
              <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversation History</h3>
                <div className="space-y-4">
                  {conversationHistory.map((conv) => (
                    <button
                      key={conv.conversation_id}
                      className={`w-full text-left p-4 rounded-lg transition-colors border shadow-sm ${
                        selectedConversationId === conv.conversation_id
                          ? 'bg-indigo-50 border-2 border-indigo-200'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => {
                        setSelectedConversationId(conv.conversation_id);
                        setExchanges(conv.exchanges);
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {new Date(conv.started_at).toLocaleDateString()} at {new Date(conv.started_at).toLocaleTimeString()}
                          {!conv.ended_at && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                              In Progress
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="text-indigo-600 font-medium">
                            {conv.accuracy !== null ? `${conv.accuracy}% accuracy` : 'No accuracy data'}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-500">{Math.floor(conv.duration / 60)}m {conv.duration % 60}s</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {selectedConversationId && <ConversationFeedback exchanges={exchanges} />}
              </div>
            </>
          )}

          {isActive && (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center">
                {isActive && (
                  <div className="flex-1 flex flex-col">
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
                    >
                      {exchanges.map((exchange) => (
                        <div
                          key={exchange.id}
                          className={`flex ${
                            exchange.role === 'ai' ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              exchange.role === 'ai'
                                ? 'bg-blue-50'
                                : 'bg-indigo-600'
                            } ${exchange.role === 'student' ? 'group' : ''}`}
                          >
                            <div className="relative">
                              <p className={`${exchange.role === 'ai' ? 'text-gray-800' : 'text-white'} mb-2`}>
                                {translatedMessages[exchange.id] || exchange.message}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                {exchange.role === 'student' && exchange.feedback && (
                                  <button
                                    onClick={() => setShowFeedback(!showFeedback)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 transition-all"
                                    title={showFeedback ? "Hide Feedback" : "Show Feedback"}
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    Feedback
                                  </button>
                                )}
                                <button
                                  onClick={() => handleTranslate(exchange.id, exchange.message)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 transition-all"
                                  title="Translate"
                                >
                                  <Languages className="w-4 h-4" />
                                  Translate
                                </button>
                              </div>
                              
                              {exchange.role === 'student' && (
                                <>
                                  {exchange.accuracy && (
                                    <div className="inline-block px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium mb-2">
                                      {exchange.accuracy}%
                                    </div>
                                  )}
                                  {showFeedback && exchange.feedback && (
                                    <div className="mt-2 text-white/90 text-xs">
                                      <p className="font-medium mb-1">Feedback:</p>
                                      {exchange.feedback}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 p-4 border-t border-gray-200">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSendMessage();
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConversationStatus isActive={isActive} duration={duration} />
    </div>
  );
};

export default Conversation;