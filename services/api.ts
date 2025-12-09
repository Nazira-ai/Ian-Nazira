
import { supabase } from './supabaseClient';
import { User, Product, Order, Category, Supplier, Purchase, CartItem, PaymentMethod, Unit, DeliveryStatus, AboutPageContent } from '../types';
import { getFinalPrice } from '../utils/pricing';

// Helper: Join unit name to product(s)
// Karena Supabase mengembalikan data join dalam bentuk nested object (e.g. units: { name: 'Pcs' }),
// kita perlu meratakannya agar sesuai dengan interface Product di frontend.
const formatProductData = (p: any): Product => {
    return {
        ...p,
        unitName: p.units?.name || 'N/A'
    };
};

export const api = {
  // --- Products ---
  
  async fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select(`*, units (name)`)
        .order('id', { ascending: true });

    if (error) throw new Error(error.message);
    return data.map(formatProductData);
  },

  async fetchProductById(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
        .from('products')
        .select(`*, units (name)`)
        .eq('id', id)
        .single();

    if (error || !data) return undefined;
    return formatProductData(data);
  },

  async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    // Hapus unitName jika ada di objek kiriman karena itu field relasi, bukan kolom tabel
    const { unitName, ...payload } = productData as any;
    
    // Auto margin logic
    if (payload.supplierId) {
        payload.sellingPrice = payload.costPrice * 1.10;
    }

    const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

    if (error) throw new Error(error.message);
    
    // Fetch ulang untuk dapat nama unit
    return (await this.fetchProductById(data.id))!;
  },

  async updateProduct(updatedProduct: Product): Promise<Product> {
    const { unitName, units, ...payload } = updatedProduct as any;

    if (payload.supplierId) {
        payload.sellingPrice = payload.costPrice * 1.10;
    }

    const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', payload.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return (await this.fetchProductById(data.id))!;
  },

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async searchProducts(term: string, categoryId?: number, sortBy?: string): Promise<Product[]> {
      let query = supabase
        .from('products')
        .select(`*, units (name)`);

      if (term) {
        query = query.ilike('name', `%${term}%`);
      }
      
      if (categoryId) {
        query = query.eq('categoryId', categoryId);
      }
      
      if (sortBy === 'price-asc') {
        query = query.order('sellingPrice', { ascending: true });
      } else if (sortBy === 'price-desc') {
        query = query.order('sellingPrice', { ascending: false });
      } else if (sortBy === 'name-asc') {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('id', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      
      return data.map(formatProductData);
  },

  // --- Users ---

  async login(email: string, password: string): Promise<User | null> {
    // Note: Untuk production, gunakan supabase.auth.signInWithPassword.
    // Ini adalah implementasi query tabel manual sesuai struktur mock sebelumnya.
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // PENTING: Password harus di-hash di production
        .single();

    if (error || !data) return null;
    return data as User;
  },

  async fetchUsers(): Promise<User[]> {
      const { data, error } = await supabase.from('users').select('*').order('id');
      if (error) throw new Error(error.message);
      return data as User[];
  },

  async addUser(userData: Omit<User, 'id'>): Promise<User> {
    // Cek email duplikat
    const { data: existing } = await supabase.from('users').select('id').eq('email', userData.email).single();
    if (existing) {
      throw new Error('Email already exists');
    }

    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as User;
  },

  async updateUser(updatedUser: User): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .update(updatedUser)
        .eq('id', updatedUser.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as User;
  },

  async deleteUser(id: number): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Orders ---

  async saveOrder(order: Order): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Order;
  },

  async updateOrder(updatedOrder: Order): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .update(updatedOrder)
        .eq('id', updatedOrder.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Order;
  },

  async processPOSOrder(cart: CartItem[], paymentMethod: PaymentMethod, cashierId: number): Promise<Order> {
    // 1. Validasi Stok (Fetch stok terbaru dari DB)
    const productIds = cart.map(c => c.product.id);
    const { data: dbProducts, error: fetchError } = await supabase
        .from('products')
        .select('id, name, stock, priceTiers, sellingPrice, discountPercent') // Ambil field yg dibutuhkan untuk hitung harga
        .in('id', productIds);
    
    if (fetchError) throw new Error(fetchError.message);

    for (const item of cart) {
        const productInDb = dbProducts?.find(p => p.id === item.product.id);
        if (!productInDb || productInDb.stock < item.quantity) {
             throw new Error(`Stok tidak mencukupi untuk produk: ${item.product.name}. Sisa stok: ${productInDb?.stock || 0}.`);
        }
    }

    // 2. Kurangi Stok
    // Idealnya menggunakan RPC/Transaction, tapi kita loop update untuk kesederhanaan di frontend
    for (const item of cart) {
        const productInDb = dbProducts!.find(p => p.id === item.product.id)!;
        await supabase
            .from('products')
            .update({ stock: productInDb.stock - item.quantity })
            .eq('id', item.product.id);
    }

    // 3. Hitung Total & Simpan Order
    // Re-construct product object untuk helper pricing
    const total = cart.reduce((sum, item) => {
        const productInDb = dbProducts!.find(p => p.id === item.product.id) as any;
        const price = getFinalPrice(productInDb, item.quantity);
        return sum + price * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: `POS-${Date.now()}`,
      userId: cashierId,
      items: cart,
      total: total,
      paymentMethod: paymentMethod,
      date: new Date().toISOString(),
      shippingStatus: DeliveryStatus.DELIVERED // POS langsung selesai
    };

    return await this.saveOrder(newOrder);
  },

  async fetchAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Order[];
  },

  async fetchOrdersByUserId(userId: number): Promise<Order[]> {
     const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('userId', userId)
        .order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Order[];
  },

  async fetchOrderById(id: string): Promise<Order | undefined> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return undefined;
    return data as Order;
  },
  
  // --- Categories ---

  async fetchCategories(): Promise<Category[]> {
      const { data, error } = await supabase.from('categories').select('*').order('id');
      if (error) throw new Error(error.message);
      return data as Category[];
  },

  async addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await supabase.from('categories').insert([categoryData]).select().single();
    if (error) throw new Error(error.message);
    return data as Category;
  },

  async updateCategory(updatedCategory: Category): Promise<Category> {
    const { data, error } = await supabase.from('categories').update(updatedCategory).eq('id', updatedCategory.id).select().single();
    if (error) throw new Error(error.message);
    return data as Category;
  },

  async deleteCategory(id: number): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Units ---

  async fetchUnits(): Promise<Unit[]> {
      const { data, error } = await supabase.from('units').select('*').order('id');
      if (error) throw new Error(error.message);
      return data as Unit[];
  },

  async addUnit(unitData: Omit<Unit, 'id'>): Promise<Unit> {
    const { data, error } = await supabase.from('units').insert([unitData]).select().single();
    if (error) throw new Error(error.message);
    return data as Unit;
  },

  async updateUnit(updatedUnit: Unit): Promise<Unit> {
    const { data, error } = await supabase.from('units').update(updatedUnit).eq('id', updatedUnit.id).select().single();
    if (error) throw new Error(error.message);
    return data as Unit;
  },

  async deleteUnit(id: number): Promise<void> {
    const { error } = await supabase.from('units').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Suppliers ---

  async fetchSuppliers(): Promise<Supplier[]> {
      const { data, error } = await supabase.from('suppliers').select('*').order('id');
      if (error) throw new Error(error.message);
      return data as Supplier[];
  },

   async fetchSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    const { data, error } = await supabase.from('suppliers').select('*').eq('userId', userId).single();
    if (error) return undefined;
    return data as Supplier;
  },

  async addSupplier(supplierData: Omit<Supplier, 'id' | 'supplierCode' | 'status'>): Promise<Supplier> {
    // Generate code logic moved to server or simple client logic
    const { data: lastSupplier } = await supabase.from('suppliers').select('supplierCode').order('id', { ascending: false }).limit(1).single();
    
    let nextCode = 'S001';
    if (lastSupplier) {
        const num = parseInt(lastSupplier.supplierCode.replace('S', ''), 10);
        nextCode = `S${String(num + 1).padStart(3, '0')}`;
    }

    const newSupplier = { 
        ...supplierData, 
        supplierCode: nextCode,
        status: 'PENDING_APPROVAL',
    };

    const { data, error } = await supabase.from('suppliers').insert([newSupplier]).select().single();
    if (error) throw new Error(error.message);
    return data as Supplier;
  },

  async updateSupplier(updatedSupplier: Supplier): Promise<Supplier> {
    const { data, error } = await supabase.from('suppliers').update(updatedSupplier).eq('id', updatedSupplier.id).select().single();
    if (error) throw new Error(error.message);
    return data as Supplier;
  },

  async deleteSupplier(id: number): Promise<void> {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Purchasing ---

  async searchProductBySkuOrBarcode(code: string): Promise<Product | undefined> {
    if (!code.trim()) return undefined;
    const { data, error } = await supabase
        .from('products')
        .select(`*, units (name)`)
        .or(`sku.eq.${code},barcode.eq.${code}`)
        .single();
    
    if (error || !data) return undefined;
    return formatProductData(data);
  },

  async recordPurchase(purchaseData: { 
    productId: number;
    quantity: number;
    newCostPrice: number;
    newSellingPrice: number;
  }): Promise<void> {
    // 1. Get current product info
    const product = await this.fetchProductById(purchaseData.productId);
    if (!product) throw new Error("Produk tidak ditemukan.");

    // 2. Update Product Stock & Price
    await supabase.from('products').update({
        stock: product.stock + purchaseData.quantity,
        costPrice: purchaseData.newCostPrice,
        sellingPrice: purchaseData.newSellingPrice
    }).eq('id', product.id);

    // 3. Insert Purchase Record
    const newPurchase = {
        id: `purch-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        quantity: purchaseData.quantity,
        purchasePrice: purchaseData.newCostPrice,
        totalCost: purchaseData.quantity * purchaseData.newCostPrice,
        date: new Date().toISOString(),
    };
    
    const { error } = await supabase.from('purchases').insert([newPurchase]);
    if (error) throw new Error(error.message);
  },

  async fetchPurchases(): Promise<Purchase[]> {
    const { data, error } = await supabase.from('purchases').select('*').order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Purchase[];
  },

  // --- Site Settings ---
  async fetchSiteSettings(): Promise<any> {
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching site settings:", error);
    }
    return data;
  },

  async updateSiteSettings(settings: any): Promise<void> {
    // Attempt to update first. If no rows affected (doesn't exist), insert.
    // However, Supabase's upsert is easier if we have the ID.
    // Since we assume ID 1 for settings:
    const { error } = await supabase.from('site_settings').upsert({ id: 1, ...settings });
    if (error) throw new Error(error.message);
  },

  // --- About Page ---
  async fetchAboutPage(): Promise<AboutPageContent | null> {
    const { data, error } = await supabase.from('about_page').select('*').single();
     if (error && error.code !== 'PGRST116') {
        console.error("Error fetching about page:", error);
    }
    return data;
  },

  async updateAboutPage(content: AboutPageContent): Promise<void> {
    const { error } = await supabase.from('about_page').upsert({ id: 1, ...content });
    if (error) throw new Error(error.message);
  }
};
