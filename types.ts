
export enum Page {
  HOME = 'HOME',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  DASHBOARD = 'DASHBOARD',
  ORDER_DETAIL = 'ORDER_DETAIL',
  INVOICE = 'INVOICE',
  ABOUT = 'ABOUT',
  PROFILE = 'PROFILE',
  REGISTER_SUPPLIER = 'REGISTER_SUPPLIER',
}

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  CUSTOMER = 'CUSTOMER',
  SHIPPING = 'SHIPPING',
  SUPPLIER = 'SUPPLIER',
}

export enum PaymentMethod {
  CASH = 'Tunai',
  COD = 'Cash on Delivery',
  BANK_TRANSFER = 'Transfer Bank',
  DIGITAL_WALLET = 'Dompet Digital',
  QRIS = 'QRIS',
  DEBIT_CARD = 'Kartu Debit',
  CREDIT_CARD = 'Kartu Kredit',
}

export enum BankName {
  BCA = 'BCA',
  MANDIRI = 'Mandiri',
  BRI = 'BRI',
  BNI = 'BNI',
}

export enum DigitalWalletProvider {
  GOPAY = 'GoPay',
  OVO = 'OVO',
  DANA = 'DANA',
  SHOPEEPAY = 'ShopeePay',
}

export enum DeliveryStatus {
  AWAITING_ASSIGNMENT = 'AWAITING_ASSIGNMENT',
  PENDING_PICKUP = 'PENDING_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  location?: string;
  identityCardUrl?: string;
  identityCardStatus?: 'NOT_UPLOADED' | 'PENDING_VALIDATION' | 'VALIDATED';
  digitalWalletProvider?: DigitalWalletProvider;
  digitalWalletBalance?: number;
}

export interface Category {
  id: number;
  name: string;
  categoryCode: string;
}

export interface Unit {
  id: number;
  name: string;
}

export interface PriceTier {
  minQuantity: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  barcode: string;
  imageUrl: string;
  categoryId: number;
  unitId: number;
  unitName?: string;
  specifications: { [key: string]: string };
  discountPercent?: number;
  priceTiers?: PriceTier[];
  sku?: string;
  supplierCode?: string;
  supplierId?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: number;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  date: string;
  bankName?: BankName;
  digitalWalletProvider?: DigitalWalletProvider;
  shippingAddress?: string;
  shippingProviderId?: number;
  shippingStatus?: DeliveryStatus;
  trackingNumber?: string;
  applicationFee?: number;
}

export interface Supplier {
  id: number;
  userId: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  supplierCode: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  salesName: string;
}

export interface Purchase {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
  totalCost: number;
  date: string;
}

export interface AboutPageContent {
  title: string;
  subtitle: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionItems: string[];
  historyTitle: string;
  historyText: string;
  galleryTitle: string;
  galleryImages: string[];
  locationTitle: string;
  locationMapUrl: string;
}
