import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { InvoiceItem } from '../../../../models/invoice-items.model';


@Component({
  selector: 'app-medicine-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-table.html',
  styleUrl: './medicine-table.scss',
})
export class MedicineTableComponent {
  items = input<InvoiceItem[]>([]);
  removeItem = output<number>();
  resetAll = output<void>();
  addItem = output<void>();

  formatExpiry(data: string): string {
    if (!data) return '';
    const d = new Date(data);
    if (isNaN(d.getTime())) return data;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
  }
}
