import { chatbotConfig } from '@/lib/chatbot/config';

function ContactIcon({ name, className }: { name: string; className?: string }) {
  const cls = className || 'w-5 h-5';
  switch (name) {
    case 'message-square':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
    case 'phone':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
      );
    case 'mail':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="currentColor" fill="none" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="currentColor" fill="none" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ContactActionBar() {
  return (
    <div className="shrink-0 border-t-2 border-[#00A0E0]/30 bg-[#00A0E0]/5 px-4 py-2 flex items-center justify-around">
      {chatbotConfig.contactActions.map((action) => (
        <a
          key={action.id}
          href={action.href}
          target={'external' in action && action.external ? '_blank' : undefined}
          rel={'external' in action && action.external ? 'noopener noreferrer' : undefined}
          className="flex flex-col items-center gap-1 text-[#00A0E0]/50 hover:text-[#00A0E0] transition-colors py-1 px-2"
        >
          <ContactIcon name={action.icon} />
          <span
            className="text-[9px] uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {action.label}
          </span>
        </a>
      ))}
    </div>
  );
}
