export const chatbotConfig = {
  business: {
    name: 'Next Level Audio',
    tagline: 'Elevate Your Journey With Our Expert Touch',
    address: '944 North 9th Street, Stroudsburg, PA 18360',
    phone: '(570) 730-4433',
    email: 'nextlevelaudio@ymail.com',
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
    welcomeMessage:
      "Hey! I'm the Next Level Audio assistant. How can I help you today?",
    placeholder: 'Ask about our services...',
    position: 'bottom-right' as const,
  },
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
