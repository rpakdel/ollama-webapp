
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onStop: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, onStop }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-2xl border border-slate-800">
              <i className="fas fa-comment-dots"></i>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-300">Welcome to Ollama Explorer</h2>
              <p className="max-w-xs mt-2 text-sm">Select a model on the left and start a local conversation.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isLatest = idx === messages.length - 1;
            const showCursor = isLatest && isLoading && msg.role === Role.ASSISTANT;
            
            return (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.role === Role.USER ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'
                  }`}>
                    <i className={`text-xs fas ${msg.role === Role.USER ? 'fa-user' : 'fa-robot'}`}></i>
                  </div>
                  <div className={`p-4 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-lg relative ${
                    msg.role === Role.USER 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    <div className="text-sm md:text-base">
                      {msg.content || (isLoading && msg.role === Role.ASSISTANT ? '' : '')}
                      {showCursor && (
                        <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" aria-hidden="true"></span>
                      )}
                      {!msg.content && isLoading && msg.role === Role.ASSISTANT && (
                        <span className="text-slate-500 italic text-sm">Generating...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 md:p-6 bg-gradient-to-t from-slate-950 to-transparent">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Shift + Enter for new line)"
            rows={1}
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-2xl px-5 py-4 pr-14 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none min-h-[56px] transition-all"
            style={{ height: 'auto' }}
          />
          
          <div className="absolute right-3 bottom-3 flex gap-2">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="w-10 h-10 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg"
                title="Stop generation"
              >
                <i className="fas fa-stop text-sm"></i>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            )}
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-600 mt-3">
          Running on local infrastructure • Data privacy assured
        </p>
      </div>
    </div>
  );
};
