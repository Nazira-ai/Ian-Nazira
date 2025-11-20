import React, { useState, useEffect, useCallback } from 'react';
import { Product, Role } from '../../types';
import { api } from '../../services/api';
import { PlusIcon, EditIcon, TrashIcon, StarIcon, CheckIcon } from '../Icons';
import ProductForm from './ProductForm';
import { useAppContext } from '../../context/AppContext';

interface ProductStockManagementProps {
  userRole: Role;
}

const ProductStockManagement: React.FC<ProductStockManagementProps> = ({ userRole }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { featuredProductId, setFeaturedProductId } = useAppContext();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allProducts = await api.fetchProducts();
      setProducts(allProducts);
    } catch (err) {
      setError('Gagal memuat data produk.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleDelete = async (productId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await api.deleteProduct(productId);
        fetchProducts(); // Refresh list
      } catch (err) {
        setError('Gagal menghapus produk.');
        console.error(err);
      }
    }
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

  const handleFeatureClick = (productId: number) => {
    if (featuredProductId === productId) {
      setFeaturedProductId(null);
    } else {
      setFeaturedProductId(productId);
    }
  };

  if (isFormOpen) {
    return (
      <ProductForm
        productToEdit={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        error={error}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Daftar Produk & Stok</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Grosir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Unggulan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length > 0 ? products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(product.sellingPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {product.priceTiers && product.priceTiers.length > 0 ? (
                      <CheckIcon className="h-6 w-6 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.unitName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{product.sku || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.barcode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleFeatureClick(product.id)}
                      title={featuredProductId === product.id ? "Hapus dari Unggulan" : "Jadikan Unggulan"}
                      className="p-1"
                    >
                      <StarIcon className={`h-6 w-6 transition-colors duration-200 ${
                          featuredProductId === product.id
                              ? 'text-yellow-400 hover:text-yellow-500'
                              : 'text-gray-300 hover:text-yellow-400'
                      }`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditClick(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <EditIcon className="h-5 w-5" />
                    </button>
                    {userRole === Role.SUPER_ADMIN && (
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data produk.
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

export default ProductStockManagement;