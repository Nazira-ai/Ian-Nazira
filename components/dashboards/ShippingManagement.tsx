
import React, { useState, useEffect, useCallback } from 'react';
import { Order, User, Role, DeliveryStatus } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const AssignShippingModal: React.FC<{
    order: Order;
    couriers: User[];
    onClose: () => void;
    onAssign: (orderId: string, courierId: number) => void;
}> = ({ order, couriers, onClose, onAssign }) => {
    const [selectedCourier, setSelectedCourier] = useState<string>('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCourier) {
            onAssign(order.id, parseInt(selectedCourier, 10));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-bold">Tugaskan Kurir untuk Pesanan #{order.id.split('-')[1]}</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm mb-2"><strong>Alamat Tujuan:</strong> {order.shippingAddress}</p>
                    <label htmlFor="courier" className="block text-sm font-medium text-gray-700 mb-2">Pilih Jasa Pengiriman:</label>
                    <select
                        id="courier"
                        value={selectedCourier}
                        onChange={(e) => setSelectedCourier(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="" disabled>-- Pilih Kurir --</option>
                        {couriers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                    </select>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">Tugaskan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ShippingManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [couriers, setCouriers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderToAssign, setOrderToAssign] = useState<Order | null>(null);
    const { showToast } = useAppContext();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [allOrders, allUsers] = await Promise.all([
                api.fetchAllOrders(),
                api.fetchUsers()
            ]);
            
            const onlineOrders = allOrders.filter(o => o.shippingStatus);
            setOrders(onlineOrders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            const shippingUsers = allUsers.filter(u => u.role === Role.SHIPPING);
            setCouriers(shippingUsers);
            
        } catch (error) {
            console.error("Failed to fetch shipping data", error);
            showToast('Gagal memuat data pengiriman.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssignCourier = async (orderId: string, courierId: number) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        
        try {
            const updatedOrder: Order = {
                ...order,
                shippingProviderId: courierId,
                shippingStatus: DeliveryStatus.PENDING_PICKUP,
            };
            await api.updateOrder(updatedOrder);
            showToast('Kurir berhasil ditugaskan!', 'success');
            setOrderToAssign(null);
            fetchData(); // Refresh data
        } catch (error) {
             showToast('Gagal menugaskan kurir.', 'error');
        }
    };

    const getCourierName = (id?: number) => couriers.find(c => c.id === id)?.fullName || 'N/A';
    
    const statusColor = (status?: DeliveryStatus) => {
        switch (status) {
            case DeliveryStatus.AWAITING_ASSIGNMENT: return 'bg-yellow-100 text-yellow-800';
            case DeliveryStatus.PENDING_PICKUP: return 'bg-blue-100 text-blue-800';
            case DeliveryStatus.IN_TRANSIT: return 'bg-purple-100 text-purple-800';
            case DeliveryStatus.DELIVERED: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="animate-fade-in-up">
            {orderToAssign && (
                <AssignShippingModal 
                    order={orderToAssign}
                    couriers={couriers}
                    onClose={() => setOrderToAssign(null)}
                    onAssign={handleAssignCourier}
                />
            )}
            <h3 className="text-xl font-semibold mb-4">Manajemen Pengiriman</h3>
            {loading ? <p>Memuat...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kurir</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-4 py-2 font-mono text-sm">{order.id.split('-')[1]}</td>
                                    <td className="px-4 py-2 text-sm">{new Date(order.date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-4 py-2 text-sm max-w-xs truncate">{order.shippingAddress}</td>
                                    <td className="px-4 py-2 text-sm">{getCourierName(order.shippingProviderId)}</td>
                                    <td className="px-4 py-2"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(order.shippingStatus)}`}>{order.shippingStatus}</span></td>
                                    <td className="px-4 py-2 text-right">
                                        {order.shippingStatus === DeliveryStatus.AWAITING_ASSIGNMENT && (
                                            <button 
                                                onClick={() => setOrderToAssign(order)}
                                                className="bg-primary text-white px-3 py-1 text-xs rounded-md hover:bg-primary-hover">
                                                Tugaskan Kurir
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ShippingManagement;
