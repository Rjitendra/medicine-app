import { Component, inject, output, signal } from '@angular/core';
import { form, FormField, FormRoot, min, required } from '@angular/forms/signals';
import { Invoice as InvoiceService } from '../../../../core/services/invoice';
import { InvoiceDetailsFormModel } from '../../models/invoice-form.models';
import { DEFAULT_INVOICE_CUSTOMER } from '../../data/default-invoice-customer';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [FormField, FormRoot],
  templateUrl: './invoice-form.html',
  styleUrl: './invoice-form.scss'
})
export class InvoiceFormComponent {
  private readonly invoiceService = inject(InvoiceService);

  readonly submit = output<InvoiceDetailsFormModel>();
  readonly cancel = output<void>();

  private readonly invoiceModel = signal<InvoiceDetailsFormModel>({
    invoiceNo: this.invoiceService.getNextInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceType: 'MEDICINE',
    patientName: DEFAULT_INVOICE_CUSTOMER.patientName,
    doctorName: DEFAULT_INVOICE_CUSTOMER.doctorName,
    address: DEFAULT_INVOICE_CUSTOMER.address,
    phoneNumber: DEFAULT_INVOICE_CUSTOMER.phoneNumber,
  });

  readonly invoiceForm = form(this.invoiceModel, (f) => {
    min(f.invoiceNo, 1);
    required(f.invoiceType);
    required(f.patientName);
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.invoiceForm().valid()) {
      this.submit.emit(this.invoiceModel());
    }
  }
}