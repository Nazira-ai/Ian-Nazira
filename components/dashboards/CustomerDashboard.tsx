
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Order, Page, DeliveryStatus } from '../../types';
import { api } from '../../services/api';

const ShippingStatusBadge: React.FC<{ status?: DeliveryStatus }> = ({ status }) => {
    if (!status) return null;
    
    const statusInfo = {
        [DeliveryStatus.AWAITING_ASSIGNMENT]: { text: 'Menunggu Kurir', color: 'bg-yellow-100 text-yellow-800' },
        [DeliveryStatus.PENDING_PICKUP]: { text: 'Akan Diambil Kurir', color: 'bg-blue-100 text-blue-800' },
        [DeliveryStatus.IN_TRANSIT]: { text: 'Dalam Perjalanan', color: 'bg-purple-100 text-purple-800' },
        [DeliveryStatus.DELIVERED]: { text: 'Terkirim', color: 'bg-green-100 text-green-800' },
        [DeliveryStatus.CANCELLED]: { text: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
    };
    
    const currentStatus = statusInfo[status];
    if (!currentStatus) return <span className="text-sm bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full">{status}</span>;
    
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${currentStatus.color}`}>{currentStatus.text}</span>;
}


const CustomerDashboard: React.FC = () => {
    const { currentUser, setCurrentPage } = useAppContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            if (currentUser) {
                setLoading(true);
                try {
                    const userOrders = await api.fetchOrdersByUserId(currentUser.id);
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadOrders();
    }, [currentUser]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-4">Akun Saya</h2>
      <div className="space-y-6">
        <div>
            <h3 className="font-semibold text-lg">Informasi Akun</h3>
            <div className="p-4 bg-gray-50 rounded-lg mt-2 border">
                <p><strong>Nama:</strong> {currentUser?.fullName}</p>
                <p><strong>Email:</strong> {currentUser?.email}</p>
            </div>
        </div>
        <div>
            <h3 className="font-semibold text-lg">Riwayat Pesanan</h3>
            <div className="mt-2 space-y-4">
               {loading ? (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 border">
                        <p>Memuat riwayat pesanan...</p>
                    </div>
                ) : orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.id} className="p-4 bg-white rounded-lg border shadow-sm">
                            <div className="flex justify-between items-start mb-3 border-b pb-2">
                                <div>
                                    <p className="font-bold text-gray-800">Pesanan #{order.id.split('-')[1]}</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                                </div>
                                <div className='text-right'>
                                    <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full mb-1 inline-block">{order.paymentMethod}</span>
                                    <br />
                                    <ShippingStatusBadge status={order.shippingStatus} />
                                </div>
                            </div>
                            <div className="mb-3 space-y-1">
                                <p className="text-sm text-gray-600">
                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                <p className="font-bold text-lg text-primary">Total: {formatCurrency(order.total)}</p>
                                <button
                                    onClick={() => setCurrentPage(Page.ORDER_DETAIL, order.id)}
                                    className="bg-primary text-white px-4 py-2 text-sm rounded-md hover:bg-primary-hover"
                                >
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 border">
                        <p>Tidak ada riwayat pesanan.</p>
                        <p className="text-sm">(Selesaikan transaksi untuk melihat riwayat pesanan Anda di sini)</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;