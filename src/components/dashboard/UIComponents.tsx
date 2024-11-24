import { ReactNode } from 'react';

interface MessageBubbleProps {
  sender: string;
  text: string;
  isSent?: boolean;
}

export function MessageBubble({ sender, text, isSent = false }: MessageBubbleProps) {
  return (
    <div className={`message ${isSent ? 'sent' : 'received'}`}>
      <div className="message-bubble">
        <div className="message-sender">{sender}</div>
        <div className="message-text">{text}</div>
      </div>
    </div>
  );
}

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isOpen: boolean;
}

export function Modal({ title, children, onClose, isOpen }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

interface NotificationProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
}

export function Notification({ message, type = 'info', onClose }: NotificationProps) {
  return (
    <div className={`notification ${type} show`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          &times;
        </button>
      </div>
    </div>
  );
}