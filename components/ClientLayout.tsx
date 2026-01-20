'use client';

import { ReactNode } from 'react';
import { BookingModalProvider } from './BookingModalContext';
import BookingWizardModal from './BookingWizardModal';
import { useBookingModal } from './BookingModalContext';

function ModalRenderer() {
  const { isOpen, closeModal } = useBookingModal();
  return <BookingWizardModal isOpen={isOpen} onClose={closeModal} />;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <BookingModalProvider>
      {children}
      <ModalRenderer />
    </BookingModalProvider>
  );
}