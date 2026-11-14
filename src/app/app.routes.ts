import { Routes } from '@angular/router';
import { CreateInvoice } from './features/invoices/pages/create-invoice/create-invoice';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'invoice',
    pathMatch: 'full',
  },
  {
    path: 'invoice',
    component: CreateInvoice,
  },
  {
    path: '**',
    redirectTo: 'invoice',
  },
];
