'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChatWidget } from './ChatContext';
import { useBookingModal } from './BookingModalContext';
import { chatbotConfig } from '@/lib/chatbot/config';
import type { UIMessage } from 'ai';
import type { WidgetScreen, QuoteFormData, FitmentFormData } from './chat-widget/types';
import { INITIAL_QUOTE_FORM, INITIAL_FITMENT_FORM } from './chat-widget/types';
import ContactActionBar from './chat-widget/ContactActionBar';
import WelcomeScreen from './chat-widget/WelcomeScreen';
import ContactScreen from './chat-widget/ContactScreen';
import QuoteFlow from './chat-widget/QuoteFlow';
import FitmentFlow from './chat-widget/FitmentFlow';
import ChatScreen from './chat-widget/ChatScreen';
import SubmittedScreen from './chat-widget/SubmittedScreen';

const aiEnabled = process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === 'true';

const SCREEN_TITLES: Record<WidgetScreen, string> = {
  welcome: 'YOUR ASSISTANT',
  quote: 'GET A QUOTE',
  fitment: 'CHECK FITMENT',
  contact: 'CONTACT US',
  chat: 'AI ASSISTANT',
  submitted: 'REQUEST SENT',
};

export default function ChatWidget() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const { isOpen, toggleChat, closeChat } = useChatWidget();
  const { openModal } = useBookingModal();

  // State machine
  const [screen, setScreen] = useState<WidgetScreen>('welcome');
  const [quoteForm, setQuoteForm] = useState<QuoteFormData>(INITIAL_QUOTE_FORM);
  const [fitmentForm, setFitmentForm] = useState<FitmentFormData>(INITIAL_FITMENT_FORM);

  // AI chat (called unconditionally for Rules of Hooks)
  const welcomeMessage: UIMessage = {
    id: 'welcome',
    role: 'assistant',
    parts: [{ type: 'text', text: "How can I help? I can answer questions about our services, hours, and more." }],
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

  // Don't render on admin pages (guard after all hooks)
  if (isAdminRoute) return null;

  function resetAndClose() {
    closeChat();
    // Reset state after close animation
    setTimeout(() => {
      setScreen('welcome');
      setQuoteForm(INITIAL_QUOTE_FORM);
      setFitmentForm(INITIAL_FITMENT_FORM);
    }, 300);
  }

  function handleBook() {
    openModal();
    resetAndClose();
  }

  function handleNavigate(target: WidgetScreen) {
    setScreen(target);
  }

  function handleBack() {
    setScreen('welcome');
  }

  function handleQuoteSubmitted() {
    setScreen('submitted');
  }

  function handleStartOver() {
    setScreen('welcome');
    setQuoteForm(INITIAL_QUOTE_FORM);
    setFitmentForm(INITIAL_FITMENT_FORM);
  }

  function handleNavigateQuoteFromFitment() {
    setFitmentForm(INITIAL_FITMENT_FORM);
    setScreen('quote');
  }

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

      {/* Widget panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-full sm:h-[520px] flex flex-col bg-black border-2 border-[#00A0E0]/50 neon-border-soft chat-panel-enter">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#00A0E0]/30 bg-[#00A0E0]/5 shrink-0">
            <div className="flex items-center gap-3">
              {screen !== 'welcome' && (
                <button
                  onClick={handleBack}
                  className="text-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors cursor-pointer"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h3
                  className="text-[#00A0E0] text-sm font-bold tracking-wider neon-glow-soft"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  {chatbotConfig.business.name.toUpperCase()}
                </h3>
                <p
                  className="text-[#00A0E0]/60 text-xs tracking-widest"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  {SCREEN_TITLES[screen]}
                </p>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="w-8 h-8 flex items-center justify-center text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/10 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Screen content */}
          <div className="flex-1 flex flex-col min-h-0">
            {screen === 'welcome' && (
              <WelcomeScreen
                onBook={handleBook}
                onNavigate={handleNavigate}
                aiEnabled={aiEnabled}
              />
            )}

            {screen === 'quote' && (
              <QuoteFlow
                form={quoteForm}
                setForm={setQuoteForm}
                onSubmitted={handleQuoteSubmitted}
                onBack={handleBack}
              />
            )}

            {screen === 'fitment' && (
              <FitmentFlow
                form={fitmentForm}
                setForm={setFitmentForm}
                onBack={handleBack}
                onNavigateQuote={handleNavigateQuoteFromFitment}
              />
            )}

            {screen === 'contact' && <ContactScreen />}

            {screen === 'chat' && (
              <ChatScreen
                messages={messages}
                sendMessage={sendMessage}
                status={status}
              />
            )}

            {screen === 'submitted' && (
              <SubmittedScreen
                quoteData={quoteForm}
                onStartOver={handleStartOver}
                onClose={resetAndClose}
              />
            )}
          </div>

          {/* Contact action bar (shown on all screens except chat which has its own input) */}
          {screen !== 'chat' && <ContactActionBar />}
        </div>
      )}
    </>
  );
}
