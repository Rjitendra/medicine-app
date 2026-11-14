// import { CommonModule } from '@angular/common';
// import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
// import { form, FormField, FormRoot, max, min, required } from '@angular/forms/signals';
// import { Invoice as InvoiceService } from '../../../../core/services/invoice';
// import { Pdf } from '../../../../core/services/pdf';

import { CommonModule } from "@angular/common";
import { Component, inject, ChangeDetectorRef, signal } from "@angular/core";
import { FormField, FormRoot, form, max, min, required } from "@angular/forms/signals";
import { Invoice as InvoiceService } from "../../../../core/services/invoice";
import { Invoice } from "../../../../models/invoice.model";
import { Pdf } from "../../../../core/services/pdf";
import { InvoiceItem } from "../../../../models/invoice-items.model";
import { Customer, StoreInfo } from "../../../../models/customer.models";
import { InvoiceDetailsFormModel, StoreFormModel, DEFAULT_STORE_FORM, MedicineFormModel, DEFAULT_MEDICINE_FORM } from "../../models/invoice-form.models";
import { BillSummaryComponent } from "../../components/bill-summary/bill-summary";
import { InvoiceFormComponent } from "../../components/invoice-form/invoice-form";
import { InvoiceTemplateComponent } from "../../components/invoice-template/invoice-template";
import { MedicineTableComponent } from "../../components/medicine-table/medicine-table";
import { MEDICINE_PRESET_OPTIONS, MedicinePresetId, getMedicineItemsByPreset } from "../../data/default-medicine-items";
import { calculateInvoiceTotals } from "../../services/invoice-calculation";

// import { InvoiceItem } from '../../../../models/invoice-item.model';
// import { Invoice } from '../../../../models/invoice.model';
// import { BillSummaryComponent } from '../../../../components/bill-summary/bill-summary';
// import { InvoiceFormComponent } from '../../../../components/invoice-form/invoice-form';
// import { InvoiceTemplateComponent } from '../../../../components/invoice-template/invoice-template';
// import { MedicineTableComponent } from '../../../../components/medicine-table/medicine-table';
// import {
//   getMedicineItemsByPreset,
//   MEDICINE_PRESET_OPTIONS,
//   MedicinePresetId,
// } from '../../../../data/default-medicine-items';
// import { DEFAULT_INVOICE_CUSTOMER } from '../../../../data/default-invoice-customer';
// import {
//   DEFAULT_MEDICINE_FORM,
//   DEFAULT_STORE_FORM,
//   InvoiceDetailsFormModel,
//   MedicineFormModel,
//   StoreFormModel,
// } from '../../../../models/invoice-form.models';
// import { calculateInvoiceTotals } from '../../../../services/invoice-calculation';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormField,
    FormRoot,
    InvoiceFormComponent,
    MedicineTableComponent,
    BillSummaryComponent,
    InvoiceTemplateComponent,
  ],
  templateUrl: './create-invoice.html',
  styleUrl: './create-invoice.scss',
})
export class CreateInvoice {
  private readonly invoiceService = inject(InvoiceService);
  private readonly pdfService = inject(Pdf);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly currentInvoice = signal<Invoice | null>(null);
  readonly medicineItems = signal<InvoiceItem[]>([]);
  readonly activeTab = signal<'items' | 'preview'>('items');
  readonly editingIndex = signal<number | null>(null);
  readonly storeInfoFormSubmitted = signal<boolean>(false);
  readonly storeFormAttempted = signal<boolean>(false);
  readonly medicinePresets = MEDICINE_PRESET_OPTIONS;
  readonly selectedPreset = signal<MedicinePresetId>('reference-bill');

  private readonly storeModel = signal<StoreFormModel>({ ...DEFAULT_STORE_FORM });
  readonly storeForm = form(this.storeModel, (f) => {
    required(f.storeName);
    required(f.storeAddress);
    required(f.storePhone);
    required(f.licenseNo);
    required(f.gstin);
  });

  private readonly medicineModel = signal<MedicineFormModel>(DEFAULT_MEDICINE_FORM);
  readonly medicineForm = form(this.medicineModel, (f) => {
    required(f.itemName);
    required(f.mrp);
    min(f.mrp, 0);
    required(f.quantity);
    min(f.quantity, 1);
    min(f.discountPercentage, 0);
    max(f.discountPercentage, 100);
    min(f.gstPercentage, 0);
    max(f.gstPercentage, 100);
  });

  storeInfo: StoreInfo | null = null;

  submitStoreForm(event: Event): void {
    event.preventDefault();
    this.storeFormAttempted.set(true);
    if (!this.storeForm().valid()) return;

    this.storeInfo = { ...this.storeModel() };
    this.storeInfoFormSubmitted.set(true);
  }

  handleInvoiceFormSubmit(data: InvoiceDetailsFormModel): void {
    if (!this.storeInfo) return;
    const customer: Customer = {
      patientName: data.patientName,
      doctorName: data.doctorName,
      address: data.address,
      phoneNumber: data.phoneNumber,
    };
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const invoiceNo = data.invoiceNo ?? this.invoiceService.getNextInvoiceNumber();
    const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date();

    const invoice: Invoice = {
      invoiceNo,
      invoiceDate,
      invoiceTime: time,
      invoiceType: data.invoiceType,
      paymentMethod: 'CASH',
      store: this.storeInfo,
      customer,
      items: [],
      subTotal: 0,
      totalDiscount: 0,
      taxableAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      grandTotal: 0,
      totalQuantity: 0,
      amountInWords: '',
      gstSummary: { gst5: 0, gst12: 0, gst18: 0, gst28: 0, cgst: 0, sgst: 0, igst: 0 },
    };

    this.currentInvoice.set(invoice);
    this.medicineItems.set(getMedicineItemsByPreset(this.selectedPreset()));
    this.updateInvoiceItems();
    this.activeTab.set('items');
  }

  onPresetChange(event: Event): void {
    const presetId = (event.target as HTMLSelectElement).value as MedicinePresetId;
    this.applyMedicinePreset(presetId);
  }

  applyMedicinePreset(presetId: MedicinePresetId): void {
    this.selectedPreset.set(presetId);
    this.medicineItems.set(getMedicineItemsByPreset(presetId));
    this.editingIndex.set(null);
    this.resetMedicineModel();
    this.updateInvoiceItems();
  }

  addItem(): void {
    this.editingIndex.set(null);
    this.resetMedicineModel();
  }

  saveMedicineItem(): void {
    if (!this.medicineForm().valid()) return;

    const formValue = this.medicineModel();
    const mrp = formValue.mrp ?? 0;
    const quantity = formValue.quantity ?? 0;
    const discountPercentage = formValue.discountPercentage || 0;

    const item: InvoiceItem = {
      itemName: formValue.itemName,
      pack: formValue.pack,
      hsn: formValue.hsn,
      drugCode: formValue.drugCode,
      batch: formValue.batch,
      expiryDate: formValue.expiryDate,
      mrp,
      quantity,
      discountPercentage,
      gstPercentage: formValue.gstPercentage,
      amount: mrp * quantity,
    };

    const items = [...this.medicineItems()];
    const editIdx = this.editingIndex();
    if (editIdx !== null) {
      items[editIdx] = item;
      this.editingIndex.set(null);
    } else {
      items.push(item);
    }

    this.medicineItems.set(items);
    this.updateInvoiceItems();
    this.resetMedicineModel();
  }

  clearItem(index: number): void {
    const items = this.medicineItems().filter((_, i) => i !== index);
    this.medicineItems.set(items);
    this.updateInvoiceItems();
  }

  resetAllItems(): void {
    this.medicineItems.set([]);
    this.editingIndex.set(null);
    this.resetMedicineModel();
    this.updateInvoiceItems();
  }

  cancelEdit(): void {
    this.editingIndex.set(null);
    this.resetMedicineModel();
  }

  private resetMedicineModel(): void {
    this.medicineModel.set({ ...DEFAULT_MEDICINE_FORM });
  }

  private updateInvoiceItems(): void {
    const invoice = this.currentInvoice();
    if (!invoice) return;

    const items = this.medicineItems();
    const totals = calculateInvoiceTotals(items);

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const updatedInvoice: Invoice = {
      ...invoice,
      items,
      subTotal: totals.subTotal,
      totalDiscount: totals.totalDiscount,
      taxableAmount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      cess: 0,
      grandTotal: totals.grandTotal,
      totalQuantity,
      amountInWords: this.numberToWords(totals.grandTotal),
      gstSummary: totals.gstSummary,
    };

    this.currentInvoice.set(updatedInvoice);
  }

  private numberToWords(num: number): string {
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const teens = [
      'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN',
      'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN',
    ];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    if (num === 0) return 'RUPEES ZERO ONLY';

    const convertBelow1000 = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + convertBelow1000(n % 100) : '');
    };

    let words = '';
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    if (crore) words += convertBelow1000(crore) + ' CRORE ';
    if (lakh) words += convertBelow1000(lakh) + ' LAKH ';
    if (thousand) words += convertBelow1000(thousand) + ' THOUSAND ';
    if (remainder) words += convertBelow1000(remainder);

    return `RUPEES ${words.trim()} ONLY`;
  }

  setActiveTab(tab: 'items' | 'preview'): void {
    if (tab === 'preview') {
      this.syncInvoiceForPreview();
    }
    this.activeTab.set(tab);
    this.cdr.detectChanges();
  }

  private syncInvoiceForPreview(): void {
    this.updateInvoiceItems();
    const invoice = this.currentInvoice();
    if (!invoice) return;
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    this.currentInvoice.set({ ...invoice, invoiceTime: time });
  }

  private async exportPdf(action: 'print' | 'download' | 'whatsapp'): Promise<void> {
    const invoice = this.currentInvoice();
    if (!invoice) return;
    this.syncInvoiceForPreview();
    this.cdr.detectChanges();

    try {
      if (action === 'print') {
        await this.pdfService.printPdf('invoice-print');
      } else if (action === 'download') {
        await this.pdfService.downloadPdf('invoice-print', `Invoice-${invoice.invoiceNo}`);
      } else {
        await this.pdfService.shareViaWhatsApp('invoice-print', invoice.invoiceNo);
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert(
        action === 'print'
          ? 'Error printing invoice'
          : action === 'download'
          ? 'Error downloading PDF'
          : 'Error sharing via WhatsApp'
      );
    }
  }

  printInvoice(): void {
    this.exportPdf('print');
  }

  downloadPdf(): void {
    this.exportPdf('download');
  }

  shareWhatsapp(): void {
    this.exportPdf('whatsapp');
  }

  saveInvoice(): void {
    const invoice = this.currentInvoice();
    if (!invoice) return;
    this.invoiceService.createInvoice(invoice);
    alert('Invoice saved successfully!');
    this.cancel();
  }

  cancel(): void {
    this.currentInvoice.set(null);
    this.medicineItems.set([]);
    this.activeTab.set('items');
    this.editingIndex.set(null);
    this.storeInfoFormSubmitted.set(false);
    this.storeFormAttempted.set(false);
    this.storeInfo = null;
    this.selectedPreset.set('reference-bill');
    this.storeModel.set({ ...DEFAULT_STORE_FORM });
    this.resetMedicineModel();
  }
}
