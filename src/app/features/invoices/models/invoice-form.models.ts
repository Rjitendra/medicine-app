export interface StoreFormModel {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storePhone2: string;
  licenseNo: string;
  fssai: string;
  gstin: string;
  email: string;
}

export interface MedicineFormModel {
  itemName: string;
  pack: string;
  hsn: string;
  drugCode: string;
  batch: string;
  expiryDate: string;
  mrp: number | null;
  quantity: number | null;
  discountPercentage: number;
  gstPercentage: number;
}

export interface InvoiceDetailsFormModel {
  invoiceNo: number | null;
  invoiceDate: string;
  invoiceType: string;
  patientName: string;
  doctorName: string;
  address: string;
  phoneNumber: string;
}

export const DEFAULT_STORE_FORM: StoreFormModel = {
  storeName: 'MEDICINE POINT',
  storeAddress: 'KANDARANGA, KENDRAPARA ODISHA',
  storePhone: '0853958519',
  storePhone2: '0917482261',
  licenseNo: 'KEN-37321/R,37322/RC,15676/RX',
  fssai: 'KEN-37321/R,37322/RC, 15676/RX', // or respective fssai value
  gstin: '21AAPEF2836P1Z0',
  email: 'medicinepoint9900@gmail.com',
};

export const DEFAULT_MEDICINE_FORM: MedicineFormModel = {
  itemName: '',
  pack: '10S',
  hsn: '3004',
  drugCode: '',
  batch: '',
  expiryDate: '',
  mrp: null,
  quantity: null,
  discountPercentage: 0,
  gstPercentage: 5,
};
