import { useRef, useEffect, useState } from 'react';
import type { UIMessage } from 'ai';

interface ChatScreenProps {
  messages: UIMessage[];
  sendMessage: (params: { text: string }) => void;
  status: string;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export default function ChatScreen({ messages, sendMessage, status }: ChatScreenProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((message) => {
          if (message.role !== 'user' && message.role !== 'assistant') return null;
          const text = getMessageText(message);
          if (!text) return null;

          const isUser = message.role === 'user';
          return (
            <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-3 py-2 text-sm font-mono leading-relaxed ${
                  isUser
                    ? 'bg-[#00A0E0]/20 text-[#00A0E0] border border-[#00A0E0]/30'
                    : 'bg-[#0a0a0a] text-[#00A0E0]/90 border border-[#00A0E0]/15'
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#0a0a0a] border border-[#00A0E0]/15 px-4 py-2">
              <div className="flex space-x-1.5">
                <span className="w-1.5 h-1.5 bg-[#00A0E0] typing-dot" />
                <span className="w-1.5 h-1.5 bg-[#00A0E0] typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 bg-[#00A0E0] typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t-2 border-[#00A0E0]/30 p-3 flex gap-2 bg-[#00A0E0]/5"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/30 focus:outline-none focus:border-[#00A0E0]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 bg-[#00A0E0]/20 border border-[#00A0E0]/50 text-[#00A0E0] hover:bg-[#00A0E0]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Send message"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}
