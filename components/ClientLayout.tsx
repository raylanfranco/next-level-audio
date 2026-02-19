'use client';

import { ReactNode } from 'react';
import { BookingModalProvider } from './BookingModalContext';
import BookingWizardModal from './BookingWizardModal';
import { useBookingModal } from './BookingModalContext';
import { CartProvider } from './CartContext';
import { ChatProvider } from './ChatContext';
import CheckoutModal from './CheckoutModal';
import ChatWidget from './ChatWidget';

function ModalRenderer() {
  const { isOpen, closeModal } = useBookingModal();
  return <BookingWizardModal isOpen={isOpen} onClose={closeModal} />;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <BookingModalProvider>
        <ChatProvider>
          {children}
          <ModalRenderer />
          <CheckoutModal />
          <ChatWidget />
        </ChatProvider>
      </BookingModalProvider>
    </CartProvider>
  );
}