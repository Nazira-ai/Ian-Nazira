import React, { useState, useEffect } from 'react';
import { Order, User, Product } from '../../../types';
import { api } from '../../../services/api';

const SalesReport: React.FC = () => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [fetchedOrders, fetchedUsers] = await Promise.all([
                    api.fetchAllOrders(),
                    api.fetchUsers()
                ]);
                setAllOrders(fetchedOrders);
                setFilteredOrders(fetchedOrders);
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Failed to load data for report", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    
    useEffect(() => {
        let orders = [...allOrders];
        if (startDate) {
            orders = orders.filter(o => new Date(o.date) >= new Date(startDate));
        }
        if (endDate) {
            orders = orders.filter(o => new Date(o.date) <= new Date(endDate + 'T23:59:59'));
        }
        setFilteredOrders(orders);
    }, [startDate, endDate, allOrders]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getUserName = (userId: number) => {
        return users.find(u => u.id === userId)?.fullName || 'N/A';
    };

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const productsSold = filteredOrders
        .flatMap(o => o.items)
        .reduce((acc, item) => {
            acc[item.product.name] = (acc[item.product.name] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="animate-fade-in-up">
            <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .printable-area, .printable-area * { visibility: visible; }
                  .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
                  .no-print { display: none; }
                }
            `}</style>
            
            <div className="flex justify-between items-center mb-4 no-print">
                <h3 className="text-xl font-semibold">Laporan Penjualan</h3>
                <button onClick={handlePrint} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover text-sm">Cetak Laporan</button>
            </div>
            
            <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg border mb-6 no-print">
                <div>
                    <label htmlFor="salesStartDate" className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                    <input type="date" id="salesStartDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                    <label htmlFor="salesEndDate" className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                    <input type="date" id="salesEndDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 p-2 border rounded-md"/>
                </div>
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">Reset</button>
            </div>
            
            <div className="printable-area">
                <div className="mb-6 p-4 bg-white rounded-lg border">
                    <h2 className="text-2xl font-bold text-center mb-2">Laporan Penjualan</h2>
                    <p className="text-center text-sm text-gray-500">
                        Periode: {startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - {endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Waktu'}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-800">Total Penjualan</h4>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-800">Jumlah Transaksi</h4>
                        <p className="text-2xl font-bold text-green-900">{totalOrders.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h4 className="text-lg font-semibold mb-3">Rincian Transaksi</h4>
                        {loading ? <p>Memuat...</p> : (
                             <div className="overflow-x-auto border rounded-lg max-h-96">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Pelanggan</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredOrders.length > 0 ? filteredOrders.map(o => (
                                            <tr key={o.id}>
                                                <td className="px-4 py-2 whitespace-nowrap font-mono text-sm">{o.id.split('-')[1]}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">{formatDate(o.date)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">{getUserName(o.userId)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">{formatCurrency(o.total)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="text-center py-4 text-gray-500">Tidak ada transaksi.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Produk Terlaris</h4>
                         <div className="overflow-x-auto border rounded-lg max-h-96">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Produk</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Terjual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {/* FIX: Explicitly cast sorting values to number to allow arithmetic operation. */}
                                    {Object.entries(productsSold).sort(([,a],[,b]) => (b as number) - (a as number)).map(([name, qty]) => (
                                         <tr key={name}>
                                            <td className="px-4 py-2 whitespace-nowrap">{name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right font-bold">{qty}</td>
                                        </tr>
                                    ))}
                                    {Object.keys(productsSold).length === 0 && !loading && (
                                        <tr><td colSpan={2} className="text-center py-4 text-gray-500">Belum ada produk terjual.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;