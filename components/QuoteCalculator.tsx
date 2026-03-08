'use client';

import { useState } from 'react';

const HOURLY_RATE = 125;

const services = [
  { id: 'window-tinting', title: 'Window Tinting', minHours: 1, maxHours: 2 },
  { id: 'car-audio', title: 'Car Audio Installation', minHours: 2, maxHours: 4 },
  { id: 'remote-start', title: 'Remote Start', minHours: 1.5, maxHours: 3 },
  { id: 'security-systems', title: 'Security Systems', minHours: 2, maxHours: 3 },
  { id: 'lighting', title: 'Custom Lighting', minHours: 1, maxHours: 2 },
  { id: 'accessories', title: 'Auto Accessories', minHours: 0.5, maxHours: 1.5 },
];

export default function QuoteCalculator() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const { totalMinHours, totalMaxHours } = selectedServices.reduce(
    (acc, id) => {
      const service = services.find(s => s.id === id);
      if (service) {
        acc.totalMinHours += service.minHours;
        acc.totalMaxHours += service.maxHours;
      }
      return acc;
    },
    { totalMinHours: 0, totalMaxHours: 0 }
  );

  const minPrice = Math.round(totalMinHours * HOURLY_RATE);
  const maxPrice = Math.round(totalMaxHours * HOURLY_RATE);

  return (
    <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow font-oxanium">
            QUOTE CALCULATOR
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
            Get an instant estimate for your automotive needs. Select the services you&apos;re interested in below.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {services.map((service) => {
              const selected = selectedServices.includes(service.id);
              const svcMin = Math.round(service.minHours * HOURLY_RATE);
              const svcMax = Math.round(service.maxHours * HOURLY_RATE);
              return (
                <div
                  key={service.id}
                  className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                    selected
                      ? 'border-[#E01020] bg-[#E01020]/10'
                      : 'border-[#E01020]/30 hover:border-[#E01020]/60'
                  } neon-border-soft`}
                  onClick={() => toggleService(service.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#E01020] mb-2 font-oxanium">
                        {service.title}
                      </h3>
                      <p className="text-white/50 font-mono text-sm">
                        {service.minHours}–{service.maxHours} hrs
                      </p>
                      <p className="text-white/70 font-mono">
                        ${svcMin.toLocaleString()} – ${svcMax.toLocaleString()}
                      </p>
                    </div>
                    <div className={`w-6 h-6 border-2 border-[#E01020] flex items-center justify-center ${
                      selected ? 'bg-[#E01020]' : ''
                    }`}>
                      {selected && (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <div className="bg-black border-2 border-[#E01020]/50 p-8 neon-border-soft">
              <h3 className="text-2xl font-bold text-[#E01020] mb-4 font-oxanium">
                ESTIMATED QUOTE
              </h3>
              {selectedServices.length > 0 ? (
                <>
                  <p className="text-4xl font-bold text-white neon-glow">
                    ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}
                  </p>
                  <p className="text-white/50 mt-2 font-mono text-sm">
                    {totalMinHours}–{totalMaxHours} hours @ ${HOURLY_RATE}/hr
                  </p>
                </>
              ) : (
                <p className="text-2xl text-white/40 font-mono">
                  Select services above
                </p>
              )}
              <p className="text-white/40 mt-4 font-mono text-xs">
                Actual quote depends on job complexity. Contact us for a precise estimate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
