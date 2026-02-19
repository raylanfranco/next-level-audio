export type WidgetScreen =
  | 'welcome'
  | 'quote'
  | 'fitment'
  | 'contact'
  | 'chat'
  | 'submitted';

export type QuoteStep = 'select-service' | 'vehicle-info' | 'customer-info';

export type FitmentStep = 'vehicle-select' | 'results';

export interface QuoteFormData {
  service: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleNotes: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface FitmentFormData {
  year: string;
  make: string;
  model: string;
}

export interface FitmentResult {
  id: string;
  partNumber: string;
  partName: string;
  brand?: string;
  category: string;
  notes?: string;
}

export const INITIAL_QUOTE_FORM: QuoteFormData = {
  service: '',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleNotes: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
};

export const INITIAL_FITMENT_FORM: FitmentFormData = {
  year: '',
  make: '',
  model: '',
};
