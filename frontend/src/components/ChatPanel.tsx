import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Send, Loader as Loader2 } from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { wsService } from '../services/websocket';
import { format } from 'date-fns';

interface ChatPanelProps {
  onClose: () => void;
  roomId: string;
}

export function ChatPanel({ onClose, roomId }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isTyping, addMessage, setTyping } = useChatStore();

  useEffect(() => {
    const handleMessage = (data: any) => {
      addMessage({
        id: Date.now().toString(),
        sender_type: data.sender_type,
        content: data.content,
        timestamp: new Date().toISOString()
      });
      setTyping(false);
    };

    const handleTyping = () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 3000);
    };

    wsService.on('chat_message', handleMessage);
    wsService.on('companion_typing', handleTyping);

    return () => {
      wsService.off('chat_message', handleMessage);
      wsService.off('companion_typing', handleTyping);
    };
  }, [addMessage, setTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender_type: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };

    addMessage(newMessage);
    wsService.emit('chat_message', {
      roomId,
      message: message
    });

    setMessage('');
  };

  return (
    <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Chat</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.sender_type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              <p className="text-sm text-slate-400">Typing...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
