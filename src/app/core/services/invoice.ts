import { inject, Service, signal } from '@angular/core';
import { Invoice as InvoiceModel } from '../../models/invoice.model';
import { LocalStorage } from './local-storage';

@Service()
export class Invoice {
  private localStorage = inject(LocalStorage);
  private invoices = signal<InvoiceModel[]>([]);
  private currentInvoice = signal<InvoiceModel | null>(null);

  invoices$ = this.invoices.asReadonly();
  currentInvoice$ = this.currentInvoice.asReadonly();

  constructor() {
    this.loadInvoices();
  }

  private loadInvoices(): void {
    const stored = this.localStorage.getItem('invoices');
    if (stored) {
      try {
        this.invoices.set(JSON.parse(stored));
      } catch {
        this.invoices.set([]);
      }
    }
  }

  private saveInvoices(): void {
    this.localStorage.setItem('invoices', JSON.stringify(this.invoices()));
  }

  createInvoice(invoice: InvoiceModel): void {
    const newInvoices = [...this.invoices(), invoice];
    this.invoices.set(newInvoices);
    this.saveInvoices();
  }

  updateInvoice(id: string, invoice: InvoiceModel): void {
    const updated = this.invoices().map((inv) => (inv.invoiceNo.toString() === id ? invoice : inv));
    this.invoices.set(updated);
    this.saveInvoices();
  }

  deleteInvoice(id: string): void {
    const updated = this.invoices().filter((inv) => inv.invoiceNo.toString() !== id);
    this.invoices.set(updated);
    this.saveInvoices();
  }

  getInvoice(id: string): InvoiceModel | undefined {
    return this.invoices().find((inv) => inv.invoiceNo.toString() === id);
  }

  setCurrentInvoice(invoice: InvoiceModel | null): void {
    this.currentInvoice.set(invoice);
  }

  getNextInvoiceNumber(): number {
    const invoices = this.invoices();
    if (invoices.length === 0) return 1;
    return Math.max(...invoices.map((inv) => inv.invoiceNo)) + 1;
  }
}
