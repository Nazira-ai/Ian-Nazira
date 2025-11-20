
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PaymentMethod, Page, Order, User, BankName, DigitalWalletProvider, DeliveryStatus } from '../types';
import { api } from '../services/api';
import { getFinalPrice } from '../utils/pricing';
import { XIcon } from '../components/Icons';

// Modal Component for Inputting Address
const AddressInputModal: React.FC<{
    onSave: (address: string) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [address, setAddress] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (address.trim()) {
            onSave(address);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-surface rounded-lg shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-primary">Lengkapi Alamat Pengiriman</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Kami tidak menemukan alamat tersimpan di profil Anda. Silakan masukkan alamat pengiriman untuk melanjutkan dan menyimpannya ke profil Anda.
                </p>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary mb-4"
                        placeholder="Masukkan alamat lengkap..."
                        autoFocus
                        required
                    />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            Nanti
                        </button>
                        <button type="submit" className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-hover font-bold">
                            Simpan Alamat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CheckoutPage: React.FC = () => {
    const { 
      cart, 
      clearCart, 
      setCurrentPage, 
      currentUser,
      updateCurrentUser,
      enabledPaymentMethods, 
      bankDetails, 
      showToast,
      enabledBanks,
      enabledDigitalWallets,
      applicationFee,
    } = useAppContext();
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | ''>('');
    const [selectedBank, setSelectedBank] = useState<BankName | ''>('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Initialize address from user profile if available
    const [shippingAddress, setShippingAddress] = useState(currentUser?.location || '');
    const [showAddressModal, setShowAddressModal] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + getFinalPrice(item.product, item.quantity) * item.quantity, 0);
    const total = subtotal + applicationFee;
    
    const isWalletConfigured = currentUser?.digitalWalletProvider && currentUser.digitalWalletBalance !== undefined;
    const isWalletBalanceSufficient = isWalletConfigured && currentUser.digitalWalletBalance! >= total;

    // Check if address is empty on load
    useEffect(() => {
        if (currentUser) {
            if (currentUser.location) {
                setShippingAddress(currentUser.location);
            } else {
                // If no location in profile, show modal
                setShowAddressModal(true);
            }
        }
    }, [currentUser]);

    const handleSaveAddressFromModal = async (newAddress: string) => {
        setShippingAddress(newAddress);
        if (currentUser) {
            try {
                // Update user profile locally and via API
                const updatedUser = { ...currentUser, location: newAddress };
                await api.updateUser(updatedUser);
                updateCurrentUser(updatedUser);
                showToast('Alamat berhasil disimpan ke profil.', 'success');
            } catch (error) {
                console.error("Failed to update user address", error);
                // Still set the local state so they can proceed
            }
        }
        setShowAddressModal(false);
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayment) {
            showToast('Silakan pilih metode pembayaran.', 'error');
            return;
        }

        if (selectedPayment === PaymentMethod.BANK_TRANSFER && !selectedBank) {
            showToast('Silakan pilih bank tujuan.', 'error');
            return;
        }

        if (selectedPayment === PaymentMethod.DIGITAL_WALLET) {
            if (!isWalletConfigured) {
                showToast('Dompet digital Anda belum dikonfigurasi.', 'error');
                return;
            }
            if (!isWalletBalanceSufficient) {
                showToast('Saldo dompet digital tidak mencukupi.', 'error');
                return;
            }
        }
        
        if (!shippingAddress.trim()) {
            showToast('Alamat pengiriman harus diisi.', 'error');
            setShowAddressModal(true); // Re-open modal if they try to submit empty
            return;
        }

        if (!currentUser) {
            showToast('Error: Pengguna tidak ditemukan. Silakan login kembali.', 'error');
            setTimeout(() => {
              setCurrentPage(Page.LOGIN);
            }, 2000);
            return;
        }

        setIsProcessing(true);

        const newOrder: Order = {
            id: `order-${Date.now()}`,
            userId: currentUser.id,
            items: cart,
            total: total,
            applicationFee: applicationFee,
            paymentMethod: selectedPayment,
            ...(selectedPayment === PaymentMethod.BANK_TRANSFER && { bankName: selectedBank as BankName }),
            ...(selectedPayment === PaymentMethod.DIGITAL_WALLET && { digitalWalletProvider: currentUser.digitalWalletProvider }),
            date: new Date().toISOString(),
            shippingAddress: shippingAddress,
            shippingStatus: DeliveryStatus.AWAITING_ASSIGNMENT,
        };

        try {
            const savedOrder = await api.saveOrder(newOrder);

            // If payment is Digital Wallet, deduct balance
            if (selectedPayment === PaymentMethod.DIGITAL_WALLET && isWalletBalanceSufficient) {
                const newBalance = currentUser.digitalWalletBalance! - total;
                const updatedUserData: User = {
                    ...currentUser,
                    digitalWalletBalance: newBalance,
                };
                const updatedUser = await api.updateUser(updatedUserData);
                updateCurrentUser(updatedUser);
            }
            
            showToast(`Pembayaran berhasil! Invoice Anda sedang disiapkan.`, 'success');
            
            setTimeout(() => {
                clearCart();
                setCurrentPage(Page.INVOICE, savedOrder.id);
            }, 1500);

        } catch (error) {
            showToast('Terjadi kesalahan saat memproses pesanan.', 'error');
            setIsProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    
    const renderDigitalWalletInfo = () => {
        if (selectedPayment !== PaymentMethod.DIGITAL_WALLET) return null;
        
        if (!isWalletConfigured) {
            return (
                <div className="p-4 mt-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg text-sm text-yellow-800">
                    <p>Dompet digital belum terhubung.</p>
                    <button onClick={() => setCurrentPage(Page.PROFILE)} className="font-semibold underline hover:text-yellow-900">
                        Atur di halaman profil Anda.
                    </button>
                </div>
            );
        }
        
        return (
            <div className="p-4 mt-2 bg-blue-50 border-l-4 border-primary rounded-r-lg text-sm text-gray-800 space-y-2">
                <div className="flex justify-between">
                    <span className="font-semibold">Membayar dengan:</span>
                    <span>{currentUser.digitalWalletProvider}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Saldo Anda:</span>
                    <span>{formatCurrency(currentUser.digitalWalletBalance!)}</span>
                </div>
                <div className={`flex justify-between font-bold pt-2 border-t ${isWalletBalanceSufficient ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Status Saldo:</span>
                    <span>{isWalletBalanceSufficient ? 'Mencukupi' : 'Tidak Cukup'}</span>
                </div>
            </div>
        )
    };
    
    return (
        <div className="max-w-2xl mx-auto bg-surface p-8 rounded-lg shadow-xl">
            {showAddressModal && (
                <AddressInputModal 
                    onSave={handleSaveAddressFromModal} 
                    onClose={() => setShowAddressModal(false)} 
                />
            )}
            
            <h1 className="text-3xl font-bold mb-6 text-center">Pembayaran</h1>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-2">Ringkasan Pesanan</h2>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal Produk</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {applicationFee > 0 && (
                         <div className="flex justify-between text-sm text-gray-600">
                            <span>Biaya Aplikasi</span>
                            <span>{formatCurrency(applicationFee)}</span>
                        </div>
                    )}
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>

            <form onSubmit={handleCheckout}>
                 <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
                        {!currentUser?.location && (
                            <button 
                                type="button" 
                                onClick={() => setShowAddressModal(true)}
                                className="text-sm text-primary hover:underline"
                            >
                                Isi dari Profil
                            </button>
                        )}
                    </div>
                    <textarea
                        id="shippingAddress"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        rows={3}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        placeholder="Masukkan alamat lengkap Anda, termasuk nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, dan kode pos."
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {currentUser?.location 
                            ? "Alamat diambil dari profil Anda. Anda dapat mengubahnya untuk pesanan ini jika diperlukan."
                            : "Alamat ini akan digunakan untuk pengiriman pesanan ini."}
                    </p>
                </div>

                <h2 className="text-lg font-semibold mb-4">Pilih Metode Pembayaran</h2>
                <div className="space-y-3">
                    {enabledPaymentMethods.length > 0 ? enabledPaymentMethods.map(method => (
                        <div key={method}>
                            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-primary">
                                <input
                                    type="radio"
                                    name="payment"
                                    value={method}
                                    checked={selectedPayment === method}
                                    onChange={() => setSelectedPayment(method)}
                                    className="h-4 w-4 text-primary focus:ring-primary"
                                />
                                <span className="ml-3 font-medium">{method}</span>
                            </label>
                            {method === PaymentMethod.BANK_TRANSFER && selectedPayment === PaymentMethod.BANK_TRANSFER && (
                                <div className="p-4 mt-2 bg-blue-50 border-l-4 border-primary rounded-r-lg text-sm text-gray-800 space-y-3">
                                  {enabledBanks.length > 0 ? (
                                    <div>
                                      <label htmlFor="bank-select" className="block font-semibold mb-2">Pilih Bank:</label>
                                      <select id="bank-select" value={selectedBank} onChange={(e) => setSelectedBank(e.target.value as BankName)} className="w-full p-2 border rounded-md">
                                        <option value="" disabled>--Pilih Bank Tujuan--</option>
                                        {enabledBanks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                                      </select>
                                    </div>
                                  ) : (
                                    <p>Tidak ada bank yang tersedia saat ini.</p>
                                  )}
                                  {bankDetails && (
                                    <div>
                                        <p className="font-bold mb-1">Silakan transfer ke rekening berikut:</p>
                                        <p><strong>Bank:</strong> {bankDetails.bankName}</p>
                                        <p><strong>No. Rekening:</strong> {bankDetails.accountNumber}</p>
                                        <p><strong>Atas Nama:</strong> {bankDetails.accountHolder}</p>
                                    </div>
                                  )}
                                </div>
                            )}
                            {method === PaymentMethod.DIGITAL_WALLET && renderDigitalWalletInfo()}
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 p-4 bg-gray-100 rounded-md">Saat ini tidak ada metode pembayaran yang tersedia.</p>
                    )}
                </div>

                <p className="text-xs text-gray-500 mt-2">* COD hanya berlaku untuk wilayah tertentu.</p>
                
                <button 
                    type="submit" 
                    className="mt-8 w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-primary-hover disabled:bg-gray-400" 
                    disabled={
                        isProcessing || 
                        enabledPaymentMethods.length === 0 || 
                        (selectedPayment === PaymentMethod.DIGITAL_WALLET && !isWalletBalanceSufficient)
                    }
                >
                    {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
            </form>
        </div>
    );
};

export default CheckoutPage;
