import React, { useState, memo } from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = memo(({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about reservoir computing..."
          disabled={disabled}
          className={cn(
            "flex-1 min-h-[44px] max-h-32 rounded-lg border border-gray-300 px-4 py-2",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none",
            "disabled:bg-gray-50 disabled:text-gray-500"
          )}
          rows={1}
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="flex-shrink-0"
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>
      <p className="mt-2 text-xs text-gray-500 text-right">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;