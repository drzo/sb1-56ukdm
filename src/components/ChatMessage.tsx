import React, { memo } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { CodeBlock } from './ui/code-block';

interface ChatMessageProps {
  isBot: boolean;
  message: string;
  timestamp: Date;
}

const ChatMessage = memo(({ isBot, message, timestamp }: ChatMessageProps) => {
  const hasCodeBlock = message.includes('```');
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(timestamp);

  return (
    <div className={cn(
      'flex gap-3 p-4 rounded-lg transition-colors',
      isBot ? 'bg-gray-50' : 'bg-white'
    )}>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isBot ? 'bg-indigo-600' : 'bg-purple-600'
      )}>
        {isBot ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {isBot ? 'ReservoirChat' : 'You'}
          </span>
          <span className="text-xs text-gray-500">{formattedTime}</span>
        </div>
        <div>
          {hasCodeBlock ? (
            <CodeBlock content={message} />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;