
import { User, Product, Order, Role, Category, Supplier, Purchase, DigitalWalletProvider, Unit } from '../types';

const DB_PREFIX = 'koperasi_master_';

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(DB_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    const item = JSON.stringify(value);
    localStorage.setItem(DB_PREFIX + key, item);
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
}

const initialData = {
  // FIX: Cast array to User[] to enforce strict typing for properties like identityCardStatus.
  // Used DigitalWalletProvider.GOPAY enum instead of a plain string.
  users: [
    { id: 1, fullName: 'Super Admin', email: 'superadmin@test.com', password: 'password', role: Role.SUPER_ADMIN, identityCardStatus: 'VALIDATED' },
    { id: 2, fullName: 'Admin User', email: 'admin@test.com', password: 'password', role: Role.ADMIN, identityCardStatus: 'VALIDATED' },
    { id: 3, fullName: 'Cashier User', email: 'cashier@test.com', password: 'password', role: Role.CASHIER, identityCardStatus: 'VALIDATED' },
    { id: 4, fullName: 'Budi Santoso', email: 'budi@test.com', password: 'password', role: Role.CUSTOMER, identityCardStatus: 'VALIDATED', digitalWalletProvider: DigitalWalletProvider.GOPAY, digitalWalletBalance: 500000, location: 'Jakarta' },
    { id: 5, fullName: 'Citra Lestari', email: 'citra@test.com', password: 'password', role: Role.CUSTOMER, identityCardStatus: 'PENDING_VALIDATION', location: 'Bandung', identityCardUrl: 'https://via.placeholder.com/400x250.png?text=KTP+Citra' },
    { id: 6, fullName: 'Kurir Cepat', email: 'kurir@test.com', password: 'password', role: Role.SHIPPING, identityCardStatus: 'VALIDATED' },
  ] as User[],
  categories: [
      { id: 1, name: 'Makanan Ringan', categoryCode: 'SNK' },
      { id: 2, name: 'Minuman', categoryCode: 'BVG' },
      { id: 3, name: 'Sembako', categoryCode: 'GRC' },
      { id: 4, name: 'Peralatan Mandi', categoryCode: 'BTH' },
  ],
  units: [
      { id: 1, name: 'Pcs' },
      { id: 2, name: 'Kg' },
      { id: 3, name: 'Liter' },
      { id: 4, name: 'Botol' },
      { id: 5, name: 'Dus' },
      { id: 6, name: 'Pak' },
      { id: 7, name: 'Sak' },
  ],
  suppliers: [
      { id: 1, userId: 2, status: 'APPROVED', supplierCode: 'S001', companyName: 'PT Indofood CBP Sukses Makmur Tbk', address: 'Jakarta, Indonesia', phoneNumber: '021-57958822', salesName: 'Andi' },
      { id: 2, userId: 3, status: 'APPROVED', supplierCode: 'S002', companyName: 'PT Mayora Indah Tbk', address: 'Tangerang, Indonesia', phoneNumber: '021-80637000', salesName: 'Dewi' },
  // FIX: Cast the initial suppliers array to `Supplier[]` to ensure the `status` property matches the required string literal type.
  ] as Supplier[],
  products: [
    { id: 1, name: 'Indomie Goreng Original', description: 'Mi instan goreng rasa original yang legendaris.', costPrice: 2500, sellingPrice: 3000, stock: 150, barcode: '8998866200016', imageUrl: 'https://images.unsplash.com/photo-1633410145262-49d7f0807954?q=80&w=400', categoryId: 3, unitId: 1, specifications: { 'Berat': '85g', 'Rasa': 'Original' }, sku: 'GRC-IND-001', supplierCode: 'S001', priceTiers: [ {minQuantity: 10, price: 2800}, {minQuantity: 40, price: 2700} ], supplierId: 1 },
    { id: 2, name: 'Teh Pucuk Harum', description: 'Minuman teh melati yang menyegarkan.', costPrice: 3000, sellingPrice: 4000, stock: 200, barcode: '8992761131015', imageUrl: 'https://images.unsplash.com/photo-1594936931930-13a693a9f14d?q=80&w=400', categoryId: 2, unitId: 4, specifications: { 'Volume': '350ml', 'Jenis': 'Teh Melati' }, discountPercent: 10, sku: 'BVG-TPH-001', supplierCode: 'S001', supplierId: 1 },
    { id: 3, name: 'Chitato Sapi Panggang', description: 'Keripik kentang rasa sapi panggang yang renyah.', costPrice: 8000, sellingPrice: 10000, stock: 4, barcode: '7890123456789', imageUrl: 'https://images.unsplash.com/photo-1599490659223-380c9557af0f?q=80&w=400', categoryId: 1, unitId: 1, specifications: { 'Berat': '68g', 'Rasa': 'Sapi Panggang' }, sku: 'SNK-CHT-001', supplierCode: 'S001', supplierId: 1 },
    { id: 4, name: 'Beras Sania Premium', description: 'Beras pulen kualitas premium.', costPrice: 60000, sellingPrice: 68000, stock: 50, barcode: '1234567890123', imageUrl: 'https://images.unsplash.com/photo-1586201375822-55232b7a0233?q=80&w=400', categoryId: 3, unitId: 7, specifications: { 'Berat': '5kg', 'Jenis': 'Beras Premium' }, sku: 'GRC-BRS-001', supplierCode: 'S002', supplierId: 2 },
  ],
  orders: [],
  purchases: [],
};

// FIX: Created a mapped type to ensure type safety in generic get/set methods.
type DataModel = {
  users: User[];
  products: Product[];
  orders: Order[];
  categories: Category[];
  suppliers: Supplier[];
  purchases: Purchase[];
  units: Unit[];
};

type DataKey = keyof DataModel;

class Database {
  private users: User[];
  private products: Product[];
  private orders: Order[];
  private categories: Category[];
  private suppliers: Supplier[];
  private purchases: Purchase[];
  private units: Unit[];

  constructor() {
    this.users = getFromStorage('users', initialData.users);
    this.products = getFromStorage('products', initialData.products);
    this.orders = getFromStorage('orders', initialData.orders);
    this.categories = getFromStorage('categories', initialData.categories);
    this.suppliers = getFromStorage('suppliers', initialData.suppliers);
    this.purchases = getFromStorage('purchases', initialData.purchases);
    this.units = getFromStorage('units', initialData.units);
  }

  // FIX: Refactored generic get/set methods to be type-safe, avoiding potential type mismatches.
  // Generic getter/setter
  private get<K extends DataKey>(key: K): DataModel[K] {
    // FIX: Use a type assertion to resolve the indexing error. TypeScript cannot
    // infer that `this` is indexable by a generic key `K` in this context.
    return (this as any)[key];
  }
  
  private set<K extends DataKey>(key: K, data: DataModel[K]): void {
    // FIX: Use a type assertion to resolve the indexing error.
    (this as any)[key] = data;
    saveToStorage(key, data);
  }

  // Users
  getUsers = () => this.get('users');
  setUsers = (users: User[]) => this.set('users', users);

  // Products
  getProducts = () => this.get('products');
  setProducts = (products: Product[]) => this.set('products', products);

  // Orders
  getOrders = () => this.get('orders');
  setOrders = (orders: Order[]) => this.set('orders', orders);

  // Categories
  getCategories = () => this.get('categories');
  setCategories = (categories: Category[]) => this.set('categories', categories);
    
  // Suppliers
  getSuppliers = () => this.get('suppliers');
  setSuppliers = (suppliers: Supplier[]) => this.set('suppliers', suppliers);

  // Purchases
  getPurchases = () => this.get('purchases');
  setPurchases = (purchases: Purchase[]) => this.set('purchases', purchases);
  
  // Units
  getUnits = () => this.get('units');
  setUnits = (units: Unit[]) => this.set('units', units);
}

export const db = new Database();
