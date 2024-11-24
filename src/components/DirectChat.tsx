import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Clock, AlertCircle } from 'lucide-react';
import { useAssistantStore } from '../store/assistantStore';
import { startAssistantChat, sendMessageToAssistant } from '../lib/openai';

interface DirectChatProps {
  isDark: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: string;
  unreadCount?: number;
  isAssistant?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export default function DirectChat({ isDark }: DirectChatProps) {
  const [message, setMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getAssistantForCharacter } = useAssistantStore();
  const echoAssistant = getAssistantForCharacter('deep-tree-echo');

  const contacts: Contact[] = [
    {
      id: 'echo',
      name: 'Deep Tree Echo',
      avatar: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&h=150&fit=crop',
      status: 'online',
      isAssistant: true
    },
    {
      id: 'sage',
      name: 'Neural Sage',
      avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&h=150&fit=crop',
      status: 'offline',
      lastSeen: '2024-03-15T14:30:00Z',
      isAssistant: true
    }
  ];

  useEffect(() => {
    if (selectedContact === 'echo' && !threadId) {
      initializeChat();
    }
  }, [selectedContact]);

  const initializeChat = async () => {
    if (!echoAssistant) {
      setError('Deep Tree Echo is not linked to an OpenAI Assistant');
      return;
    }

    try {
      const newThreadId = await startAssistantChat(echoAssistant.id);
      setThreadId(newThreadId);
      setError(null);
    } catch (err) {
      setError('Failed to start chat. Please check your API key.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact || !threadId || !echoAssistant) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      content: message.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setError(null);
    setLoading(true);

    try {
      const response = await sendMessageToAssistant(threadId, echoAssistant.id, message.trim());
      
      setMessages(prev => [
        ...prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' } : m),
        {
          id: Date.now().toString(),
          senderId: selectedContact,
          content: response,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setMessages(prev => 
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'error' } : m)
      );
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="flex h-full">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>
        <div className="overflow-y-auto">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                selectedContact === contact.id ? 'bg-gray-50 dark:bg-gray-700' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  contact.status === 'online'
                    ? 'bg-green-400'
                    : contact.status === 'busy'
                    ? 'bg-red-400'
                    : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {contact.name}
                  </p>
                  {contact.unreadCount && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {contact.status === 'offline' && contact.lastSeen ? (
                    <>
                      <Clock className="w-3 h-3" />
                      Last seen {formatLastSeen(contact.lastSeen)}
                    </>
                  ) : (
                    <>
                      {contact.isAssistant ? (
                        <Bot className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {contact.status}
                    </>
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/50 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              {messages.map((msg) => {
                const isUser = msg.senderId === 'user';
                const contact = contacts.find(c => c.id === msg.senderId);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {!isUser && contact && (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-md rounded-lg p-3 ${
                        isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{msg.timestamp.toLocaleTimeString()}</span>
                        {msg.status === 'sending' && <span>Sending...</span>}
                        {msg.status === 'error' && (
                          <span className="text-red-500">Failed to send</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                  <span>Deep Tree Echo is typing...</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading || !threadId}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !threadId}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}