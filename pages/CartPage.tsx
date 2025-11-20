import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';
import { TrashIcon } from '../components/Icons';
import { getFinalPrice } from '../utils/pricing';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, setCurrentPage, applicationFee } = useAppContext();

  const subtotal = cart.reduce((sum, item) => sum + getFinalPrice(item.product, item.quantity) * item.quantity, 0);
  const total = subtotal + applicationFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-surface p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>
      {cart.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">Keranjang Anda kosong.</p>
          <button onClick={() => setCurrentPage(Page.HOME)} className="mt-4 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
            Mulai Belanja
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cart.map(item => {
              const finalPrice = getFinalPrice(item.product, item.quantity);
              const isDiscounted = finalPrice < item.product.sellingPrice;
              const isTierPrice = isDiscounted && item.product.priceTiers && item.product.priceTiers.length > 0;

              return (
                <div key={item.product.id} className="flex items-center border-b py-4 last:border-b-0">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-gray-600">{formatCurrency(finalPrice)} <span className="text-sm">/ {item.product.unitName}</span></p>
                        {isDiscounted && (
                            <p className="text-sm text-gray-400 line-through">{formatCurrency(item.product.sellingPrice)}</p>
                        )}
                    </div>
                     {isTierPrice && (
                        <p className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            Harga grosir diterapkan!
                        </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value))}
                      min="1"
                      className="w-16 p-2 bg-white border rounded-md text-center"
                    />
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 p-2">
                      <TrashIcon className="h-6 w-6"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {applicationFee > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Aplikasi</span>
                  <span>{formatCurrency(applicationFee)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t mt-4">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <button onClick={() => setCurrentPage(Page.CHECKOUT)} className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-primary-hover">
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;