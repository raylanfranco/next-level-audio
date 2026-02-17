'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useChatWidget } from './ChatContext';
import { useBookingModal } from './BookingModalContext';
import { chatbotConfig } from '@/lib/chatbot/config';
import type { UIMessage } from 'ai';

export default function ChatWidget() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const { isOpen, toggleChat, closeChat } = useChatWidget();
  const { openModal } = useBookingModal();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');

  const welcomeMessage: UIMessage = {
    id: 'welcome',
    role: 'assistant',
    parts: [{ type: 'text', text: chatbotConfig.ui.welcomeMessage }],
  };

  const { messages, sendMessage, status } = useChat({
    id: 'nla-chat',
    messages: [welcomeMessage],
    onToolCall({ toolCall }: { toolCall: { toolName: string } }) {
      if (toolCall.toolName === 'suggestBooking') {
        openModal();
      }
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Don't render on admin pages (guard placed after all hooks to respect Rules of Hooks)
  if (isAdminRoute) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  // Extract text from message parts
  const getMessageText = (message: UIMessage): string => {
    return message.parts
      .filter(
        (part): part is { type: 'text'; text: string } => part.type === 'text',
      )
      .map((part) => part.text)
      .join('');
  };

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-black border-2 border-[#00A0E0] flex items-center justify-center hover:bg-[#00A0E0]/20 transition-all duration-300 pulse-glow cursor-pointer"
          aria-label="Open chat"
        >
          <svg
            className="w-7 h-7 text-[#00A0E0]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-full sm:h-[520px] flex flex-col bg-black border-2 border-[#00A0E0]/50 neon-border-soft chat-panel-enter">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#00A0E0]/30 bg-[#00A0E0]/5 shrink-0">
            <div>
              <h3
                className="text-[#00A0E0] text-sm font-bold tracking-wider neon-glow-soft"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                NEXT LEVEL AUDIO
              </h3>
              <p
                className="text-[#00A0E0]/60 text-xs tracking-widest"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                AI ASSISTANT
              </p>
            </div>
            <button
              onClick={closeChat}
              className="w-8 h-8 flex items-center justify-center text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/10 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((message) => {
              if (message.role !== 'user' && message.role !== 'assistant')
                return null;
              const text = getMessageText(message);
              if (!text) return null;

              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
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
                    <span
                      className="w-1.5 h-1.5 bg-[#00A0E0] typing-dot"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#00A0E0] typing-dot"
                      style={{ animationDelay: '0.4s' }}
                    />
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
              placeholder={chatbotConfig.ui.placeholder}
              className="flex-1 bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/30 focus:outline-none focus:border-[#00A0E0]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 bg-[#00A0E0]/20 border border-[#00A0E0]/50 text-[#00A0E0] hover:bg-[#00A0E0]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send message"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19V5m0 0l-7 7m7-7l7 7"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
