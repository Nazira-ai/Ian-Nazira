import React, { useState } from 'react';
import { Product, Page } from '../types';
import { useAppContext } from '../context/AppContext';
import { CheckIcon, CompareIcon, ShoppingCartIcon } from './Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setCurrentPage, addToCart, currentUser, addToCompare, compareItems } = useAppContext();
  const [added, setAdded] = useState(false);
  
  const isCompared = compareItems.some(p => p.id === product.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) {
      addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      alert("Silakan login untuk menambahkan barang ke keranjang.");
      setCurrentPage(Page.LOGIN);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(product);
  };

  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const discountedPrice = hasDiscount ? product.sellingPrice * (1 - product.discountPercent! / 100) : product.sellingPrice;
  const hasTiers = product.priceTiers && product.priceTiers.length > 0;

  return (
    <div 
      onClick={() => setCurrentPage(Page.PRODUCT_DETAIL, product.id)}
      className="bg-surface rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
        {product.stock === 0 && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Stok Habis</span>
          </div>
        )}
        {hasDiscount && !hasTiers && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discountPercent}%
          </div>
        )}
        {hasTiers && (
             <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                Grosir Tersedia
            </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
        <div className="mb-4">
            {hasDiscount && !hasTiers ? (
              <div>
                <p className="text-sm text-gray-500 line-through">{formatCurrency(product.sellingPrice)}</p>
                <p className="text-primary font-bold text-lg">{formatCurrency(discountedPrice)} <span className="text-sm font-normal text-gray-500">/ {product.unitName}</span></p>
              </div>
            ) : (
              <p className="text-primary font-bold text-lg">{formatCurrency(product.sellingPrice)} <span className="text-sm font-normal text-gray-500">/ {product.unitName}</span></p>
            )}
        </div>
        <div className="mt-auto flex items-center justify-between">
            <button
              onClick={handleAddToCart}
              disabled={added || product.stock === 0}
              className={`flex-grow text-sm font-semibold py-2 px-3 rounded-md transition-colors duration-200 ${
                added 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-white hover:bg-primary-hover disabled:bg-gray-400'
              }`}
            >
              {added ? (
                  <span className="flex items-center justify-center"><CheckIcon className="h-5 w-5 mr-1"/> Ditambahkan</span>
              ) : (
                <span className="flex items-center justify-center"><ShoppingCartIcon className="h-5 w-5 mr-1"/> Keranjang</span>
              )}
            </button>
            <button
              onClick={handleCompare}
              title={isCompared ? "Hapus dari perbandingan" : "Bandingkan produk"}
              className={`ml-2 p-2 rounded-md transition-colors duration-200 ${
                  isCompared ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <CompareIcon className="h-5 w-5"/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;