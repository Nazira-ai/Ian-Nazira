import React from 'react';
import { Purchase } from '../../types';

interface PurchaseHistoryTableProps {
  purchases: Purchase[];
}

const PurchaseHistoryTable: React.FC<PurchaseHistoryTableProps> = ({ purchases }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Riwayat Pembelian Barang</h3>
        <div className="overflow-x-auto border rounded-lg max-h-96">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100 sticky top-0">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Nama Produk</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Harga Beli</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {purchases.length > 0 ? purchases.map(p => (
                        <tr key={p.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(p.date)}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{p.productName}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">{p.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(p.purchasePrice)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right font-bold">{formatCurrency(p.totalCost)}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="text-center py-4 text-gray-500">Belum ada riwayat pembelian.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default PurchaseHistoryTable;