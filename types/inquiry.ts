export type InquiryStatus = 'pending' | 'contacted' | 'fulfilled' | 'closed';
export type InquiryRequestType = 'inquiry' | 'backorder';

export interface Inquiry {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number; // in cents
  request_type: InquiryRequestType;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  message: string;
  status: InquiryStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InquiryFormData {
  product_id: string;
  product_name: string;
  product_price: number;
  request_type: InquiryRequestType;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  message: string;
}
