import { openai } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { chatbotConfig, buildSystemPrompt } from '@/lib/chatbot/config';

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
      suggestQuote: tool({
        description:
          'When user asks about pricing, quotes, or how much something costs, direct them to the quote calculator',
        inputSchema: z.object({ serviceName: z.string().optional() }),
        execute: async () => ({
          action: 'suggest_quote',
          message:
            'We provide custom quotes based on your vehicle and specific needs. You can use our Quote Calculator on the Services page for an estimate, or call us at (570) 730-4433 for a personalized quote.',
          quoteCalculatorUrl: '/services',
          phone: chatbotConfig.business.phone,
        }),
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
      lookupFitment: tool({
        description:
          'Look up compatible parts for a specific vehicle year/make/model',
        inputSchema: z.object({
          year: z.number(),
          make: z.string(),
          model: z.string(),
          trim: z.string().optional(),
          category: z.string().optional(),
        }),
        execute: async ({
          year,
          make,
          model,
          trim,
          category,
        }: {
          year: number;
          make: string;
          model: string;
          trim?: string;
          category?: string;
        }) => {
          const params = new URLSearchParams({
            year: String(year),
            make,
            model,
          });
          if (trim) params.set('trim', trim);
          if (category) params.set('category', category);

          try {
            const res = await fetch(
              `${process.env.BAYREADY_API_URL || 'https://bayready-production.up.railway.app'}/fitment?${params}`,
            );
            if (!res.ok) {
              return {
                message:
                  'Fitment lookup is not available yet. Please call us at (570) 730-4433 for vehicle-specific part recommendations.',
              };
            }
            return res.json();
          } catch {
            return {
              message:
                'Fitment lookup is not available yet. Please call us at (570) 730-4433 for vehicle-specific part recommendations.',
            };
          }
        },
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
