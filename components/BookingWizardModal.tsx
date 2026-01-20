'use client';

import { useState } from 'react';
import { BookingFormData } from '@/types/booking';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const services = [
  { id: 'window-tinting', title: 'Window Tinting' },
  { id: 'car-audio', title: 'Car Audio' },
  { id: 'remote-start', title: 'Remote Start' },
  { id: 'security-systems', title: 'Security Systems' },
  { id: 'lighting', title: 'Custom Lighting' },
  { id: 'accessories', title: 'Auto Accessories' },
];

export default function BookingWizardModal({ isOpen, onClose }: BookingWizardModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Booking submitted successfully!');
        onClose();
        setCurrentStep(1);
        setFormData({});
      } else {
        alert('Failed to submit booking. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border-2 border-[#00A0E0]/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto neon-border-soft">
        {/* Header */}
        <div className="p-6 border-b-2 border-[#00A0E0]/30">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#00A0E0] neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              BOOK APPOINTMENT
            </h2>
            <button
              onClick={onClose}
              className="text-[#00A0E0] hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-[#00A0E0]/60 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-[#00A0E0]/20 h-2 rounded">
              <div
                className="bg-[#00A0E0] h-2 rounded transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-bold text-[#00A0E0] mb-4" style={{ fontFamily: 'var(--font-oxanium)' }}>
                SELECT SERVICE
              </h3>
              <div className="space-y-3">
                {services.map((service) => (
                  <label key={service.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="service_type"
                      value={service.id}
                      checked={formData.service_type === service.id}
                      onChange={(e) => updateFormData('service_type', e.target.value)}
                      className="text-[#00A0E0] focus:ring-[#00A0E0]"
                    />
                    <span className="text-[#00A0E0]/80 font-mono">{service.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-bold text-[#00A0E0] mb-4" style={{ fontFamily: 'var(--font-oxanium)' }}>
                VEHICLE DETAILS
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Make *</label>
                  <input
                    type="text"
                    value={formData.vehicle_make || ''}
                    onChange={(e) => updateFormData('vehicle_make', e.target.value)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono"
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Model *</label>
                  <input
                    type="text"
                    value={formData.vehicle_model || ''}
                    onChange={(e) => updateFormData('vehicle_model', e.target.value)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono"
                    placeholder="e.g., Camry"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Year *</label>
                  <input
                    type="number"
                    value={formData.vehicle_year || ''}
                    onChange={(e) => updateFormData('vehicle_year', parseInt(e.target.value) || undefined)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono"
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-bold text-[#00A0E0] mb-4" style={{ fontFamily: 'var(--font-oxanium)' }}>
                SELECT DATE & TIME
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Preferred Date</label>
                  <select
                    value={formData.appointment_date || ''}
                    onChange={(e) => updateFormData('appointment_date', e.target.value)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono"
                  >
                    <option value="">Select a date</option>
                    <option value="2026-01-25">January 25, 2026</option>
                    <option value="2026-01-26">January 26, 2026</option>
                    <option value="2026-01-27">January 27, 2026</option>
                    <option value="2026-01-28">January 28, 2026</option>
                    <option value="2026-01-29">January 29, 2026</option>
                    <option value="2026-01-30">January 30, 2026</option>
                    <option value="2026-01-31">January 31, 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Preferred Time</label>
                  <select
                    value={formData.appointment_time || ''}
                    onChange={(e) => updateFormData('appointment_time', e.target.value)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono"
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="text-xl font-bold text-[#00A0E0] mb-4" style={{ fontFamily: 'var(--font-oxanium)' }}>
                CONTACT INFORMATION
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.customer_name || ''}
                    onChange={(e) => updateFormData('customer_name', e.target.value)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.customer_email || ''}
                    onChange={(e) => updateFormData('customer_email', e.target.value)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.customer_phone || ''}
                    onChange={(e) => updateFormData('customer_phone', e.target.value)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#00A0E0]/80 font-mono mb-2">Additional Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 focus:border-[#00A0E0] transition-colors font-mono h-24 resize-none"
                    placeholder="Any special requests or additional information..."
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h3 className="text-xl font-bold text-[#00A0E0] mb-4" style={{ fontFamily: 'var(--font-oxanium)' }}>
                CONFIRM BOOKING
              </h3>
              <div className="space-y-3 text-[#00A0E0]/80 font-mono">
                <div><strong>Service:</strong> {services.find(s => s.id === formData.service_type)?.title}</div>
                {formData.vehicle_make && <div><strong>Vehicle:</strong> {formData.vehicle_year} {formData.vehicle_make} {formData.vehicle_model}</div>}
                <div><strong>Date:</strong> {formData.appointment_date}</div>
                <div><strong>Time:</strong> {formData.appointment_time}</div>
                <div><strong>Name:</strong> {formData.customer_name}</div>
                <div><strong>Email:</strong> {formData.customer_email}</div>
                <div><strong>Phone:</strong> {formData.customer_phone}</div>
                {formData.notes && <div><strong>Notes:</strong> {formData.notes}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-[#00A0E0]/30 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-6 py-2 border-2 border-[#00A0E0]/50 text-[#00A0E0] hover:border-[#00A0E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            PREVIOUS
          </button>
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !formData.service_type) ||
                (currentStep === 2 && (!formData.vehicle_make || !formData.vehicle_model || !formData.vehicle_year)) ||
                (currentStep === 3 && (!formData.appointment_date || !formData.appointment_time)) ||
                (currentStep === 4 && (!formData.customer_name || !formData.customer_email || !formData.customer_phone))
              }
              className="px-6 py-2 bg-[#00A0E0]/20 border-2 border-[#00A0E0] text-[#00A0E0] hover:bg-[#00A0E0]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              NEXT
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#00A0E0]/20 border-2 border-[#00A0E0] text-[#00A0E0] hover:bg-[#00A0E0]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {isSubmitting ? 'SUBMITTING...' : 'CONFIRM BOOKING'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}