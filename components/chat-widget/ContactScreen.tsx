import { chatbotConfig } from '@/lib/chatbot/config';

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="currentColor" fill="none" />
    </svg>
  );
}

const CONTACT_METHODS = [
  {
    icon: PhoneIcon,
    title: 'CALL US',
    detail: chatbotConfig.business.phone,
    href: 'tel:+15707304433',
    cta: 'TAP TO CALL',
  },
  {
    icon: MessageIcon,
    title: 'TEXT US',
    detail: chatbotConfig.business.phone,
    href: 'sms:+15707304433',
    cta: 'TAP TO TEXT',
  },
  {
    icon: MailIcon,
    title: 'EMAIL US',
    detail: chatbotConfig.business.email,
    href: `mailto:${chatbotConfig.business.email}`,
    cta: 'SEND EMAIL',
  },
];

export default function ContactScreen() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
      {CONTACT_METHODS.map((method) => (
        <a
          key={method.title}
          href={method.href}
          className="block border border-[#E01020]/20 bg-[#0a0a0a] p-4 hover:border-[#E01020]/60 hover:bg-[#E01020]/5 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <method.icon className="w-5 h-5 text-[#E01020]/60 group-hover:text-[#E01020] transition-colors" />
            <span
              className="text-xs text-[#E01020]/60 tracking-widest font-bold"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {method.title}
            </span>
          </div>
          <div className="text-[#E01020] text-sm font-mono mb-2">{method.detail}</div>
          <div
            className="text-[10px] text-[#E01020]/40 tracking-wider group-hover:text-[#E01020]/70 transition-colors"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {method.cta}
          </div>
        </a>
      ))}

      {/* Business Hours */}
      <div className="border border-[#E01020]/10 bg-[#0a0a0a] p-4 mt-4">
        <h4
          className="text-xs text-[#E01020]/60 tracking-widest font-bold mb-3"
          style={{ fontFamily: 'var(--font-oxanium)' }}
        >
          BUSINESS HOURS
        </h4>
        <div className="space-y-1.5">
          {Object.entries(chatbotConfig.business.hours).map(([day, hours]) => (
            <div key={day} className="flex justify-between text-xs font-mono">
              <span className="text-[#E01020]/50">{day}</span>
              <span className="text-[#E01020]/80">{hours}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
