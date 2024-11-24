import { useState, useCallback } from 'react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: 0,
  text: "Hi! I'm ReservoirChat, an AI assistant specialized in Reservoir Computing. I can help you understand concepts, implement models, and solve problems related to reservoir computing. How can I assist you today?",
  isBot: true,
  timestamp: new Date()
};

const RESPONSES = [
  "Based on ReservoirPy's documentation, Echo State Networks (ESN) are a type of recurrent neural network where the internal weights are randomly initialized and remain fixed. Only the output weights are trained.",
  "Here's a simple example of how to create an ESN using ReservoirPy:\n```python\nfrom reservoirpy.nodes import Reservoir, Ridge\n\n# Create reservoir with 100 units\nreservoir = Reservoir(100, sr=0.9, lr=0.3)\nreadout = Ridge(ridge=1e-6)\n\n# Connect them to create an ESN\nesn = reservoir >> readout\n```",
  "The spectral radius (sr) parameter controls the dynamics of the reservoir. A value less than 1.0 ensures the echo state property, making the network stable.",
  "For time series prediction, you'll want to consider the memory capacity of your reservoir. This depends on factors like reservoir size and spectral radius."
];

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);

  const simulateTyping = async (text: string) => {
    setIsTyping(true);
    // Simulate typing delay based on message length
    await new Promise(resolve => setTimeout(resolve, Math.min(1000, text.length * 20)));
    setIsTyping(false);
  };

  const sendMessage = useCallback(async (text: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date()
    }]);

    // Simulate bot typing
    setIsTyping(true);

    // Select a response based on keywords
    let response = "I'm currently in development. For the full experience, please visit https://chat.reservoirpy.inria.fr/";
    
    if (text.toLowerCase().includes('esn') || text.toLowerCase().includes('network')) {
      response = RESPONSES[0];
    } else if (text.toLowerCase().includes('example') || text.toLowerCase().includes('code')) {
      response = RESPONSES[1];
    } else if (text.toLowerCase().includes('spectral') || text.toLowerCase().includes('radius')) {
      response = RESPONSES[2];
    } else if (text.toLowerCase().includes('time series') || text.toLowerCase().includes('prediction')) {
      response = RESPONSES[3];
    }

    // Simulate typing delay
    await simulateTyping(response);

    // Add bot response
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: response,
      isBot: true,
      timestamp: new Date()
    }]);
  }, []);

  return {
    messages,
    sendMessage,
    isTyping
  };
}