import React, { useState, useEffect } from 'react';
import { Purchase } from '../../../types';
import { api } from '../../../services/api';

const PurchaseReport: React.FC = () => {
    const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
    const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const loadPurchases = async () => {
            setLoading(true);
            try {
                const fetchedPurchases = await api.fetchPurchases();
                setAllPurchases(fetchedPurchases);
                setFilteredPurchases(fetchedPurchases);
            } catch (error) {
                console.error("Failed to load purchases for report", error);
            } finally {
                setLoading(false);
            }
        };
        loadPurchases();
    }, []);

    useEffect(() => {
        let purchases = [...allPurchases];
        if (startDate) {
            purchases = purchases.filter(p => new Date(p.date) >= new Date(startDate));
        }
        if (endDate) {
            purchases = purchases.filter(p => new Date(p.date) <= new Date(endDate + 'T23:59:59'));
        }
        setFilteredPurchases(purchases);
    }, [startDate, endDate, allPurchases]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const totalPurchaseCost = filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalItemsPurchased = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);

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
                <h3 className="text-xl font-semibold">Laporan Pembelian Barang</h3>
                <button onClick={handlePrint} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover text-sm">Cetak Laporan</button>
            </div>

            <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg border mb-6 no-print">
                <div>
                    <label htmlFor="purchaseStartDate" className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                    <input type="date" id="purchaseStartDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                    <label htmlFor="purchaseEndDate" className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                    <input type="date" id="purchaseEndDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 p-2 border rounded-md"/>
                </div>
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">Reset</button>
            </div>

            <div className="printable-area">
                <div className="mb-6 p-4 bg-white rounded-lg border">
                    <h2 className="text-2xl font-bold text-center mb-2">Laporan Pembelian</h2>
                    <p className="text-center text-sm text-gray-500">
                        Periode: {startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - {endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Waktu'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="text-sm font-semibold text-red-800">Total Biaya Pembelian</h4>
                        <p className="text-2xl font-bold text-red-900">{formatCurrency(totalPurchaseCost)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="text-sm font-semibold text-purple-800">Total Item Dibeli</h4>
                        <p className="text-2xl font-bold text-purple-900">{totalItemsPurchased.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <h4 className="text-lg font-semibold mb-3">Rincian Pembelian</h4>
                {loading ? <p>Memuat...</p> : (
                    <div className="overflow-x-auto border rounded-lg max-h-96">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Nama Produk</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Qty</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Harga Beli Satuan</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Total Biaya</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPurchases.length > 0 ? filteredPurchases.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(p.date)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{p.productName}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">{p.quantity}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(p.purchasePrice)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right font-bold">{formatCurrency(p.totalCost)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="text-center py-4 text-gray-500">Tidak ada data pembelian untuk periode ini.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseReport;
