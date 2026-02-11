'use client';

import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

type Animation = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up';

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
  threshold?: number;
}

const animationClasses: Record<Animation, string> = {
  'fade-up': 'animate-fade-up',
  'fade-in': 'animate-fade-in',
  'slide-left': 'animate-slide-left',
  'slide-right': 'animate-slide-right',
  'scale-up': 'animate-scale-up',
};

export default function AnimateOnScroll({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
  threshold = 0.1,
}: AnimateOnScrollProps) {
  const { ref, isInView } = useInView({ threshold });

  return (
    <div
      ref={ref}
      className={`${isInView ? animationClasses[animation] : 'opacity-0'} ${className}`}
      style={delay > 0 ? { animationDelay: `${delay}s`, animationFillMode: 'both' } : { animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}
