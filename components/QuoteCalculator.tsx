'use client';

import { useState } from 'react';

const services = [
  { id: 'window-tinting', title: 'Window Tinting', price: 150 },
  { id: 'car-audio', title: 'Car Audio Installation', price: 300 },
  { id: 'remote-start', title: 'Remote Start', price: 200 },
  { id: 'security-systems', title: 'Security Systems', price: 250 },
  { id: 'lighting', title: 'Custom Lighting', price: 180 },
  { id: 'accessories', title: 'Auto Accessories', price: 100 },
];

export default function QuoteCalculator() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const total = selectedServices.reduce((sum, id) => {
    const service = services.find(s => s.id === id);
    return sum + (service?.price || 0);
  }, 0);

  return (
    <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            QUOTE CALCULATOR
          </h2>
          <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
            Get an instant estimate for your automotive needs. Select the services you're interested in below.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {services.map((service) => (
              <div
                key={service.id}
                className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                  selectedServices.includes(service.id)
                    ? 'border-[#00A0E0] bg-[#00A0E0]/10'
                    : 'border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                } neon-border-soft`}
                onClick={() => toggleService(service.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#00A0E0] mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                      {service.title}
                    </h3>
                    <p className="text-[#00A0E0]/70 font-mono">${service.price}</p>
                  </div>
                  <div className={`w-6 h-6 border-2 border-[#00A0E0] flex items-center justify-center ${
                    selectedServices.includes(service.id) ? 'bg-[#00A0E0]' : ''
                  }`}>
                    {selectedServices.includes(service.id) && (
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-black border-2 border-[#00A0E0]/50 p-8 rounded-lg neon-border-soft">
              <h3 className="text-2xl font-bold text-[#00A0E0] mb-4" style={{ fontFamily: 'var(--font-oxanium)' }}>
                ESTIMATED TOTAL
              </h3>
              <p className="text-4xl font-bold text-white neon-glow">
                ${total.toLocaleString()}
              </p>
              <p className="text-[#00A0E0]/60 mt-4 font-mono">
                * This is a placeholder estimate. Actual prices may vary based on specific requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}