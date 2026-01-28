// --- Items / Inventory ---

export interface CloverItem {
  id: string;
  name: string;
  price: number; // in cents
  priceType?: string;
  defaultTaxRates?: boolean;
  cost?: number;
  isRevenue?: boolean;
  stockCount?: number;
  sku?: string;
  code?: string;
  hidden?: boolean;
  available?: boolean;
  autoManage?: boolean;
  description?: string;
  onlineName?: string;
  enabledOnline?: boolean;
  categories?: { elements: CloverCategory[] };
  tags?: { elements: CloverTag[] };
  taxRates?: { elements: CloverTaxRate[] };
  modifiedTime?: number;
  deleted?: boolean;
}

export interface CloverCategory {
  id: string;
  name: string;
  sortOrder?: number;
  deleted?: boolean;
}

export interface CloverTag {
  id: string;
  name: string;
}

export interface CloverTaxRate {
  id: string;
  name: string;
  rate: number;
  isDefault?: boolean;
}

export interface CloverItemsResponse {
  elements: CloverItem[];
  href?: string;
}

export interface CloverCategoriesResponse {
  elements: CloverCategory[];
  href?: string;
}

// --- Orders ---

export interface CloverLineItem {
  id: string;
  name: string;
  price: number;
  note?: string;
  printed?: boolean;
  exchanged?: boolean;
  refunded?: boolean;
  isRevenue?: boolean;
  alternateName?: string;
  itemCode?: string;
  item?: { id: string };
  orderRef?: { id: string };
  createdTime?: number;
}

export interface CloverOrder {
  id: string;
  href?: string;
  currency?: string;
  total: number;
  note?: string;
  state?: string;
  paymentState?: string;
  taxRemoved?: boolean;
  manualTransaction?: boolean;
  testMode?: boolean;
  payType?: string;
  createdTime?: number;
  clientCreatedTime?: number;
  modifiedTime?: number;
  lineItems?: { elements: CloverLineItem[] };
  customers?: { elements: { id: string; href?: string }[] };
  employee?: { id: string };
  device?: { id: string };
}

export interface CloverOrdersResponse {
  elements: CloverOrder[];
  href?: string;
}

// --- Customers ---

export interface CloverCustomer {
  id: string;
  href?: string;
  firstName?: string;
  lastName?: string;
  marketingAllowed?: boolean;
  customerSince?: number;
  metadata?: Record<string, unknown>;
}

export interface CloverCustomersResponse {
  elements: CloverCustomer[];
  href?: string;
}

// --- Payments ---

export interface CloverTender {
  id: string;
  href?: string;
  label: string;
  labelKey?: string;
  editable?: boolean;
  opensCashDrawer?: boolean;
  enabled?: boolean;
  visible?: boolean;
}

export interface CloverPayment {
  id: string;
  amount: number;
  tipAmount?: number;
  taxAmount?: number;
  cashbackAmount?: number;
  cashTendered?: number;
  result?: string;
  offline?: boolean;
  createdTime?: number;
  clientCreatedTime?: number;
  modifiedTime?: number;
  tender?: CloverTender;
  order?: CloverOrder;
  employee?: { id: string };
  device?: { id: string };
}

export interface CloverPaymentsResponse {
  elements: CloverPayment[];
  href?: string;
}
