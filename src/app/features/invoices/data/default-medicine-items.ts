import { InvoiceItem } from '../../../models/invoice-items.model';

export type MedicinePresetId = 'reference-bill' | 'sample-set-2';

export interface MedicinePresetOption {
  id: MedicinePresetId;
  label: string;
}

export const MEDICINE_PRESET_OPTIONS: MedicinePresetOption[] = [
  {
    id: 'reference-bill',
    label: 'Option 1 - Reference Bill (WELTELMI, DYFOZIN, etc.)',
  },
  {
    id: 'sample-set-2',
    label: 'Option 2 - DEKSEL ND, BIO D3, HVOTOP P, etc.',
  },
];

function expiryFromMonthYear(mmyy: string): string {
  const [mm, yy] = mmyy.split('/');
  return `20${yy}-${mm}-01`;
}

function item(
  itemName: string,
  pack: string,
  hsn: string,
  batch: string,
  expiryDate: string,
  mrp: number,
  quantity: number,
  discountPercentage = 15,
  gstPercentage = 5,
  drugCode = '',
): InvoiceItem {
  return {
    itemName,
    pack,
    hsn,
    drugCode,
    batch,
    expiryDate,
    mrp,
    quantity,
    discountPercentage,
    gstPercentage,
    amount: mrp * quantity,
  };
}

/** Default medicine rows matching the reference retail invoice. */
export function getDefaultMedicineItems(): InvoiceItem[] {
  return [
    item('WELTELMI 40 TAB', '10S', '3004', 'AFG088KA', '2027-09-01', 56.25, 1),
    item('DYFOZIN 10 TAB', '10TAB', '3004', 'MT250012', '2028-08-01', 128.0, 1),
    item('NEUROMAC GF CAP', '10S', '3004', 'SD-3217', '2027-12-01', 168.75, 1),
    item('GOLF G2 P TAB', '10TAB', '3004', 'YT30296', '2027-11-01', 121.88, 2),
    item('VOGLISTAR MD 0.2 TAB', '10S', '3004', 'X05Y002-', '2027-07-01', 109.81, 1),
  ];
}

/** Second sample medicine set (0% discount per line). */
export function getSampleSet2MedicineItems(): InvoiceItem[] {
  return [
    item('DEKSEL ND', '5ML', '300339', 'DND10550', expiryFromMonthYear('09/27'), 473.44, 2, 0),
    item(
      'BIO D3 STRONG CAP',
      '10CAP',
      '3004',
      '14260483A',
      expiryFromMonthYear('12/28'),
      280.73,
      2,
      0,
    ),
    item('HVOTOP P', '10TAB', '30046000', '205DC26006', expiryFromMonthYear('02/28'), 203.15, 4, 0),
    item('PEG NT LITE', '15S', '3004', '2552GTB774', expiryFromMonthYear('06/27'), 219.25, 2, 0),
    item('SAAZ TAB', '10S', '3004', 'JMT0125015', expiryFromMonthYear('07/28'), 50.4, 4, 0),
  ];
}

export function getMedicineItemsByPreset(preset: MedicinePresetId): InvoiceItem[] {
  switch (preset) {
    case 'sample-set-2':
      return getSampleSet2MedicineItems();
    case 'reference-bill':
    default:
      return getDefaultMedicineItems();
  }
}
