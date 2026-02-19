import { chatbotConfig } from '@/lib/chatbot/config';
import type { WidgetScreen } from './types';

function ActionIcon({ name, className }: { name: string; className?: string }) {
  const cls = className || 'w-5 h-5';
  switch (name) {
    case 'calendar':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        </svg>
      );
    case 'dollar':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case 'wrench':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'phone':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
      );
    default:
      return null;
  }
}

interface WelcomeScreenProps {
  onBook: () => void;
  onNavigate: (screen: WidgetScreen) => void;
  aiEnabled: boolean;
}

export default function WelcomeScreen({ onBook, onNavigate, aiEnabled }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto scrollbar-hide">
      <p
        className="text-[#00A0E0]/80 text-sm mb-6 text-center"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
      >
        {chatbotConfig.ui.welcomeMessage}
      </p>

      <div className="space-y-2">
        {chatbotConfig.quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (action.action === 'open_booking_modal') {
                onBook();
              } else if ('screen' in action && action.screen) {
                onNavigate(action.screen as WidgetScreen);
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#00A0E0]/20 text-[#00A0E0] hover:border-[#00A0E0]/60 hover:bg-[#00A0E0]/10 transition-all text-left cursor-pointer group"
          >
            <span className="text-[#00A0E0]/60 group-hover:text-[#00A0E0] transition-colors shrink-0">
              <ActionIcon name={action.icon} className="w-5 h-5" />
            </span>
            <span
              className="text-sm tracking-wide"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {action.label}
            </span>
          </button>
        ))}

        {aiEnabled && (
          <button
            onClick={() => onNavigate('chat')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#00A0E0]/20 text-[#00A0E0] hover:border-[#00A0E0]/60 hover:bg-[#00A0E0]/10 transition-all text-left cursor-pointer group"
          >
            <span className="text-[#00A0E0]/60 group-hover:text-[#00A0E0] transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </span>
            <span
              className="text-sm tracking-wide"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              Ask a Question
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
