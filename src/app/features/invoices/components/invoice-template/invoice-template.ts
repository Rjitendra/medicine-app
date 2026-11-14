import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { Invoice } from '../../../../models/invoice.model';

import { InvoiceItem } from '../../../../models/invoice-items.model';
import { getSlabTaxableFromSummary, getSlabTaxAmount } from '../../services/invoice-calculation';

@Component({
  selector: 'app-invoice-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-template.html',
  styleUrl: './invoice-template.scss',
})
export class InvoiceTemplateComponent {
  invoice = input<Invoice | null>(null);

  formatExpiry(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
  }

  getItemAmount(item: InvoiceItem): number {
    return item.mrp * item.quantity;
  }

  getSlabTaxable(inv: Invoice, rate: number): number {
    return getSlabTaxableFromSummary(inv.gstSummary, rate);
  }

  getSlabTax(items: InvoiceItem[] | undefined, rate: number): number {
    return getSlabTaxAmount(items, rate);
  }

  formatDoctorName(name: string | undefined): string {
    const value = (name || 'DR:XXX').trim();
    if (/^DR[.:]/i.test(value)) {
      return value.replace(/^DR[.:]/i, 'DR:');
    }
    return `DR:${value}`;
  }

  getCoinValue(inv: Invoice): string {
    const afterDiscount = Math.round(((inv.subTotal || 0) - (inv.totalDiscount || 0)) * 100) / 100;
    const coin = (inv.grandTotal || 0) - afterDiscount;
    return coin > 0 ? coin.toFixed(2) : '0.00';
  }
}
