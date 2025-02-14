import React, { useState } from 'react';
import { Mail, User, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/auth.css';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a production environment, you would typically:
    // 1. Send this to your backend API
    // 2. Use a service like SendGrid, AWS SES, or similar
    // 3. Store the contact request in your database
    
    // For now, we'll just show a success message
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    
    // Clear the form
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="main-content">
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-8">
              <MessageSquare className="w-12 h-12 text-indigo-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Contact Support
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-input min-h-[150px] resize-y"
                  placeholder="How can we help you?"
                  required
                />
              </div>

              <button type="submit" className="auth-button flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-center text-gray-600">
                <p className="mb-4">
                  Need immediate assistance?
                </p>
                <a
                  href="mailto:support@globblebot.ai"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  support@globblebot.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;