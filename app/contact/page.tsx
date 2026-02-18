'use client';

import { useState } from 'react';
import { useBookingModal } from '@/components/BookingModalContext';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { openModal } = useBookingModal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to send');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[#00A0E0] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
              GET IN TOUCH
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              CONTACT US
            </h1>
            <p className="text-[#00A0E0]/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              Have questions or ready to start your project? We&apos;re here to help. Reach out today!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-black border-2 border-[#00A0E0]/30 p-8 md:p-12 neon-border-soft">
              <h2 className="text-3xl font-bold text-[#00A0E0] mb-8 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                SEND US A MESSAGE
              </h2>

              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-[#00A0E0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-[#00A0E0] mb-4 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    MESSAGE SENT!
                  </h3>
                  <p className="text-[#00A0E0]/70 font-mono mb-6">
                    Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="text-[#00A0E0] hover:text-[#00B8FF] font-mono underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono focus:outline-none focus:border-[#00A0E0] transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono focus:outline-none focus:border-[#00A0E0] transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono focus:outline-none focus:border-[#00A0E0] transition-colors"
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                      Service Interested In
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] font-mono focus:outline-none focus:border-[#00A0E0] transition-colors"
                    >
                      <option value="">Select a service</option>
                      <option value="window-tinting">Window Tinting</option>
                      <option value="car-audio">Car Audio</option>
                      <option value="remote-start">Remote Start</option>
                      <option value="security">Security Systems</option>
                      <option value="lighting">Custom Lighting</option>
                      <option value="accessories">Auto Accessories</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono focus:outline-none focus:border-[#00A0E0] transition-colors resize-none"
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-8 py-4 font-semibold text-lg hover:bg-[#00A0E0]/30 transition-all duration-300 neon-border-soft cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00A0E0]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        SENDING...
                      </span>
                    ) : (
                      'SEND MESSAGE'
                    )}
                  </button>

                  {submitStatus === 'error' && (
                    <p className="text-red-500 font-mono text-sm text-center">
                      Something went wrong. Please try again or call us directly.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Location Card */}
              <div className="bg-black border-2 border-[#00A0E0]/30 p-8 neon-border-soft">
                <div className="flex items-start gap-4">
                  <div className="text-[#00A0E0] neon-glow-soft">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#00A0E0] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                      LOCATION
                    </h3>
                    <p className="text-[#00A0E0]/70 font-mono">
                      944 North 9th Street<br />
                      Stroudsburg, PA 18360
                    </p>
                    <a
                      href="https://maps.google.com/?q=944+North+9th+Street+Stroudsburg+PA+18360"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#00A0E0] hover:text-[#00B8FF] font-mono text-sm mt-3 transition-colors"
                    >
                      Get Directions
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-black border-2 border-[#00A0E0]/30 p-8 neon-border-soft">
                <div className="flex items-start gap-4">
                  <div className="text-[#00A0E0] neon-glow-soft">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#00A0E0] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                      PHONE
                    </h3>
                    <a
                      href="tel:+15707304433"
                      className="text-[#00A0E0]/70 hover:text-[#00A0E0] font-mono text-lg transition-colors"
                    >
                      (570) 730-4433
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours Card */}
              <div className="bg-black border-2 border-[#00A0E0]/30 p-8 neon-border-soft">
                <div className="flex items-start gap-4">
                  <div className="text-[#00A0E0] neon-glow-soft">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#00A0E0] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                      BUSINESS HOURS
                    </h3>
                    <ul className="text-[#00A0E0]/70 font-mono space-y-1">
                      <li className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span className="text-[#00A0E0]">9AM - 7PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Saturday:</span>
                        <span className="text-[#00A0E0]">9AM - 2PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sunday:</span>
                        <span className="text-[#00A0E0]/50">Closed</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={openModal}
                  className="flex-1 text-center bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-6 py-4 font-semibold hover:bg-[#00A0E0]/30 transition-all duration-300 neon-border-soft cyber-button cursor-pointer"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  BOOK APPOINTMENT
                </button>
                <a
                  href="tel:+15707304433"
                  className="flex-1 text-center border-2 border-[#00A0E0]/50 bg-black text-[#00A0E0] px-6 py-4 font-semibold hover:border-[#00A0E0] transition-all duration-300 neon-border-soft cyber-button"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  CALL NOW
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Us — Google Map */}
      <section className="bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
                FIND US
              </h2>
              <p className="text-[#00A0E0]/80 font-mono text-sm md:text-base max-w-xl mx-auto">
                Located in Stroudsburg, PA — easily accessible from the Pocono Mountains and surrounding areas.
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <div className="border-2 border-[#00A0E0]/30 neon-border-soft overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12046.44235724779!2d-75.2157096!3d40.9900071!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c4891d338ef55b%3A0xd2a0254037c29699!2sNext%20Level%20Audio!5e0!3m2!1sen!2sph!4v1694036537644!5m2!1sen!2sph"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Next Level Audio — Google Maps"
                className="w-full"
              />
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
