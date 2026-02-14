'use client';

import { useState, useEffect, useRef } from 'react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import type { JobListing } from '@/types/career';

const jobTypeLabels: Record<string, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  'contract': 'Contract',
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    cover_letter: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/careers/jobs')
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = (job: JobListing) => {
    setSelectedJob(job);
    setSubmitStatus('idle');
    setErrorMessage('');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setErrorMessage('File too large. Maximum size: 5MB');
      e.target.value = '';
      return;
    }
    setResumeFile(file);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const body = new FormData();
      body.append('job_listing_id', selectedJob.id);
      body.append('applicant_name', formData.applicant_name);
      body.append('applicant_email', formData.applicant_email);
      body.append('applicant_phone', formData.applicant_phone);
      body.append('cover_letter', formData.cover_letter);
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
      setFormData({ applicant_name: '', applicant_email: '', applicant_phone: '', cover_letter: '' });
      setResumeFile(null);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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
              CAREERS
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              JOIN OUR TEAM
            </h1>
            <p className="text-[#00A0E0]/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              Be part of Stroudsburg&apos;s premier car audio and automotive customization team.
            </p>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              OPEN POSITIONS
            </h2>
            <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
              Explore our current openings and find the right fit for your skills.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#00A0E0]/30 border-t-[#00A0E0] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#00A0E0]/60 font-mono text-sm">Loading positions...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-[#00A0E0]/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-[#00A0E0]/60 font-mono text-lg mb-2">No open positions at this time.</p>
              <p className="text-[#00A0E0]/40 font-mono text-sm">Check back soon — we&apos;re always growing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {jobs.map((job, index) => (
                <AnimateOnScroll key={job.id} animation="fade-up" delay={index * 0.1}>
                  <div className="bg-black border-2 border-[#00A0E0]/30 p-8 neon-border-soft group hover:border-[#00A0E0] transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#00A0E0] mb-3 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                        {job.title}
                      </h3>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs font-mono px-3 py-1 border border-[#00A0E0]/30 text-[#00A0E0]/80">
                          {job.department}
                        </span>
                        <span className="text-xs font-mono px-3 py-1 border border-[#00A0E0]/30 text-[#00A0E0]/80">
                          {jobTypeLabels[job.type] || job.type}
                        </span>
                        <span className="text-xs font-mono px-3 py-1 border border-[#00A0E0]/30 text-[#00A0E0]/80">
                          {job.location}
                        </span>
                      </div>

                      {job.salary_range && (
                        <p className="text-[#00A0E0] font-mono text-sm mb-4">
                          {job.salary_range}
                        </p>
                      )}

                      <p className="text-[#00A0E0]/60 font-mono text-sm mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      {job.requirements && (
                        <div className="mb-6">
                          <p className="text-[#00A0E0]/80 font-mono text-xs uppercase mb-2">Requirements</p>
                          <p className="text-[#00A0E0]/50 font-mono text-sm line-clamp-3">
                            {job.requirements}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleApply(job)}
                      className="w-full bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-6 py-3 font-semibold text-sm hover:bg-[#00A0E0]/30 transition-all duration-300 neon-border-soft cyber-button cursor-pointer"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      APPLY NOW
                    </button>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Form */}
      {selectedJob && (
        <section ref={formRef} className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
          <div className="absolute inset-0 cyber-grid opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto">
              <div className="bg-black border-2 border-[#00A0E0]/30 p-8 md:p-12 neon-border-soft">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#00A0E0] neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                      APPLY
                    </h2>
                    <p className="text-[#00A0E0]/60 font-mono text-sm mt-1">
                      {selectedJob.title} — {selectedJob.department}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedJob(null); setSubmitStatus('idle'); }}
                    className="text-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors cursor-pointer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {submitStatus === 'success' ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#00A0E0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-[#00A0E0] mb-4 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                      APPLICATION SUBMITTED!
                    </h3>
                    <p className="text-[#00A0E0]/70 font-mono mb-6">
                      Thank you for your interest! We&apos;ll review your application and get back to you.
                    </p>
                    <button
                      onClick={() => { setSelectedJob(null); setSubmitStatus('idle'); }}
                      className="text-[#00A0E0] hover:text-[#00B8FF] font-mono underline cursor-pointer"
                    >
                      Back to positions
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="applicant_name" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="applicant_name"
                        name="applicant_name"
                        value={formData.applicant_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono focus:outline-none focus:border-[#00A0E0] transition-colors"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="applicant_email" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="applicant_email"
                          name="applicant_email"
                          value={formData.applicant_email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono focus:outline-none focus:border-[#00A0E0] transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="applicant_phone" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          id="applicant_phone"
                          name="applicant_phone"
                          value={formData.applicant_phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono focus:outline-none focus:border-[#00A0E0] transition-colors"
                          placeholder="(555) 555-5555"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="resume" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                        Resume
                      </label>
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] font-mono focus:outline-none focus:border-[#00A0E0] transition-colors file:mr-4 file:py-1 file:px-4 file:border file:border-[#00A0E0]/30 file:text-[#00A0E0] file:bg-transparent file:font-mono file:text-sm file:cursor-pointer cursor-pointer"
                      />
                      <p className="text-[#00A0E0]/40 font-mono text-xs mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                    </div>

                    <div>
                      <label htmlFor="cover_letter" className="block text-[#00A0E0] font-mono text-sm mb-2 uppercase">
                        Cover Letter
                      </label>
                      <textarea
                        id="cover_letter"
                        name="cover_letter"
                        value={formData.cover_letter}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono focus:outline-none focus:border-[#00A0E0] transition-colors resize-none"
                        placeholder="Tell us why you'd be a great fit..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-8 py-4 font-semibold text-lg hover:bg-[#00A0E0]/30 transition-all duration-300 neon-border-soft cyber-button disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00A0E0]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          SUBMITTING...
                        </span>
                      ) : (
                        'SUBMIT APPLICATION'
                      )}
                    </button>

                    {submitStatus === 'error' && (
                      <p className="text-red-500 font-mono text-sm text-center">
                        {errorMessage || 'Something went wrong. Please try again or call us directly.'}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              WHY NEXT LEVEL?
            </h2>
            <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono mb-12">
              We offer competitive pay, hands-on training, and the chance to work with cutting-edge automotive technology. Join a team that values quality craftsmanship and customer satisfaction.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <AnimateOnScroll animation="fade-up" delay={0.1}>
              <div className="bg-black border-2 border-[#00A0E0]/30 p-8 neon-border-soft">
                <svg className="w-12 h-12 text-[#00A0E0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-[#00A0E0] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  COMPETITIVE PAY
                </h3>
                <p className="text-[#00A0E0]/60 font-mono text-sm">
                  Fair compensation that reflects your skills and experience.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={0.2}>
              <div className="bg-black border-2 border-[#00A0E0]/30 p-8 neon-border-soft">
                <svg className="w-12 h-12 text-[#00A0E0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-bold text-[#00A0E0] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  HANDS-ON TRAINING
                </h3>
                <p className="text-[#00A0E0]/60 font-mono text-sm">
                  Learn the latest in car audio and automotive tech from industry experts.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={0.3}>
              <div className="bg-black border-2 border-[#00A0E0]/30 p-8 neon-border-soft">
                <svg className="w-12 h-12 text-[#00A0E0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xl font-bold text-[#00A0E0] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  GREAT TEAM
                </h3>
                <p className="text-[#00A0E0]/60 font-mono text-sm">
                  Work alongside passionate professionals who love what they do.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
