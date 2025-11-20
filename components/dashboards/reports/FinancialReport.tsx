import React, { useState, useEffect } from 'react';
import { Order, PaymentMethod } from '../../../types';
import { api } from '../../../services/api';

const FinancialReport: React.FC = () => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            try {
                const fetchedOrders = await api.fetchAllOrders();
                setAllOrders(fetchedOrders);
                setFilteredOrders(fetchedOrders);
            } catch (error) {
                console.error("Failed to load orders for report", error);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
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

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    
    const revenueByPaymentMethod = filteredOrders.reduce((acc, order) => {
        acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.total;
        return acc;
    }, {} as Record<PaymentMethod, number>);

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
                <h3 className="text-xl font-semibold">Laporan Keuangan</h3>
                <button onClick={handlePrint} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover text-sm">Cetak Laporan</button>
            </div>
            
             <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg border mb-6 no-print">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 p-2 border rounded-md"/>
                </div>
                 <button onClick={() => { setStartDate(''); setEndDate(''); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">Reset</button>
            </div>

            <div className="printable-area">
                <div className="mb-6 p-4 bg-white rounded-lg border">
                    <h2 className="text-2xl font-bold text-center mb-2">Laporan Keuangan</h2>
                    <p className="text-center text-sm text-gray-500">
                        Periode: {startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - {endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Waktu'}
                    </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                    <h4 className="text-sm font-semibold text-green-800 text-center uppercase">Total Pendapatan Kotor</h4>
                    <p className="text-4xl font-bold text-green-900 text-center mt-2">{formatCurrency(totalRevenue)}</p>
                </div>

                <h4 className="text-lg font-semibold mb-3">Rincian Pendapatan per Metode Pembayaran</h4>
                {loading ? <p>Memuat data...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Metode Pembayaran</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {/* FIX: Explicitly cast 'total' to number to fix TypeScript error where it was inferred as 'unknown'. */}
                                {Object.entries(revenueByPaymentMethod).map(([method, total]) => (
                                    <tr key={method}>
                                        <td className="px-4 py-2 whitespace-nowrap">{method}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">{formatCurrency(total as number)}</td>
                                    </tr>
                                ))}
                                {Object.keys(revenueByPaymentMethod).length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="text-center py-4 text-gray-500">Tidak ada data pendapatan untuk periode ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialReport;