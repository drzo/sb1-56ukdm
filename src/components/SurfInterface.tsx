import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe } from 'lucide-react';
import { useStore } from '../store';
import { Message } from '../types';
import { sendMessage } from '../api/openai';
import TokenModal from './TokenModal';

export default function SurfInterface() {
  const { 
    messages, 
    addMessage, 
    openaiToken,
    browserWindow,
    setBrowserWindow,
    setShowOpenAITokenModal 
  } = useStore();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      setBrowserWindow(iframeRef.current.contentWindow);
    }
    return () => setBrowserWindow(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!openaiToken) {
      setShowOpenAITokenModal(true);
      return;
    }

    const userMessage: Message = { role: 'user', content: input.trim() };
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(input.trim());
      addMessage({ 
        role: 'assistant', 
        content: response 
      });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      addMessage({ 
        role: 'assistant', 
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.` 
      });
      
      if (error instanceof Error && (
        error.message.includes('token') || 
        error.message.includes('API key') ||
        error.message.includes('authentication')
      )) {
        setShowOpenAITokenModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!openaiToken) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="text-center">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">OpenAI Configuration Required</h2>
          <p className="text-gray-600 mb-4">
            Please configure your OpenAI API key to start using the Surf interface
          </p>
          <button
            onClick={() => setShowOpenAITokenModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Configure API Key
          </button>
        </div>
        <TokenModal />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white">
      <div className="w-1/2 flex flex-col border-r">
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message or command..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`rounded-lg px-6 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="w-1/2 h-full">
        <iframe
          ref={iframeRef}
          title="Sandbox Browser"
          sandbox="allow-same-origin allow-scripts"
          className="w-full h-full border-none"
          src="about:blank"
        />
      </div>
      
      <TokenModal />
    </div>
  );
}