
import React, { useState, useEffect, useCallback } from 'react';
import { Order, DeliveryStatus } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const ShippingDashboard: React.FC = () => {
    const { currentUser, showToast } = useAppContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignedOrders = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const allOrders = await api.fetchAllOrders();
            const assigned = allOrders.filter(o => 
                o.shippingProviderId === currentUser.id && 
                (o.shippingStatus === DeliveryStatus.PENDING_PICKUP || o.shippingStatus === DeliveryStatus.IN_TRANSIT)
            );
            setOrders(assigned.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        } catch (error) {
            console.error("Failed to fetch assigned orders", error);
            showToast('Gagal memuat pesanan.', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentUser, showToast]);

    useEffect(() => {
        fetchAssignedOrders();
    }, [fetchAssignedOrders]);

    const handleUpdateStatus = async (order: Order, newStatus: DeliveryStatus) => {
        try {
            const updatedOrder = { ...order, shippingStatus: newStatus };
            await api.updateOrder(updatedOrder);
            showToast(`Status pesanan #${order.id.split('-')[1]} diperbarui.`, 'success');
            fetchAssignedOrders(); // Refresh list
        } catch (error) {
            showToast('Gagal memperbarui status pesanan.', 'error');
        }
    };

    const ordersToPickup = orders.filter(o => o.shippingStatus === DeliveryStatus.PENDING_PICKUP);
    const ordersInTransit = orders.filter(o => o.shippingStatus === DeliveryStatus.IN_TRANSIT);

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Dashboard Pengiriman</h2>
            {loading ? <p>Memuat pesanan...</p> : (
                <div className="space-y-8">
                    {/* Orders to Pick Up */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Pesanan untuk Di-pickup ({ordersToPickup.length})</h3>
                        {ordersToPickup.length > 0 ? (
                            <div className="space-y-4">
                                {ordersToPickup.map(order => (
                                    <div key={order.id} className="p-4 bg-white rounded-lg border shadow-sm">
                                        <p className="font-bold">Order #{order.id.split('-')[1]}</p>
                                        <p className="text-sm text-gray-600">Alamat: {order.shippingAddress}</p>
                                        <button 
                                            onClick={() => handleUpdateStatus(order, DeliveryStatus.IN_TRANSIT)}
                                            className="mt-2 bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700">
                                            Ambil Pesanan
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500">Tidak ada pesanan yang perlu di-pickup.</p>}
                    </div>

                    {/* Orders in Transit */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Pesanan Dalam Perjalanan ({ordersInTransit.length})</h3>
                         {ordersInTransit.length > 0 ? (
                            <div className="space-y-4">
                                {ordersInTransit.map(order => (
                                    <div key={order.id} className="p-4 bg-white rounded-lg border shadow-sm">
                                        <p className="font-bold">Order #{order.id.split('-')[1]}</p>
                                        <p className="text-sm text-gray-600">Alamat: {order.shippingAddress}</p>
                                        <button 
                                            onClick={() => handleUpdateStatus(order, DeliveryStatus.DELIVERED)}
                                            className="mt-2 bg-green-600 text-white px-4 py-2 text-sm rounded-md hover:bg-green-700">
                                            Selesaikan Pengiriman
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500">Tidak ada pesanan dalam perjalanan.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShippingDashboard;
