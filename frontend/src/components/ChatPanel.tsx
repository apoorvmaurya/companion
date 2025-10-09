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
    <div className="w-full h-full bg-slate-800 border-l border-slate-700 flex flex-col">
      <div className="p-3 sm:p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
        <h2 className="text-white font-semibold text-base sm:text-lg">Chat</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors active:scale-90"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm text-center px-4">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] sm:max-w-xs px-3 sm:px-4 py-2 rounded-2xl shadow-lg ${
                msg.sender_type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-700 text-white rounded-bl-sm'
              }`}
            >
              <p className="text-xs sm:text-sm break-words">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-slate-700 px-3 sm:px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              <p className="text-xs sm:text-sm text-slate-400">Typing...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-700 bg-slate-900/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 sm:px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-slate-600"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-all active:scale-90 shadow-lg hover:shadow-blue-500/30"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
