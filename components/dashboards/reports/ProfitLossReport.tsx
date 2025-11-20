import React, { useState, useEffect } from 'react';
import { Order, Product } from '../../../types';
import { api } from '../../../services/api';

interface ChartDataItem {
    label: string;
    value: number;
    color: string;
}

const SimpleBarChart: React.FC<{ data: ChartDataItem[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="w-full h-72 bg-gray-50 p-4 rounded-lg border flex items-end justify-around gap-4">
            {data.map(item => (
                <div key={item.label} className="flex flex-col items-center h-full w-1/4 text-center">
                    <div className="text-xs font-bold text-gray-700 mb-1">{formatCurrency(item.value)}</div>
                    <div className="w-full h-full flex items-end">
                        <div
                            className={`w-full rounded-t-md ${item.color} hover:opacity-90 transition-opacity`}
                            style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                            title={`${item.label}: ${formatCurrency(item.value)}`}
                        ></div>
                    </div>
                    <div className="text-sm font-semibold mt-2 text-gray-600">{item.label}</div>
                </div>
            ))}
        </div>
    );
};


const ProfitLossReport: React.FC = () => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [reportData, setReportData] = useState({ revenue: 0, cogs: 0, grossProfit: 0 });
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [fetchedOrders, fetchedProducts] = await Promise.all([
                    api.fetchAllOrders(),
                    api.fetchProducts()
                ]);
                setAllOrders(fetchedOrders);
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Failed to load data for report", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        let filtered = [...allOrders];
        if (startDate) {
            filtered = filtered.filter(o => new Date(o.date) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter(o => new Date(o.date) <= new Date(endDate + 'T23:59:59'));
        }

        const revenue = filtered.reduce((sum, order) => sum + order.total, 0);

        const cogs = filtered.reduce((totalCogs, order) => {
            const orderCogs = order.items.reduce((itemCogs, item) => {
                const product = products.find(p => p.id === item.product.id);
                // Use the costPrice from the main product list for calculation
                const cost = product ? product.costPrice : 0;
                return itemCogs + (cost * item.quantity);
            }, 0);
            return totalCogs + orderCogs;
        }, 0);

        const grossProfit = revenue - cogs;
        
        setReportData({ revenue, cogs, grossProfit });

    }, [startDate, endDate, allOrders, products]);
    
    const { revenue, cogs, grossProfit } = reportData;
    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const handlePrint = () => {
        window.print();
    };

    const chartData: ChartDataItem[] = [
        { label: 'Pendapatan', value: revenue, color: 'bg-blue-500' },
        { label: 'HPP', value: cogs, color: 'bg-red-500' },
        { label: 'Laba Kotor', value: grossProfit, color: 'bg-green-500' }
    ];

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
                <h3 className="text-xl font-semibold">Laporan Laba Rugi</h3>
                <button onClick={handlePrint} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover text-sm">Cetak Laporan</button>
            </div>
            
            <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg border mb-6 no-print">
                <div>
                    <label htmlFor="plStartDate" className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                    <input type="date" id="plStartDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                    <label htmlFor="plEndDate" className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                    <input type="date" id="plEndDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 p-2 border rounded-md"/>
                </div>
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">Reset</button>
            </div>

            <div className="printable-area">
                <div className="mb-6 p-4 bg-white rounded-lg border">
                    <h2 className="text-2xl font-bold text-center mb-2">Laporan Laba Rugi</h2>
                    <p className="text-center text-sm text-gray-500">
                        Periode: {startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - {endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Waktu'}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-800">Total Pendapatan</h4>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(revenue)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="text-sm font-semibold text-red-800">Total HPP (COGS)</h4>
                        <p className="text-2xl font-bold text-red-900">{formatCurrency(cogs)}</p>
                    </div>
                     <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-800">Laba Kotor</h4>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(grossProfit)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="text-sm font-semibold text-purple-800">Margin Laba Kotor</h4>
                        <p className="text-2xl font-bold text-purple-900">{grossProfitMargin.toFixed(2)}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-lg font-semibold mb-3">Rincian Laba Rugi</h4>
                        {loading ? <p>Memuat...</p> : (
                            <table className="min-w-full">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-3 font-medium">Pendapatan Penjualan</td>
                                        <td className="py-3 text-right">{formatCurrency(revenue)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3 font-medium">Harga Pokok Penjualan (HPP)</td>
                                        <td className="py-3 text-right">({formatCurrency(cogs)})</td>
                                    </tr>
                                    <tr className="bg-gray-100">
                                        <td className="py-3 font-bold text-lg text-primary">Laba Kotor</td>
                                        <td className="py-3 text-right font-bold text-lg text-primary">{formatCurrency(grossProfit)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                         <p className="text-xs text-gray-500 mt-4 italic">*Laporan ini belum termasuk biaya operasional (misal: gaji, sewa, listrik) dan hanya menampilkan Laba Kotor.</p>
                    </div>
                     <div className="bg-white p-4 rounded-lg border">
                         <h4 className="text-lg font-semibold mb-3">Grafik Laba Rugi</h4>
                         {loading ? <p>Memuat...</p> : <SimpleBarChart data={chartData} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitLossReport;