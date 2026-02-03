'use client';

export default function VideoSection() {
  return (
    <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            SEE US IN ACTION
          </h2>
          <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
            Watch our expert technicians transform vehicles with premium installations and services
          </p>
        </div>

        <div className="max-w-4xl mx-auto border-2 border-[#00A0E0]/30 neon-border-soft overflow-hidden">
          <video
            controls
            preload="metadata"
            className="w-full"
            poster=""
          >
            <source src="/videos/about.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
