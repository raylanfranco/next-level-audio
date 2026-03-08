'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { formatPhone } from '@/lib/formatPhone';

const EMPLOYMENT_STATUS_KEYS = ['lookingForNew', 'unemployed', 'selfEmployed'] as const;
const EMPLOYMENT_TYPE_KEYS = ['fullTime', 'partTime', 'subContract'] as const;
const DESIRED_POSITION_KEYS = [
  'carAudioInstaller',
  'windowTintTech',
  'remoteStartTech',
  'vinylWrapInstaller',
  'generalShopHelp',
  'other',
] as const;

export default function CareersPage() {
  const t = useTranslations('careers');
  const tc = useTranslations('common');
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    employment_status: '',
    employment_type: '',
    desired_positions: [] as string[],
    message: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'applicant_phone' ? formatPhone(value) : value }));
  };

  const handlePositionToggle = (position: string) => {
    setFormData((prev) => ({
      ...prev,
      desired_positions: prev.desired_positions.includes(position)
        ? prev.desired_positions.filter((p) => p !== position)
        : [...prev.desired_positions, position],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setErrorMessage(t('fileTooLarge'));
      e.target.value = '';
      return;
    }
    setResumeFile(file);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const coverLetterParts: string[] = [];
      if (formData.employment_status) coverLetterParts.push(`Employment Status: ${formData.employment_status}`);
      if (formData.employment_type) coverLetterParts.push(`Employment Type: ${formData.employment_type}`);
      if (formData.desired_positions.length > 0) coverLetterParts.push(`Desired Position(s): ${formData.desired_positions.join(', ')}`);
      if (formData.message) coverLetterParts.push(`\nMessage:\n${formData.message}`);

      const body = new FormData();
      body.append('applicant_name', formData.applicant_name);
      body.append('applicant_email', formData.applicant_email);
      body.append('applicant_phone', formData.applicant_phone);
      body.append('cover_letter', coverLetterParts.join('\n'));
      if (formData.desired_positions.length > 0) {
        body.append('position', formData.desired_positions.join(', '));
      }
      if (resumeFile) {
        body.append('resume', resumeFile);
      }

      const res = await fetch('/api/careers/applications', {
        method: 'POST',
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitStatus('success');
      setFormData({ applicant_name: '', applicant_email: '', applicant_phone: '', employment_status: '', employment_type: '', desired_positions: [], message: '' });
      setResumeFile(null);
      setAgreedToTerms(false);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* 50/50 Split — Form (left) + Hero Image (right) */}
      <section ref={formRef} className="relative min-h-screen bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

          {/* Left — Application Form */}
          <div className="flex items-start justify-center px-6 pt-36 pb-16 md:px-12 lg:pt-32 lg:pb-20">
            <div className="w-full max-w-full">
              <div className="bg-black border-2 border-[#E01020]/30 p-8 md:p-10 neon-border-soft">
                {submitStatus === 'success' ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#E01020] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-[#E01020] mb-4 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                      {t('applicationSubmitted')}
                    </h3>
                    <p className="text-white/70 font-mono mb-6">
                      {t('thankYou')}
                    </p>
                    <button
                      onClick={() => setSubmitStatus('idle')}
                      className="text-[#E01020] hover:text-[#FF2A3A] font-mono underline cursor-pointer"
                    >
                      {t('submitAnother')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="applicant_name" className="block text-white font-mono text-sm mb-2 uppercase">
                        {t('fullName')}
                      </label>
                      <input
                        type="text"
                        id="applicant_name"
                        name="applicant_name"
                        value={formData.applicant_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-black border-2 border-[#E01020]/30 text-white placeholder-white/40 font-mono focus:outline-none focus:border-[#E01020] transition-colors"
                        placeholder={t('fullNamePlaceholder')}
                      />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="applicant_email" className="block text-white font-mono text-sm mb-2 uppercase">
                          {t('emailLabel')}
                        </label>
                        <input
                          type="email"
                          id="applicant_email"
                          name="applicant_email"
                          value={formData.applicant_email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-black border-2 border-[#E01020]/30 text-white placeholder-white/40 font-mono focus:outline-none focus:border-[#E01020] transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="applicant_phone" className="block text-white font-mono text-sm mb-2 uppercase">
                          {t('phoneLabel')}
                        </label>
                        <input
                          type="tel"
                          id="applicant_phone"
                          name="applicant_phone"
                          value={formData.applicant_phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-black border-2 border-[#E01020]/30 text-white placeholder-white/40 font-mono focus:outline-none focus:border-[#E01020] transition-colors"
                          placeholder="(555) 555-5555"
                        />
                      </div>
                    </div>

                    {/* Employment Status */}
                    <div>
                      <p className="text-white font-mono text-sm mb-3 uppercase">
                        {t('employmentStatus')}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {EMPLOYMENT_STATUS_KEYS.map((key) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="employment_status"
                              value={t(key)}
                              checked={formData.employment_status === t(key)}
                              onChange={handleChange}
                              className="appearance-none w-4 h-4 border-2 border-[#E01020]/50 checked:bg-[#E01020] checked:border-[#E01020] transition-colors cursor-pointer"
                            />
                            <span className="text-white/70 font-mono text-sm group-hover:text-white transition-colors">{t(key)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Employment Type */}
                    <div>
                      <p className="text-white font-mono text-sm mb-3 uppercase">
                        {t('employmentType')}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {EMPLOYMENT_TYPE_KEYS.map((key) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="employment_type"
                              value={t(key)}
                              checked={formData.employment_type === t(key)}
                              onChange={handleChange}
                              className="appearance-none w-4 h-4 border-2 border-[#E01020]/50 checked:bg-[#E01020] checked:border-[#E01020] transition-colors cursor-pointer"
                            />
                            <span className="text-white/70 font-mono text-sm group-hover:text-white transition-colors">{t(key)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Desired Positions */}
                    <div>
                      <p className="text-white font-mono text-sm mb-3 uppercase">
                        {t('desiredPositions')}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DESIRED_POSITION_KEYS.map((key) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={formData.desired_positions.includes(t(key))}
                              onChange={() => handlePositionToggle(t(key))}
                              className="appearance-none w-4 h-4 border-2 border-[#E01020]/50 checked:bg-[#E01020] checked:border-[#E01020] transition-colors cursor-pointer"
                            />
                            <span className="text-white/70 font-mono text-sm group-hover:text-white transition-colors">{t(key)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Resume */}
                    <div>
                      <label htmlFor="resume" className="block text-white font-mono text-sm mb-2 uppercase">
                        {t('resumeLabel')}
                      </label>
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 bg-black border-2 border-[#E01020]/30 text-white font-mono focus:outline-none focus:border-[#E01020] transition-colors file:mr-4 file:py-1 file:px-4 file:border file:border-[#E01020]/30 file:text-white/70 file:bg-transparent file:font-mono file:text-sm file:cursor-pointer cursor-pointer"
                      />
                      <p className="text-white/40 font-mono text-xs mt-1">{t('resumeHint')}</p>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-white font-mono text-sm mb-2 uppercase">
                        {t('messageLabel')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 bg-black border-2 border-[#E01020]/30 text-white placeholder-white/40 font-mono focus:outline-none focus:border-[#E01020] transition-colors resize-none"
                        placeholder={t('messagePlaceholder')}
                      />
                    </div>

                    {/* Terms */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          required
                          className="appearance-none w-4 h-4 mt-0.5 border-2 border-[#E01020]/50 checked:bg-[#E01020] checked:border-[#E01020] transition-colors cursor-pointer flex-shrink-0"
                        />
                        <span className="text-white/70 font-mono text-xs leading-relaxed group-hover:text-white/90 transition-colors">
                          {t('termsAcknowledgement')}
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !agreedToTerms}
                      className="w-full bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-8 py-4 font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 neon-border-soft cyber-button disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#E01020]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {tc('submitting')}
                        </span>
                      ) : (
                        tc('submit')
                      )}
                    </button>

                    {submitStatus === 'error' && (
                      <p className="text-red-500 font-mono text-sm text-center">
                        {errorMessage || t('submitError')}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right — Hero Image + Text */}
          <div className="relative hidden lg:flex items-center justify-center border-l-2 border-[#E01020]/20">
            <img
              src="/images/gallery/join-us.png"
              alt="Join the Next Level Audio team"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative z-10 text-center px-12 max-w-lg">
              <p className="text-[#E01020] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {t('title')}
              </p>
              <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {t('heading')}
              </h1>
              <p className="text-white/80 text-lg font-mono">
                {t('description')}
              </p>
            </div>
          </div>

          {/* Mobile hero — shows above form on small screens */}
          <div className="lg:hidden relative h-64 order-first">
            <img
              src="/images/gallery/join-us.png"
              alt="Join the Next Level Audio team"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
              <p className="text-[#E01020] text-xs uppercase tracking-widest mb-2 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {t('title')}
              </p>
              <h1 className="text-3xl font-bold text-white neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {t('heading')}
              </h1>
            </div>
          </div>

        </div>
      </section>

      {/* Why Next Level Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              {t('whyNextLevel')}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono mb-12">
              {t('whyDescription')}
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <AnimateOnScroll animation="fade-up" delay={0.1}>
              <div className="bg-black border-2 border-[#E01020]/30 p-8 neon-border-soft">
                <svg className="w-12 h-12 text-[#E01020] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-[#E01020] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  {t('competitivePay')}
                </h3>
                <p className="text-white/60 font-mono text-sm">
                  {t('competitivePayDesc')}
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={0.2}>
              <div className="bg-black border-2 border-[#E01020]/30 p-8 neon-border-soft">
                <svg className="w-12 h-12 text-[#E01020] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-bold text-[#E01020] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  {t('handsOnTraining')}
                </h3>
                <p className="text-white/60 font-mono text-sm">
                  {t('handsOnTrainingDesc')}
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={0.3}>
              <div className="bg-black border-2 border-[#E01020]/30 p-8 neon-border-soft">
                <svg className="w-12 h-12 text-[#E01020] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xl font-bold text-[#E01020] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  {t('greatTeam')}
                </h3>
                <p className="text-white/60 font-mono text-sm">
                  {t('greatTeamDesc')}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Find Us — Google Map */}
      <section className="bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {tc('findUs')}
              </h2>
              <p className="text-white/80 font-mono text-sm md:text-base max-w-xl mx-auto">
                {t('findUsDesc')}
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <div className="border-2 border-[#E01020]/30 neon-border-soft overflow-hidden">
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
