import React, { useState, useEffect } from 'react';
import { Order, Page, User } from '../types';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { getFinalPrice } from '../utils/pricing';

interface InvoicePageProps {
  orderId: string;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ orderId }) => {
  const { setCurrentPage, logoUrl } = useAppContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndCustomer = async () => {
      setLoading(true);
      try {
        const fetchedOrder = await api.fetchOrderById(orderId);
        if (fetchedOrder) {
            setOrder(fetchedOrder);
            const allUsers = await api.fetchUsers();
            const orderCustomer = allUsers.find(u => u.id === fetchedOrder.userId) || null;
            setCustomer(orderCustomer);
        } else {
             setOrder(null);
        }
      } catch (error) {
        console.error("Failed to fetch invoice data:", error);
        setOrder(null);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderAndCustomer();
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-10">Membuat invoice...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-lg">Data pesanan tidak ditemukan.</p>
        <button onClick={() => setCurrentPage(Page.DASHBOARD)} className="mt-4 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
            Kembali ke Dashboard
        </button>
      </div>
    );
  }
  
  const subtotal = order.total - (order.applicationFee || 0);

  return (
    <>
      <style>{`
        @media print {
          body {
            background-color: #fff;
          }
          .no-print {
            display: none;
          }
          main.container {
            padding: 0;
            margin: 0;
          }
          .invoice-container {
            box-shadow: none;
            border: none;
            margin: 0;
            padding: 0;
            max-width: 100%;
          }
        }
      `}</style>
      <div className="no-print flex justify-end gap-2 mb-4">
         <button onClick={() => setCurrentPage(Page.DASHBOARD)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
            Kembali ke Pesanan Saya
        </button>
        <button onClick={() => window.print()} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">
            Cetak
        </button>
      </div>
      <div className="invoice-container bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto border">
        <header className="flex justify-between items-start pb-6 border-b">
            <div>
                <div className="flex items-center space-x-3 mb-2">
                     <img src={logoUrl} alt="Koperasi MASTER Logo" className="h-10 w-10 object-contain"/>
                    <h1 className="text-4xl font-bold text-primary">INVOICE</h1>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Koperasi MASTER</h2>
                <p className="text-sm text-gray-500">Jl. Banjaranyar - Pasiraman Km. 0,5 RT 03 RW 05</p>
                <p className="text-sm text-gray-500">Banjaranyar, Pekuncen, Banyumas, Jawa Tengah</p>
                <p className="text-sm text-gray-500">0852-2939-0451</p>
            </div>
            <div className="text-right">
                <p className="text-gray-600">Invoice #: <span className="font-semibold">{order.id.split('-')[1]}</span></p>
                <p className="text-gray-600">Tanggal: <span className="font-semibold">{formatDate(order.date)}</span></p>
            </div>
        </header>

        <section className="grid grid-cols-2 gap-8 my-8">
            <div>
                <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-2">Ditagihkan Kepada:</h3>
                <p className="font-bold text-lg text-gray-800">{customer?.fullName || 'Pelanggan'}</p>
                <p className="text-gray-600">{customer?.email}</p>
            </div>
             <div>
                <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-2">Dikirim Ke:</h3>
                <p className="text-gray-600">{order.shippingAddress || 'Alamat tidak tersedia'}</p>
            </div>
        </section>

        <section>
            <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-sm font-semibold uppercase text-gray-600">No.</th>
                        <th className="p-3 text-sm font-semibold uppercase text-gray-600">Deskripsi Item</th>
                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 text-center">Jumlah</th>
                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 text-right">Harga Satuan</th>
                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {order.items.map((item, index) => {
                        const unitPrice = getFinalPrice(item.product, item.quantity);
                        const totalPrice = unitPrice * item.quantity;
                        return (
                             <tr key={item.product.id}>
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3 font-medium">{item.product.name}</td>
                                <td className="p-3 text-center">{item.quantity} {item.product.unitName}</td>
                                <td className="p-3 text-right">{formatCurrency(unitPrice)}</td>
                                <td className="p-3 text-right">{formatCurrency(totalPrice)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </section>

        <section className="mt-8 flex justify-end">
            <div className="w-full max-w-sm space-y-2">
                 {order.applicationFee && order.applicationFee > 0 && (
                     <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                 )}
                 {order.applicationFee && order.applicationFee > 0 && (
                     <div className="flex justify-between text-gray-700">
                        <span>Biaya Aplikasi</span>
                        <span>{formatCurrency(order.applicationFee)}</span>
                    </div>
                 )}
                 <div className="flex justify-between text-lg font-bold text-gray-800 py-3 border-b-2 border-t-2">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                </div>
            </div>
        </section>
        
        <section className="mt-8">
             <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-2">Informasi Pembayaran</h3>
             <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-green-800">
                <p><span className="font-semibold">Metode:</span> {order.paymentMethod}</p>
                 {order.bankName && <p><span className="font-semibold">Bank:</span> {order.bankName}</p>}
                {order.digitalWalletProvider && <p><span className="font-semibold">Penyedia:</span> {order.digitalWalletProvider}</p>}
                <p><span className="font-semibold">Status:</span> LUNAS</p>
             </div>
        </section>

        <footer className="mt-12 text-center text-sm text-gray-500 border-t pt-6">
            <p>Terima kasih telah berbelanja di Koperasi MASTER!</p>
        </footer>
      </div>
    </>
  );
};

export default InvoicePage;