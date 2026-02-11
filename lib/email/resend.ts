import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = 'nextlevelaudio@ymail.com';
const FROM_EMAIL = 'Next Level Audio <onboarding@resend.dev>';

export interface InquiryEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productPrice: string;
  requestType: 'inquiry' | 'backorder';
  message: string;
}

export async function sendInquiryNotification(data: InquiryEmailData) {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  const typeLabel = data.requestType === 'inquiry' ? 'Product Inquiry' : 'Backorder Request';

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [ADMIN_EMAIL],
    replyTo: data.customerEmail,
    subject: `[${typeLabel}] ${data.productName} - ${data.customerName}`,
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A0E0;">New ${typeLabel}</h2>
        <hr style="border-color: #00A0E0;" />
        <h3>Product</h3>
        <p><strong>${data.productName}</strong> - ${data.productPrice}</p>
        <h3>Customer</h3>
        <p>Name: ${data.customerName}</p>
        <p>Email: <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
        <p>Phone: <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>
        <h3>Message</h3>
        <p>${data.message || 'No message provided'}</p>
        <hr style="border-color: #00A0E0;" />
        <p style="color: #888;">Sent from Next Level Audio website</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send inquiry email:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export async function sendContactNotification(data: ContactEmailData) {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [ADMIN_EMAIL],
    replyTo: data.email,
    subject: `[Contact Form] ${data.name} - ${data.service || 'General'}`,
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A0E0;">New Contact Form Submission</h2>
        <hr style="border-color: #00A0E0;" />
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Service:</strong> ${data.service || 'Not specified'}</p>
        <h3>Message</h3>
        <p>${data.message}</p>
        <hr style="border-color: #00A0E0;" />
        <p style="color: #888;">Sent from Next Level Audio website</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send contact email:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
