export const chatbotConfig = {
  business: {
    name: 'Next Level Audio',
    tagline: 'Elevate Your Journey With Our Expert Touch',
    address: '944 North 9th Street, Stroudsburg, PA 18360',
    phone: '(570) 730-4433',
    email: 'nextlevelauto@ymail.com',
    hours: {
      'Monday - Friday': '9AM - 7PM',
      'Saturday': '9AM - 2PM',
      'Sunday': 'Closed',
    } as Record<string, string>,
    services: [
      {
        name: 'Window Tinting',
        description:
          'Professional window tinting to reduce glare, increase privacy, and enhance comfort. Premium films that block harmful UV rays while maintaining crystal-clear visibility.',
        features: [
          'UV Protection up to 99%',
          'Heat Rejection Technology',
          'Glare Reduction',
          'Enhanced Privacy',
          'Lifetime Warranty Available',
          'Multiple Shade Options',
        ],
      },
      {
        name: 'Car Audio',
        description:
          'High-quality car audio installations from basic speaker upgrades to complete custom sound systems. Premium audio experiences tailored to your needs and budget.',
        features: [
          'Custom Speaker Installation',
          'Subwoofer & Amplifier Setup',
          'Head Unit Upgrades',
          'Sound Deadening',
          'Bluetooth Integration',
          'Factory System Enhancement',
        ],
      },
      {
        name: 'Remote Start',
        description:
          'Remote start systems that let you start your vehicle from the comfort of your home or office, ensuring the perfect temperature when you drive.',
        features: [
          '2-Way Remote Systems',
          'Smartphone Integration',
          'Extended Range Options',
          'Keyless Entry Combo',
          'Security Features',
          'Professional Installation',
        ],
      },
      {
        name: 'Security Systems',
        description:
          'State-of-the-art vehicle security systems. From basic alarms to advanced GPS tracking, comprehensive solutions to keep your vehicle safe.',
        features: [
          'Car Alarms',
          'GPS Tracking',
          'Kill Switch Installation',
          'Shock Sensors',
          'Smartphone Alerts',
          'Insurance Discounts',
        ],
      },
      {
        name: 'Custom Lighting',
        description:
          'Custom lighting solutions from LED headlight upgrades to interior ambient lighting. Stand out on the road.',
        features: [
          'LED Headlight Conversion',
          'Interior LED Lighting',
          'Underglow Kits',
          'Accent Lighting',
          'DRL Installation',
          'Custom Color Options',
        ],
      },
      {
        name: 'Auto Accessories',
        description:
          'Your one-stop shop for automotive accessories. Custom wheels, vinyl wraps, dash cams, backup cameras, and more.',
        features: [
          'Backup Cameras',
          'Dash Cameras',
          'Phone Mounts & Chargers',
          'Floor Mats & Liners',
          'Vinyl Wraps',
          'Custom Wheels & Tires',
        ],
      },
    ],
  },
  theme: {
    primaryColor: '#00A0E0',
    bgColor: '#000000',
    fontFamily: 'var(--font-oxanium)',
    monoFont: 'var(--font-geist-mono)',
  },
  ui: {
    welcomeMessage: 'Hey! How can we help you today?',
    placeholder: 'Type your question...',
    position: 'bottom-right' as const,
  },
  quickActions: [
    { id: 'book', label: 'Book an Appointment', icon: 'calendar' as const, action: 'open_booking_modal' as const },
    { id: 'quote', label: 'Get a Quote', icon: 'dollar' as const, action: 'navigate' as const, screen: 'quote' as const },
    { id: 'fitment', label: 'Check Fitment', icon: 'wrench' as const, action: 'navigate' as const, screen: 'fitment' as const },
    { id: 'contact', label: 'Contact Us', icon: 'phone' as const, action: 'navigate' as const, screen: 'contact' as const },
  ],
  contactActions: [
    { id: 'text', label: 'Text', icon: 'message-square' as const, href: 'sms:+15707304433' },
    { id: 'call', label: 'Call', icon: 'phone' as const, href: 'tel:+15707304433' },
    { id: 'email', label: 'Email', icon: 'mail' as const, href: 'mailto:nextlevelauto@ymail.com' },
    { id: 'directions', label: 'Map', icon: 'map-pin' as const, href: 'https://maps.google.com/?q=944+North+9th+Street+Stroudsburg+PA+18360', external: true },
  ],
  quoteServices: [
    { id: 'window-tinting', label: 'Window Tinting' },
    { id: 'car-audio', label: 'Car Audio' },
    { id: 'remote-start', label: 'Remote Start' },
    { id: 'security-systems', label: 'Security Systems' },
    { id: 'custom-lighting', label: 'Custom Lighting' },
    { id: 'auto-accessories', label: 'Auto Accessories' },
    { id: 'other', label: 'Other / Not Sure' },
  ],
};

export type ChatbotConfig = typeof chatbotConfig;

export function buildSystemPrompt(config: ChatbotConfig): string {
  const servicesList = config.business.services
    .map(
      (s) =>
        `- ${s.name}: ${s.description}\n  Features: ${s.features.join(', ')}`,
    )
    .join('\n');

  const hoursList = Object.entries(config.business.hours)
    .map(([day, hours]) => `  ${day}: ${hours}`)
    .join('\n');

  return `You are the AI assistant for ${config.business.name}. ${config.business.tagline}.

IDENTITY:
- You represent ${config.business.name}, a professional automotive electronics and customization shop
- You are friendly, knowledgeable, and enthusiastic about cars and automotive upgrades
- Keep responses concise and helpful — aim for 2-3 sentences unless the customer asks for details
- Use a casual but professional tone

SERVICES WE OFFER:
${servicesList}

BUSINESS HOURS:
${hoursList}

LOCATION:
${config.business.address}

CONTACT:
- Phone: ${config.business.phone}
- Email: ${config.business.email}

RULES:
- Always be accurate with business information (hours, location, contact)
- When a customer wants to schedule or book, use the suggestBooking tool
- When asked about a specific service, use the getServiceInfo tool
- When asked about hours, use the getBusinessHours tool
- When asked about contact info or location, use the getContactInfo tool
- When asked about what parts fit a specific vehicle (year/make/model), use the lookupFitment tool
- When asked about pricing, cost, or quotes, use the suggestQuote tool — never make up prices
- When the customer wants to call or speak to a person, use the suggestCall tool
- If you don't know something or it's beyond what you can help with, use the suggestCall tool
- Do not discuss competitors or other businesses
- Keep the conversation focused on our services and how we can help`;
}
