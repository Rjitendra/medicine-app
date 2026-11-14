import { Customer, StoreInfo } from './customer.models';
import { GstSummary } from './gst-summary';
import { InvoiceItem } from './invoice-items.model';

export interface Invoice {
  invoiceNo: number;
  invoiceDate: Date;
  invoiceTime: string;
  invoiceType: string;
  paymentMethod: string;
  store: StoreInfo;
  customer: Customer;
  items: InvoiceItem[];
  subTotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  grandTotal: number;
  totalQuantity: number;
  amountInWords: string;
  gstSummary: GstSummary;
  notes?: string;
}
