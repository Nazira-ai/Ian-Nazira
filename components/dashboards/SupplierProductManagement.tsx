import React, { useState, useEffect, useCallback } from 'react';
import { Product, Supplier } from '../../types';
import { api } from '../../services/api';
import { PlusIcon, EditIcon } from '../Icons';
import SupplierProductForm from './SupplierProductForm';
import { useAppContext } from '../../context/AppContext';

const SupplierProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { currentUser } = useAppContext();

  const fetchProducts = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
        const currentSupplier = await api.fetchSupplierByUserId(currentUser.id);
        if (!currentSupplier) {
            throw new Error("Data supplier tidak ditemukan.");
        }
        setSupplier(currentSupplier);

        const allProducts = await api.fetchProducts();
        setProducts(allProducts.filter(p => p.supplierId === currentSupplier.id));
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data produk.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id'> | Product) => {
    setError(null);
    try {
      if ('id' in productData) {
        await api.updateProduct(productData);
      } else {
        await api.addProduct(productData);
      }
      setIsFormOpen(false);
      fetchProducts(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan produk.');
      console.error(err);
    }
  };
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  if (isFormOpen) {
    return (
      <SupplierProductForm
        productToEdit={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        error={error}
        supplier={supplier!}
      />
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Produk Saya</h3>
        <button
          onClick={handleAddClick}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Produk
        </button>
      </div>
      {loading && <p>Memuat...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Pokok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length > 0 ? products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(product.costPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatCurrency(product.sellingPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditClick(product)} className="text-indigo-600 hover:text-indigo-900">
                      <EditIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Anda belum menambahkan produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default SupplierProductManagement;
