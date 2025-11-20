import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { getFinalPrice } from '../utils/pricing';

interface ProductDetailPageProps {
  productId: number;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  const { addToCart, currentUser, showToast } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const fetchedProduct = await api.fetchProductById(productId);
      setProduct(fetchedProduct || null);
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product && currentUser) {
      addToCart(product, quantity);
      showToast(`${quantity}x ${product.name} telah ditambahkan ke keranjang.`, 'success');
    } else if (!currentUser) {
        showToast('Anda harus login untuk menambahkan barang ke keranjang.', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-10">Memuat detail produk...</div>;
  }

  if (!product) {
    return <div className="text-center py-10 text-red-500">Produk tidak ditemukan.</div>;
  }
  
  const finalPrice = getFinalPrice(product, 1);
  const hasDiscount = finalPrice < product.sellingPrice;
  const hasTiers = product.priceTiers && product.priceTiers.length > 0;

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <img src={product.imageUrl} alt={product.name} className="w-full h-auto rounded-lg shadow-md" />
           {product.discountPercent && product.discountPercent > 0 && !hasTiers && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-lg font-bold px-4 py-2 rounded-md">
              -{product.discountPercent}%
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Spesifikasi</h3>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md">
              {Object.entries(product.specifications).map(([key, value]) => (
                <li key={key} className="text-gray-700">
                  <span className="font-semibold">{key}:</span> {value}
                </li>
              ))}
            </ul>
          </div>
          {hasTiers && (
             <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Harga Grosir</h3>
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <table className="w-full text-sm">
                        <tbody>
                             <tr className="border-b">
                                <td className="py-1">Harga Satuan</td>
                                <td className="py-1 text-right font-semibold">{formatCurrency(product.sellingPrice)}</td>
                            </tr>
                            {[...product.priceTiers].sort((a,b) => a.minQuantity - b.minQuantity).map(tier => (
                                <tr key={tier.minQuantity} className="border-b last:border-0">
                                    <td className="py-1">Beli min. {tier.minQuantity} {product.unitName}</td>
                                    <td className="py-1 text-right font-semibold text-green-700">{formatCurrency(tier.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}
          <div className="mb-6">
            {hasDiscount && !hasTiers ? (
              <div className="flex items-baseline gap-4">
                <p className="text-2xl text-gray-500 line-through">{formatCurrency(product.sellingPrice)}</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(finalPrice)} <span className="text-lg font-normal text-gray-500">/ {product.unitName}</span></p>
              </div>
            ) : (
               <p className="text-4xl font-bold text-primary">{formatCurrency(product.sellingPrice)} <span className="text-lg font-normal text-gray-500">/ {product.unitName}</span></p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={product.stock}
              className="w-20 p-2 bg-white border border-gray-300 rounded-md text-center"
            />
            <button
              onClick={handleAddToCart}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-hover disabled:bg-gray-400"
              disabled={!currentUser || product.stock === 0}
            >
              {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
          </div>
          {!currentUser && <p className="text-sm text-red-500 mt-2">Silakan login untuk membeli.</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;