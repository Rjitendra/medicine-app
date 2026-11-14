import { Service } from '@angular/core';
import { GstSummary } from '../../../models/gst-summary';
import { InvoiceItem } from '../../../models/invoice-items.model';

export interface CalculatedInvoiceTotals {
  subTotal: number;
  totalDiscount: number;
  afterDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  coin: number;
  gstSummary: GstSummary;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** MRP is GST-inclusive; discount applied on gross; tax extracted from net line amount. */
export function calculateInvoiceTotals(items: InvoiceItem[]): CalculatedInvoiceTotals {
  let subTotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let cgst = 0;
  let sgst = 0;
  const slabTaxable = { gst5: 0, gst12: 0, gst18: 0, gst28: 0 };
  const slabTax = { gst5: 0, gst12: 0, gst18: 0, gst28: 0 };

  items.forEach((item) => {
    const gross = item.mrp * item.quantity;
    const discount = round2((gross * item.discountPercentage) / 100);
    const afterDisc = round2(gross - discount);
    const gstFactor = 1 + item.gstPercentage / 100;
    const lineTaxable = round2(afterDisc / gstFactor);
    const lineGst = round2(afterDisc - lineTaxable);

    subTotal += gross;
    totalDiscount += discount;
    taxableAmount += lineTaxable;
    cgst += lineGst / 2;
    sgst += lineGst / 2;

    const rate = item.gstPercentage;
    if (rate === 5) {
      slabTaxable.gst5 += lineTaxable;
      slabTax.gst5 += lineGst;
    } else if (rate === 12) {
      slabTaxable.gst12 += lineTaxable;
      slabTax.gst12 += lineGst;
    } else if (rate === 18) {
      slabTaxable.gst18 += lineTaxable;
      slabTax.gst18 += lineGst;
    } else if (rate === 28) {
      slabTaxable.gst28 += lineTaxable;
      slabTax.gst28 += lineGst;
    }
  });

  subTotal = round2(subTotal);
  totalDiscount = round2(totalDiscount);
  const afterDiscount = round2(subTotal - totalDiscount);
  taxableAmount = round2(taxableAmount);
  cgst = round2(cgst);
  sgst = round2(sgst);
  const grandTotal = Math.round(afterDiscount);
  const coin = round2(grandTotal - afterDiscount);

  return {
    subTotal,
    totalDiscount,
    afterDiscount,
    taxableAmount,
    cgst,
    sgst,
    igst: 0,
    grandTotal,
    coin,
    gstSummary: {
      gst5: round2(slabTaxable.gst5),
      gst12: round2(slabTaxable.gst12),
      gst18: round2(slabTaxable.gst18),
      gst28: round2(slabTaxable.gst28),
      cgst,
      sgst,
      igst: 0,
    },
  };
}

export function getSlabTaxableFromSummary(summary: GstSummary | undefined, rate: number): number {
  if (!summary) return 0;
  if (rate === 5) return summary.gst5;
  if (rate === 12) return summary.gst12;
  if (rate === 18) return summary.gst18;
  if (rate === 28) return summary.gst28;
  return 0;
}

export function getSlabTaxAmount(items: InvoiceItem[] | undefined, rate: number): number {
  if (!items) return 0;
  return round2(
    items
      .filter((i) => i.gstPercentage === rate)
      .reduce((sum, item) => {
        const gross = item.mrp * item.quantity;
        const discount = round2((gross * item.discountPercentage) / 100);
        const afterDisc = round2(gross - discount);
        const lineTaxable = round2(afterDisc / (1 + rate / 100));
        return sum + round2(afterDisc - lineTaxable);
      }, 0),
  );
}

@Service()
export class InvoiceCalculationService {
  calculateAmount(item: InvoiceItem): number {
    return item.mrp * item.quantity;
  }

  calculateTotals(items: InvoiceItem[]): CalculatedInvoiceTotals {
    return calculateInvoiceTotals(items);
  }

  calculateSubTotal(items: InvoiceItem[]): number {
    return calculateInvoiceTotals(items).subTotal;
  }

  calculateDiscount(items: InvoiceItem[]): number {
    return calculateInvoiceTotals(items).totalDiscount;
  }

  calculateTaxableAmount(items: InvoiceItem[]): number {
    return calculateInvoiceTotals(items).taxableAmount;
  }

  calculateCGST(items: InvoiceItem[]): number {
    return calculateInvoiceTotals(items).cgst;
  }

  calculateSGST(items: InvoiceItem[]): number {
    return calculateInvoiceTotals(items).sgst;
  }

  calculateGrandTotal(items: InvoiceItem[]): number {
    return calculateInvoiceTotals(items).grandTotal;
  }
}
