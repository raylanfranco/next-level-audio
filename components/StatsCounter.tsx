'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from '@/hooks/useInView';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 500, suffix: '+', label: 'Installs Completed' },
  { value: 10, suffix: '+', label: 'Years Experience' },
  { value: 1000, suffix: '+', label: 'Happy Customers' },
  { value: 5, suffix: '★', label: 'Average Rating' },
];

function AnimatedNumber({ target, suffix, started }: { target: number; suffix: string; started: boolean }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!started) return;

    const duration = 2000; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [started, target]);

  return (
    <span>
      {count}{suffix}
    </span>
  );
}

export default function StatsCounter() {
  const { ref, isInView } = useInView({ threshold: 0.3 });

  return (
    <section className="py-16 md:py-24 bg-black relative overflow-hidden border-t-2 border-b-2 border-[#00A0E0]/20">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center ${isInView ? 'animate-fade-up' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'both' }}
            >
              <div
                className="text-4xl md:text-6xl font-bold text-[#00A0E0] mb-2 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                <AnimatedNumber target={stat.value} suffix={stat.suffix} started={isInView} />
              </div>
              <div className="text-[#00A0E0]/60 font-mono text-sm md:text-base uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
