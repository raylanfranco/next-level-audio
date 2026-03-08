import { openai } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { chatbotConfig, buildSystemPrompt, servicePricing, HOURLY_RATE } from '@/lib/chatbot/config';

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: buildSystemPrompt(chatbotConfig),
    messages: modelMessages,
    tools: {
      getServiceInfo: tool({
        description: 'Get detailed info about a specific service',
        inputSchema: z.object({ serviceName: z.string() }),
        execute: async ({ serviceName }: { serviceName: string }) => {
          const svc = chatbotConfig.business.services.find((s) =>
            s.name.toLowerCase().includes(serviceName.toLowerCase()),
          );
          return svc || { error: 'Service not found' };
        },
      }),
      getBusinessHours: tool({
        description: 'Get business hours',
        inputSchema: z.object({}),
        execute: async () => chatbotConfig.business.hours,
      }),
      getContactInfo: tool({
        description: 'Get contact information and location',
        inputSchema: z.object({}),
        execute: async () => ({
          phone: chatbotConfig.business.phone,
          email: chatbotConfig.business.email,
          address: chatbotConfig.business.address,
        }),
      }),
      suggestBooking: tool({
        description:
          'When user wants to book or schedule an appointment, return a booking prompt',
        inputSchema: z.object({ serviceName: z.string().optional() }),
        execute: async () => ({ action: 'open_booking_modal' }),
      }),
      getQuoteEstimate: tool({
        description:
          'Get a price estimate for one or more services. Use when user asks about pricing, quotes, or how much something costs.',
        inputSchema: z.object({
          serviceNames: z.array(z.string()).describe('Service names to get estimates for, e.g. ["Window Tinting", "Car Audio"]'),
        }),
        execute: async ({ serviceNames }: { serviceNames: string[] }) => {
          const matched = serviceNames.map((name) => {
            const svc = servicePricing.find((s) =>
              s.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(s.name.toLowerCase().replace(' installation', ''))
            );
            if (svc) {
              return {
                service: svc.name,
                hoursRange: `${svc.minHours}-${svc.maxHours} hours`,
                priceRange: `$${Math.round(svc.minHours * HOURLY_RATE)}-$${Math.round(svc.maxHours * HOURLY_RATE)}`,
                minPrice: Math.round(svc.minHours * HOURLY_RATE),
                maxPrice: Math.round(svc.maxHours * HOURLY_RATE),
              };
            }
            return { service: name, error: 'Service not found in pricing list' };
          });

          const totalMin = matched.reduce((sum, m) => sum + (('minPrice' in m ? m.minPrice : 0) as number), 0);
          const totalMax = matched.reduce((sum, m) => sum + (('maxPrice' in m ? m.maxPrice : 0) as number), 0);

          return {
            estimates: matched,
            totalRange: matched.length > 1 ? `$${totalMin}-$${totalMax}` : undefined,
            hourlyRate: HOURLY_RATE,
            disclaimer: 'These are labor estimates. Final pricing depends on vehicle and job complexity. Parts/materials are additional. Call (570) 730-4433 for a precise quote.',
            phone: chatbotConfig.business.phone,
          };
        },
      }),
      suggestCall: tool({
        description:
          'When user wants to call, speak to someone, or needs help beyond what the chatbot can provide',
        inputSchema: z.object({}),
        execute: async () => ({
          action: 'suggest_call',
          phone: chatbotConfig.business.phone,
          phoneLink: `tel:${chatbotConfig.business.phone.replace(/[^0-9]/g, '')}`,
          message: `Give us a call at ${chatbotConfig.business.phone} — we're happy to help!`,
        }),
      }),
      // Fitment disabled until BayReady fitment database is populated
      lookupFitment: tool({
        description:
          'Look up compatible parts for a specific vehicle — currently unavailable, direct customer to call',
        inputSchema: z.object({
          year: z.number(),
          make: z.string(),
          model: z.string(),
        }),
        execute: async () => ({
          message:
            'Our fitment database is currently being built. Please call us at (570) 730-4433 and we\'ll help you find the right parts for your vehicle!',
        }),
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
