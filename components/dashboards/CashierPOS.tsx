import React, { useState, useEffect } from 'react';
import { Product, CartItem, PaymentMethod, Order } from '../../types';
import { api } from '../../services/api';
import { BarcodeIcon, CreditCardIcon, TrashIcon, XIcon } from '../Icons';
import { useAppContext } from '../../context/AppContext';
import { getFinalPrice } from '../../utils/pricing';

// Component Struk Pembelian
const PurchaseReceipt: React.FC<{
  order: Order;
  onNewTransaction: () => void;
}> = ({ order, onNewTransaction }) => {
  const { logoUrl } = useAppContext();

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  
  const handlePrint = () => window.print();

  return (
    <div>
       <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
          .no-print { display: none; }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>
      <div className="printable-area max-w-sm mx-auto bg-white p-6 rounded-lg border shadow-lg">
        <div className="text-center mb-6">
          <img src={logoUrl} alt="Logo" className="h-16 w-16 mx-auto mb-2"/>
          <h2 className="text-xl font-bold">Koperasi MASTER</h2>
          <p className="text-xs">Jl. Banjaranyar - Pasiraman Km. 0,5</p>
          <p className="text-xs">Pekuncen, Banyumas</p>
        </div>
        <div className="text-xs mb-4 border-b border-dashed pb-2">
          <p>No: {order.id}</p>
          <p>Tanggal: {formatDate(order.date)}</p>
        </div>
        <div className="space-y-2 text-xs mb-4 border-b border-dashed pb-2">
          {order.items.map(item => (
            <div key={item.product.id}>
              <p className="font-semibold">{item.product.name}</p>
              <div className="flex justify-between">
                <span>{item.quantity} x {formatCurrency(getFinalPrice(item.product, item.quantity))}</span>
                <span>{formatCurrency(getFinalPrice(item.product, item.quantity) * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1 text-sm font-semibold">
           <div className="flex justify-between">
            <span>TOTAL</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between text-xs font-normal pt-2">
            <span>Metode Bayar</span>
            <span>{order.paymentMethod}</span>
          </div>
        </div>
        <p className="text-xs text-center mt-6 border-t border-dashed pt-4">Terima kasih telah berbelanja!</p>
      </div>

      <div className="mt-6 flex justify-center gap-4 no-print">
        <button onClick={handlePrint} className="bg-primary text-white font-bold px-6 py-2 rounded-md hover:bg-primary-hover">
          Cetak Struk
        </button>
        <button onClick={onNewTransaction} className="bg-gray-600 text-white font-bold px-6 py-2 rounded-md hover:bg-gray-700">
          Transaksi Baru
        </button>
      </div>
    </div>
  );
};


// Modal untuk input kuantitas
const QuantityModal: React.FC<{
    product: Product;
    onConfirm: (quantity: number) => void;
    onCancel: () => void;
}> = ({ product, onConfirm, onCancel }) => {
    const [quantity, setQuantity] = useState<number | string>(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = Number(quantity);
        if (numQuantity > 0) {
            onConfirm(numQuantity);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm animate-fade-in-up">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <button onClick={onCancel}><XIcon className="h-6 w-6 text-gray-500"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        Masukkan Jumlah Barang
                    </label>
                    <input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full p-3 text-2xl text-center border border-gray-300 rounded-md shadow-sm"
                        min="1"
                        autoFocus
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                            Batal
                        </button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
                            Tambah
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CashierPOS: React.FC = () => {
  const { currentUser, showToast } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [productForQuantity, setProductForQuantity] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);


  useEffect(() => {
    api.fetchProducts().then(setProducts);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode && p.barcode.includes(searchTerm))
  );

  const addItemToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const handleConfirmAddToCart = (quantity: number) => {
    if (productForQuantity) {
        addItemToCart(productForQuantity, quantity);
    }
    setProductForQuantity(null);
    setSearchTerm('');
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + getFinalPrice(item.product, item.quantity) * item.quantity, 0);

  const handlePayment = async () => {
    if (!paymentMethod || cart.length === 0) {
        showToast("Pilih item dan metode pembayaran.", 'error');
        return;
    }
    if (!currentUser) {
        showToast("Sesi kasir tidak valid. Silakan login kembali.", 'error');
        return;
    }

    setIsProcessingPayment(true);
    
    try {
        const orderDetails = await api.processPOSOrder(cart, paymentMethod, currentUser.id);
        setCompletedOrder(orderDetails);
    } catch (error: any) {
        showToast(error.message || "Gagal memproses pembayaran.", 'error');
    } finally {
        setIsProcessingPayment(false);
    }
  }

  const handleNewTransaction = () => {
    setCart([]);
    setPaymentMethod('');
    setSearchTerm('');
    setCompletedOrder(null);
    // Refresh product list to get latest stock
    api.fetchProducts().then(setProducts);
  }

  const handleProductSelect = (product: Product) => {
    setProductForQuantity(product);
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Auto-select if a full barcode match is found
    if(value.trim().length > 3) { // Simple check to avoid triggering on every keystroke
        const productByBarcode = products.find(p => p.barcode === value.trim());
        if (productByBarcode) {
          handleProductSelect(productByBarcode);
        }
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  
  const offlinePaymentMethods = [PaymentMethod.CASH, PaymentMethod.QRIS, PaymentMethod.DEBIT_CARD, PaymentMethod.CREDIT_CARD];

  if (completedOrder) {
    return <PurchaseReceipt order={completedOrder} onNewTransaction={handleNewTransaction} />
  }

  return (
    <div>
      {productForQuantity && (
        <QuantityModal
            product={productForQuantity}
            onConfirm={handleConfirmAddToCart}
            onCancel={() => setProductForQuantity(null)}
        />
      )}
      <h2 className="text-2xl font-bold text-primary mb-4">Kasir / Point of Sale (POS)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="relative mb-4">
            <input 
                type="text" 
                placeholder="Cari nama barang atau scan barcode..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-3 pl-10 bg-white border rounded-lg"
            />
            <BarcodeIcon className="h-6 w-6 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
          </div>
          <div className="h-96 overflow-y-auto border rounded-lg p-2 bg-gray-50">
            {filteredProducts.map(p => (
                <div key={p.id} onClick={() => handleProductSelect(p)} className={`flex justify-between items-center p-2 rounded-md hover:bg-blue-100 ${p.stock > 0 ? 'cursor-pointer' : 'cursor-not-allowed bg-red-50 text-gray-400'}`}>
                    <div>
                        <span>{p.name}</span>
                        {p.stock === 0 && <span className="text-xs text-red-500 ml-2">(Stok Habis)</span>}
                    </div>
                    <span className="font-semibold">{formatCurrency(getFinalPrice(p, 1))}</span>
                </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-inner border">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Pesanan Saat Ini</h3>
            <div className="h-48 overflow-y-auto mb-4">
                {cart.length === 0 ? <p className="text-gray-500">Belum ada barang.</p> :
                cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center mb-2">
                        <div>
                            <p>{item.product.name}</p>
                            <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(getFinalPrice(item.product, item.quantity))}</p>
                        </div>
                        <div className="flex items-center">
                            <p className="font-semibold mr-4">{formatCurrency(getFinalPrice(item.product, item.quantity) * item.quantity)}</p>
                            <button onClick={() => removeFromCart(item.product.id)}><TrashIcon className="h-5 w-5 text-red-500"/></button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-t pt-4">
                <div className="flex justify-between text-2xl font-bold mb-4">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {offlinePaymentMethods.map(method => (
                        <button key={method} onClick={() => setPaymentMethod(method)} className={`p-3 rounded-lg border text-center ${paymentMethod === method ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                            {method}
                        </button>
                    ))}
                </div>
                <button onClick={handlePayment} disabled={!paymentMethod || cart.length === 0 || isProcessingPayment} className="w-full bg-green-600 text-white font-bold p-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center">
                    <CreditCardIcon className="h-6 w-6 mr-2"/>
                    {isProcessingPayment ? 'MEMPROSES...' : 'PROSES PEMBAYARAN'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CashierPOS;