'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from './AuthContext';
import { BookingModalProvider } from './BookingModalContext';
import { useBookingModal } from './BookingModalContext';
import { CartProvider } from './CartContext';
import { ChatProvider } from './ChatContext';

const BookingWizardModal = dynamic(() => import('./BookingWizardModal'), { ssr: false });
const CheckoutModal = dynamic(() => import('./CheckoutModal'), { ssr: false });
const ChatWidget = dynamic(() => import('./ChatWidget'), { ssr: false });

function ModalRenderer() {
  const { isOpen, closeModal } = useBookingModal();
  return <BookingWizardModal isOpen={isOpen} onClose={closeModal} />;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}