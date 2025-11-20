import { db } from './database';
import { User, Product, Order, Category, Supplier, Purchase, CartItem, PaymentMethod, Unit } from '../types';
import { getFinalPrice } from '../utils/pricing';

const simulateDelay = (ms: number = 500) => new Promise(res => setTimeout(res, ms));

const getNextId = <T extends { id: any }>(items: T[]): number => {
  return items.reduce((maxId, item) => Math.max(item.id, maxId), 0) + 1;
};

const getNextSupplierCode = (suppliers: Supplier[]): string => {
    const maxId = suppliers.reduce((max, s) => {
        const num = parseInt(s.supplierCode.replace('S', ''), 10);
        return num > max ? num : max;
    }, 0);
    return `S${String(maxId + 1).padStart(3, '0')}`;
};


// Helper to join unit name to product(s)
const joinUnitDataToProducts = (products: Product[]): Product[] => {
    const units = db.getUnits();
    return products.map(product => {
        const unit = units.find(u => u.id === product.unitId);
        return { ...product, unitName: unit?.name || 'N/A' };
    });
};

const joinUnitDataToProduct = (product: Product | undefined): Product | undefined => {
    if (!product) return undefined;
    const units = db.getUnits();
    const unit = units.find(u => u.id === product.unitId);
    return { ...product, unitName: unit?.name || 'N/A' };
};

export const api = {
  // Products
  async fetchProducts(): Promise<Product[]> {
    await simulateDelay();
    const products = db.getProducts();
    return joinUnitDataToProducts(products);
  },
  async fetchProductById(id: number): Promise<Product | undefined> {
    await simulateDelay();
    const product = db.getProducts().find(p => p.id === id);
    return joinUnitDataToProduct(product);
  },
  async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    await simulateDelay();
    const products = db.getProducts();

    if (productData.supplierId) {
        productData.sellingPrice = productData.costPrice * 1.10;
    }

    const newProduct: Product = { ...productData, id: getNextId(products) };
    db.setProducts([...products, newProduct]);
    return newProduct;
  },
  async updateProduct(updatedProduct: Product): Promise<Product> {
    await simulateDelay();
    
    if (updatedProduct.supplierId) {
        updatedProduct.sellingPrice = updatedProduct.costPrice * 1.10;
    }

    const products = db.getProducts().map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    db.setProducts(products);
    return updatedProduct;
  },
  async deleteProduct(id: number): Promise<void> {
    await simulateDelay();
    const products = db.getProducts().filter(p => p.id !== id);
    db.setProducts(products);
  },
  async searchProducts(term: string, categoryId?: number, sortBy?: string): Promise<Product[]> {
      await simulateDelay(300);
      let results = db.getProducts();
      
      if (term) {
        results = results.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));
      }
      
      if (categoryId) {
        results = results.filter(p => p.categoryId === categoryId);
      }
      
      if (sortBy === 'price-asc') {
        results.sort((a, b) => a.sellingPrice - b.sellingPrice);
      } else if (sortBy === 'price-desc') {
        results.sort((a, b) => b.sellingPrice - a.sellingPrice);
      } else if (sortBy === 'name-asc') {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      return joinUnitDataToProducts(results);
  },

  // Users
  async login(email: string, password: string): Promise<User | null> {
    await simulateDelay();
    const user = db.getUsers().find(u => u.email === email && u.password === password);
    return user || null;
  },
  async fetchUsers(): Promise<User[]> {
      await simulateDelay();
      return db.getUsers();
  },
  async addUser(userData: Omit<User, 'id'>): Promise<User> {
    await simulateDelay();
    const users = db.getUsers();
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }
    const newUser = { ...userData, id: getNextId(users) };
    db.setUsers([...users, newUser]);
    return newUser;
  },
  async updateUser(updatedUser: User): Promise<User> {
    await simulateDelay();
    const users = db.getUsers().map(u => (u.id === updatedUser.id ? updatedUser : u));
    db.setUsers(users);
    return updatedUser;
  },
  async deleteUser(id: number): Promise<void> {
    await simulateDelay();
    const users = db.getUsers().filter(u => u.id !== id);
    db.setUsers(users);
  },

  // Orders
  async saveOrder(order: Order): Promise<Order> {
    await simulateDelay();
    const orders = db.getOrders();
    db.setOrders([...orders, order]);
    return order;
  },
  async updateOrder(updatedOrder: Order): Promise<Order> {
    await simulateDelay();
    const orders = db.getOrders().map(o => (o.id === updatedOrder.id ? updatedOrder : o));
    db.setOrders(orders);
    return updatedOrder;
  },
  async processPOSOrder(cart: CartItem[], paymentMethod: PaymentMethod, cashierId: number): Promise<Order> {
    await simulateDelay();
    const products = db.getProducts();
    const orders = db.getOrders();

    // 1. Validasi stok
    for (const item of cart) {
      const productInDb = products.find(p => p.id === item.product.id);
      if (!productInDb || productInDb.stock < item.quantity) {
        throw new Error(`Stok tidak mencukupi untuk produk: ${item.product.name}. Sisa stok: ${productInDb?.stock || 0}.`);
      }
    }

    // 2. Kurangi stok
    const updatedProducts = products.map(p => {
      const itemInCart = cart.find(item => item.product.id === p.id);
      if (itemInCart) {
        return { ...p, stock: p.stock - itemInCart.quantity };
      }
      return p;
    });
    db.setProducts(updatedProducts);

    // 3. Buat dan simpan pesanan, hitung total dengan harga berjenjang
    const total = cart.reduce((sum, item) => {
        // Ambil data produk terbaru dari DB untuk memastikan priceTiers akurat
        const productFromDb = products.find(p => p.id === item.product.id);
        if (!productFromDb) return sum; // Seharusnya tidak terjadi

        const price = getFinalPrice(productFromDb, item.quantity);
        return sum + price * item.quantity;
    }, 0);
    
    const newOrder: Order = {
      id: `POS-${Date.now()}`,
      userId: cashierId, // Gunakan ID kasir
      items: cart,
      total: total,
      paymentMethod: paymentMethod,
      date: new Date().toISOString(),
    };
    db.setOrders([...orders, newOrder]);

    return newOrder;
  },
  async fetchAllOrders(): Promise<Order[]> {
    await simulateDelay();
    return db.getOrders();
  },
  async fetchOrdersByUserId(userId: number): Promise<Order[]> {
    await simulateDelay();
    return db.getOrders().filter(o => o.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  async fetchOrderById(id: string): Promise<Order | undefined> {
    await simulateDelay();
    return db.getOrders().find(o => o.id === id);
  },
  
  // Categories
  async fetchCategories(): Promise<Category[]> {
      await simulateDelay();
      return db.getCategories();
  },
  async addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    await simulateDelay();
    const categories = db.getCategories();
    const newCategory = { ...categoryData, id: getNextId(categories) };
    db.setCategories([...categories, newCategory]);
    return newCategory;
  },
  async updateCategory(updatedCategory: Category): Promise<Category> {
    await simulateDelay();
    const categories = db.getCategories().map(c => (c.id === updatedCategory.id ? updatedCategory : c));
    db.setCategories(categories);
    return updatedCategory;
  },
  async deleteCategory(id: number): Promise<void> {
    await simulateDelay();
    const categories = db.getCategories().filter(c => c.id !== id);
    db.setCategories(categories);
  },

  // Units
  async fetchUnits(): Promise<Unit[]> {
      await simulateDelay();
      return db.getUnits();
  },
  async addUnit(unitData: Omit<Unit, 'id'>): Promise<Unit> {
    await simulateDelay();
    const units = db.getUnits();
    const newUnit = { ...unitData, id: getNextId(units) };
    db.setUnits([...units, newUnit]);
    return newUnit;
  },
  async updateUnit(updatedUnit: Unit): Promise<Unit> {
    await simulateDelay();
    const units = db.getUnits().map(u => (u.id === updatedUnit.id ? updatedUnit : u));
    db.setUnits(units);
    return updatedUnit;
  },
  async deleteUnit(id: number): Promise<void> {
    await simulateDelay();
    const units = db.getUnits().filter(u => u.id !== id);
    db.setUnits(units);
  },

  // Suppliers
  async fetchSuppliers(): Promise<Supplier[]> {
      await simulateDelay();
      return db.getSuppliers();
  },
   async fetchSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    await simulateDelay();
    return db.getSuppliers().find(s => s.userId === userId);
  },
  async addSupplier(supplierData: Omit<Supplier, 'id' | 'supplierCode' | 'status'>): Promise<Supplier> {
    await simulateDelay();
    const suppliers = db.getSuppliers();
    const newSupplier: Supplier = { 
        ...supplierData, 
        id: getNextId(suppliers),
        supplierCode: getNextSupplierCode(suppliers),
        status: 'PENDING_APPROVAL',
    };
    db.setSuppliers([...suppliers, newSupplier]);
    return newSupplier;
  },
  async updateSupplier(updatedSupplier: Supplier): Promise<Supplier> {
    await simulateDelay();
    const suppliers = db.getSuppliers().map(s => (s.id === updatedSupplier.id ? updatedSupplier : s));
    db.setSuppliers(suppliers);
    return updatedSupplier;
  },
  async deleteSupplier(id: number): Promise<void> {
    await simulateDelay();
    const suppliers = db.getSuppliers().filter(s => s.id !== id);
    db.setSuppliers(suppliers);
  },

  // Purchasing
  async searchProductBySkuOrBarcode(code: string): Promise<Product | undefined> {
    await simulateDelay(200);
    if (!code.trim()) return undefined;
    const product = db.getProducts().find(p => p.sku === code || p.barcode === code);
    return joinUnitDataToProduct(product);
  },

  async recordPurchase(purchaseData: { 
    productId: number;
    quantity: number;
    newCostPrice: number;
    newSellingPrice: number;
  }): Promise<void> {
    await simulateDelay();
    const products = db.getProducts();
    const productIndex = products.findIndex(p => p.id === purchaseData.productId);

    if (productIndex === -1) {
      throw new Error("Produk tidak ditemukan untuk dicatat pembeliannya.");
    }
    
    const product = products[productIndex];

    product.stock += purchaseData.quantity;
    product.costPrice = purchaseData.newCostPrice;
    product.sellingPrice = purchaseData.newSellingPrice;

    products[productIndex] = product;
    db.setProducts(products);

    const purchases = db.getPurchases();
    const newPurchase: Purchase = {
      id: `purch-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: purchaseData.quantity,
      purchasePrice: purchaseData.newCostPrice,
      totalCost: purchaseData.quantity * purchaseData.newCostPrice,
      date: new Date().toISOString(),
    };
    db.setPurchases([...purchases, newPurchase]);
  },

  async fetchPurchases(): Promise<Purchase[]> {
    await simulateDelay();
    return db.getPurchases().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
};