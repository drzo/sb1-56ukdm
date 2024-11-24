import React, { useState } from 'react';
import { Users, Send, Clock, Zap, Bot, User } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  type: 'human' | 'bot';
  avatar: string;
  status: 'active' | 'typing' | 'waiting';
}

interface Message {
  id: string;
  participantId: string;
  content: string;
  timestamp: Date;
}

interface GroupChatProps {
  isDark: boolean;
}

export default function GroupChat({ isDark }: GroupChatProps) {
  const [message, setMessage] = useState('');
  const [chatMode, setChatMode] = useState<'realtime' | 'turnbased'>('realtime');
  const [currentTurn, setCurrentTurn] = useState(0);
  
  // Sample participants
  const [participants] = useState<Participant[]>([
    {
      id: 'echo',
      name: 'Deep Tree Echo',
      type: 'bot',
      avatar: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&h=150&fit=crop',
      status: 'active'
    },
    {
      id: 'sage',
      name: 'Neural Sage',
      type: 'bot',
      avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&h=150&fit=crop',
      status: 'waiting'
    },
    {
      id: 'user1',
      name: 'Alice',
      type: 'human',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      status: 'active'
    },
    {
      id: 'user2',
      name: 'Bob',
      type: 'human',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      status: 'waiting'
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      participantId: 'echo',
      content: 'Welcome everyone to our discussion. Today we\'ll be exploring neural architectures.',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      participantId: 'user1',
      content: 'Thanks for hosting, Echo! I\'m particularly interested in attention mechanisms.',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '3',
      participantId: 'sage',
      content: 'Attention mechanisms are fascinating. They\'ve revolutionized how neural networks process sequential data.',
      timestamp: new Date(Date.now() - 180000)
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Handle message submission based on chat mode
    if (chatMode === 'turnbased') {
      setCurrentTurn((prev) => (prev + 1) % participants.length);
    }

    setMessage('');
  };

  const getCurrentParticipant = () => {
    return participants[currentTurn];
  };

  return (
    <div className="flex h-full">
      {/* Participants Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Participants</h3>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              {participants.length}
            </span>
          </div>

          {/* Chat Mode Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setChatMode('realtime')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1
                ${chatMode === 'realtime'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
            >
              <Zap className="w-4 h-4" />
              Real-time
            </button>
            <button
              onClick={() => setChatMode('turnbased')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1
                ${chatMode === 'turnbased'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
            >
              <Clock className="w-4 h-4" />
              Turn-based
            </button>
          </div>

          {/* Participants List */}
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  chatMode === 'turnbased' && getCurrentParticipant().id === participant.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/50'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="relative">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                    participant.status === 'active'
                      ? 'bg-green-400'
                      : participant.status === 'typing'
                      ? 'bg-yellow-400'
                      : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {participant.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {participant.type === 'bot' ? (
                      <Bot className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    {participant.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const participant = participants.find(p => p.id === msg.participantId);
            if (!participant) return null;

            return (
              <div key={msg.id} className="flex items-start gap-3">
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {participant.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {chatMode === 'turnbased' && (
            <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Current turn: {getCurrentParticipant().name}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Type your message... ${chatMode === 'turnbased' ? '(Turn-based mode)' : ''}`}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              disabled={chatMode === 'turnbased' && getCurrentParticipant().type === 'bot'}
            />
            <button
              type="submit"
              disabled={chatMode === 'turnbased' && getCurrentParticipant().type === 'bot'}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}