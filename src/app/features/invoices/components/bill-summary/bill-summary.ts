import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { InvoiceItem } from '../../../../models/invoice-items.model';
import { calculateInvoiceTotals } from '../../services/invoice-calculation';

@Component({
  selector: 'app-bill-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bill-summary.html',
  styleUrl: './bill-summary.scss',
})
export class BillSummaryComponent {
  items = input<InvoiceItem[]>([]);

  totals = computed(() => calculateInvoiceTotals(this.items()));
}
