export interface Customer {
  patientName: string;
  doctorName: string;
  address: string;
  phoneNumber: string;
  gstin?: string;
}

export interface StoreInfo {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storePhone2: string;
  licenseNo: string;
  fssai: string;
  gstin: string;
  email: string;
}
