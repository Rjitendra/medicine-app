export interface InvoiceItem {
  itemName: string;
  pack: string;
  hsn: string;
  drugCode: string;
  batch: string;
  expiryDate: string;
  mrp: number;
  quantity: number;
  discountPercentage: number;
  gstPercentage: number;
  amount: number;
}