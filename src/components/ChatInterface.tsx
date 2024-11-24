import React, { useRef, useEffect } from 'react';
import { useChat } from '../lib/hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import WelcomeCard from './WelcomeCard';
import { Brain } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Divider } from './ui/divider';

export default function ChatInterface() {
  const { messages, sendMessage, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="px-4 py-3 flex flex-row items-center gap-2">
        <Brain className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="font-semibold text-gray-900">ReservoirChat</h2>
          <p className="text-sm text-gray-500">Powered by ReservoirPy</p>
        </div>
      </CardHeader>

      <Divider />

      <CardContent className="flex-1 p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[500px] max-h-[600px]">
          {messages.length === 0 ? (
            <WelcomeCard />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  isBot={message.isBot}
                  message={message.text}
                  timestamp={message.timestamp}
                />
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>ReservoirChat is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </CardContent>
    </Card>
  );
}