import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { api } from '../../../services/api';
import { useAppContext } from '../../../context/AppContext';

const InventoryReport: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { lowStockThreshold } = useAppContext();

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const fetchedProducts = await api.fetchProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Failed to load products for report", error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const totalInventoryValue = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
    const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="animate-fade-in-up">
            <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .printable-area, .printable-area * {
                    visibility: visible;
                  }
                  .printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                  .no-print {
                      display: none;
                  }
                }
            `}</style>
            
            <div className="flex justify-between items-center mb-4 no-print">
                <h3 className="text-xl font-semibold">Laporan Stok Barang</h3>
                <button onClick={handlePrint} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover text-sm">Cetak Laporan</button>
            </div>
            
            <div className="printable-area">
                <div className="mb-6 p-4 bg-white rounded-lg border">
                    <h2 className="text-2xl font-bold text-center mb-2">Laporan Stok Barang</h2>
                    <p className="text-center text-sm text-gray-500">Per Tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-800">Total Nilai Inventaris (By Harga Pokok)</h4>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalInventoryValue)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-800">Total Item dalam Stok</h4>
                        <p className="text-2xl font-bold text-green-900">{totalItems.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                {loading ? <p>Memuat data...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Nama Produk</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Barcode</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Stok</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Harga Pokok</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Harga Jual</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Nilai Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map(p => (
                                    <tr key={p.id} className={`${p.stock < lowStockThreshold && p.stock > 0 ? 'bg-yellow-50' : p.stock === 0 ? 'bg-red-50 text-gray-500' : ''}`}>
                                        <td className="px-4 py-2 whitespace-nowrap">{p.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap font-mono text-sm">{p.barcode}</td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-right font-bold ${p.stock < lowStockThreshold && p.stock > 0 ? 'text-yellow-700' : p.stock === 0 ? 'text-red-700' : ''}`}>{p.stock}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(p.costPrice)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(p.sellingPrice)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">{formatCurrency(p.costPrice * p.stock)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryReport;