
import React, { useState, useEffect } from 'react';
import { Product, Purchase } from '../../types';
import { api } from '../../services/api';
import PurchaseHistoryTable from './PurchaseHistoryTable';

interface PurchasingManagementProps {
  setActiveTab: (tab: string) => void;
}

const PurchasingManagement: React.FC<PurchasingManagementProps> = ({ setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedProduct, setSearchedProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    qty: '',
    purchasePrice: '',
    sellingPrice: ''
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.fetchPurchases().then(setPurchases);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setSearchedProduct(null);
    setMessage({ type: '', text: '' });

    const product = await api.searchProductBySkuOrBarcode(searchTerm.trim());
    if (product) {
      setSearchedProduct(product);
      setPurchaseForm({
        qty: '1',
        purchasePrice: String(product.costPrice),
        sellingPrice: String(product.sellingPrice)
      });
    } else {
      setNotFound(true);
    }
    setIsSearching(false);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPurchaseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedProduct) return;

    const qty = parseInt(purchaseForm.qty, 10);
    const newCostPrice = parseFloat(purchaseForm.purchasePrice);
    const newSellingPrice = parseFloat(purchaseForm.sellingPrice);

    if (isNaN(qty) || qty <= 0 || isNaN(newCostPrice) || newCostPrice < 0 || isNaN(newSellingPrice) || newSellingPrice < 0) {
        setMessage({ type: 'error', text: 'Pastikan semua inputan (Qty, Harga Beli, Harga Jual) valid.' });
        return;
    }

    try {
        await api.recordPurchase({
            productId: searchedProduct.id,
            quantity: qty,
            newCostPrice: newCostPrice,
            newSellingPrice: newSellingPrice,
        });

        setMessage({ type: 'success', text: `Pembelian ${qty}x ${searchedProduct.name} berhasil dicatat. Stok & harga telah diperbarui.` });
        
        setSearchTerm('');
        setSearchedProduct(null);
        setNotFound(false);
        setPurchaseForm({ qty: '', purchasePrice: '', sellingPrice: '' });
        
        api.fetchPurchases().then(setPurchases);

    } catch(error) {
        setMessage({ type: 'error', text: 'Gagal mencatat pembelian. Silakan coba lagi.' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Pencatatan Pembelian Barang</h3>
      
      <form onSubmit={handleSearch} className="flex gap-2 items-start mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Masukkan SKU atau Barcode..."
          className="w-full p-2 bg-white border border-gray-300 rounded-md"
        />
        <button type="submit" disabled={isSearching} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover disabled:bg-gray-400">
          {isSearching ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {message.text && (
        <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
        </div>
      )}

      {notFound && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
            <p className="font-bold">Produk Tidak Ditemukan</p>
            <p>Produk dengan SKU/Barcode "{searchTerm}" tidak ada di database. Anda bisa menambahkannya terlebih dahulu.</p>
            <button onClick={() => setActiveTab('products')} className="mt-2 bg-yellow-500 text-white px-4 py-1 rounded-md text-sm hover:bg-yellow-600">
                Buka Manajemen Stok
            </button>
        </div>
      )}

      {searchedProduct && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 animate-fade-in-up">
            <h4 className="text-lg font-bold text-primary mb-4">Detail Produk Ditemukan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-500">Nama Produk</p>
                    <p className="font-semibold">{searchedProduct.name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Stok Saat Ini</p>
                    <p className="font-bold text-2xl">{searchedProduct.stock}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-500">Harga Jual Saat Ini</p>
                    <p className="font-bold text-2xl text-green-600">{formatCurrency(searchedProduct.sellingPrice)}</p>
                </div>
            </div>
            
            <form onSubmit={handleSavePurchase} className="space-y-4 border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="qty" className="block text-sm font-medium text-gray-700">Jumlah Masuk (Qty)</label>
                        <input type="number" name="qty" id="qty" value={purchaseForm.qty} onChange={handleFormChange} min="1" className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">Harga Beli Baru (per item)</label>
                        <input type="number" name="purchasePrice" id="purchasePrice" value={purchaseForm.purchasePrice} onChange={handleFormChange} min="0" className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">Harga Jual Baru (per item)</label>
                        <input type="number" name="sellingPrice" id="sellingPrice" value={purchaseForm.sellingPrice} onChange={handleFormChange} min="0" className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-green-600 text-white font-bold px-6 py-2 rounded-md hover:bg-green-700">
                        Simpan Pembelian
                    </button>
                </div>
            </form>
        </div>
      )}
      
      <PurchaseHistoryTable purchases={purchases} />

    </div>
  );
};

export default PurchasingManagement;