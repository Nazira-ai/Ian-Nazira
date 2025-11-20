

import React, { useState, useEffect } from 'react';
import { Order, Page, User } from '../types';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { getFinalPrice } from '../utils/pricing';

interface OrderDetailsPageProps {
  orderId: string;
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId }) => {
  const { setCurrentPage } = useAppContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [courier, setCourier] = useState<User | null>(null);


  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const fetchedOrder = await api.fetchOrderById(orderId);
        setOrder(fetchedOrder || null);
        if (fetchedOrder?.shippingProviderId) {
            const users = await api.fetchUsers();
            setCourier(users.find(u => u.id === fetchedOrder.shippingProviderId) || null);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-10">Memuat detail pesanan...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-lg">Pesanan tidak ditemukan.</p>
        <button onClick={() => setCurrentPage(Page.DASHBOARD)} className="mt-4 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
            Kembali ke Dashboard
        </button>
      </div>
    );
  }
  
  const subtotal = order.total - (order.applicationFee || 0);

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-4 border-b pb-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">Detail Pesanan</h1>
            <p className="text-gray-600">Pesanan #{order.id.split('-')[1]}</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setCurrentPage(Page.DASHBOARD)} className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                Kembali
            </button>
             <button onClick={() => setCurrentPage(Page.INVOICE, order.id)} className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">
                Cetak Invoice
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Tanggal Pesanan</h3>
            <p>{formatDate(order.date)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Info Pembayaran</h3>
            <p>{order.paymentMethod}</p>
            {order.bankName && <p className="text-sm text-gray-600">Bank: {order.bankName}</p>}
            {order.digitalWalletProvider && <p className="text-sm text-gray-600">Penyedia: {order.digitalWalletProvider}</p>}
        </div>
      </div>
      
      {order.shippingStatus && (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Informasi Pengiriman</h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 border">
                <p><strong>Status:</strong> <span className="font-semibold text-primary">{order.shippingStatus || 'N/A'}</span></p>
                <p><strong>Alamat:</strong> {order.shippingAddress || 'N/A'}</p>
                <p><strong>Kurir:</strong> {courier?.fullName || 'Belum Ditugaskan'}</p>
                <p><strong>No. Resi:</strong> {order.trackingNumber || 'Belum Tersedia'}</p>
            </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Ringkasan Item</h2>
        <div className="space-y-4">
          {order.items.map(item => {
             const finalPrice = getFinalPrice(item.product, item.quantity);
             return(
                <div key={item.product.id} className="flex items-center border rounded-lg p-3">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />
                    <div className="ml-4 flex-grow">
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">
                            {item.quantity} x {formatCurrency(finalPrice)}
                        </p>
                    </div>
                    <div className="font-semibold">
                        {formatCurrency(finalPrice * item.quantity)}
                    </div>
                </div>
             )
            })}
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                 {order.applicationFee && order.applicationFee > 0 && (
                   <>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex justify-between text-gray-600">
                      <span>Biaya Aplikasi:</span>
                      <span>{formatCurrency(order.applicationFee)}</span>
                    </div>
                   </>
                )}
                <div className="flex justify-between font-bold text-2xl text-primary">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;